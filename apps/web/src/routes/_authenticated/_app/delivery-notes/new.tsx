import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postgres_db, schema, eq } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { toast } from 'sonner'
import { useState } from 'react'
import { ArrowLeftIcon, SaveIcon, Trash2Icon, PlusIcon } from 'lucide-react'

interface DeliveryNoteItem {
  article_name: string
  quantity_35: number
  quantity_65: number
  quantity_85: number
  unit_price_cents: number
}

function splitBestellnummer(nr: string): string[] {
  const digits = nr.replace(/\D/g, '').slice(0, 12)
  const chunks: string[] = []
  for (let i = 0; i < 12; i += 2) {
    chunks.push(digits.slice(i, i + 2))
  }
  return chunks
}

interface CreateDeliveryNoteInput {
  lieferschein_nr: string
  bestellnummer: string
  delivery_date: string
  notes: string
  items: DeliveryNoteItem[]
}

const getDefaultArticles = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await postgres_db
    .select()
    .from(schema.app_settings)
    .where(eq(schema.app_settings.setting_key, 'default_articles'))
    .limit(1)

  if (result.length > 0) {
    return result[0].setting_value as string[]
  }
  return [
    'Viola F1 WP T9',
    'Viola F1 ausgetopft',
    'Hornveilchen WP T9',
    'Hornveilchen ausgetopft',
    'Million Bells T12',
    'Million Bells Trio T12',
    'Heliotrop T12',
    'Diaskia T12',
    'Bacopa T12',
    'Diamond Frost T12',
    'Sanvitalia T12',
    'Nemesia T12',
    'Tapien T12',
    'Lobelia Richardii T12',
    'Euphorbia T12',
    'Tapien Trio T12',
    'Zonale T12',
    'Peltaten T12',
    'Lantanen T12',
    'Verbenen T12',
    'Neu Guinea Imp. T12',
  ]
})

const createDeliveryNote = createServerFn({ method: 'POST' })
  .validator((input: CreateDeliveryNoteInput) => input)
  .handler(async ({ data }) => {
    const [note] = await postgres_db
      .insert(schema.delivery_notes)
      .values({
        lieferschein_nr: data.lieferschein_nr || null,
        bestellnummer: data.bestellnummer || null,
        delivery_date: data.delivery_date,
        notes: data.notes || null,
      })
      .returning()

    const itemsWithData = data.items.filter(
      (item) => item.quantity_35 > 0 || item.quantity_65 > 0 || item.quantity_85 > 0 || item.unit_price_cents > 0,
    )

    if (itemsWithData.length > 0) {
      await postgres_db.insert(schema.delivery_note_items).values(
        itemsWithData.map((item, index) => ({
          delivery_note_id: note.id,
          article_name: item.article_name,
          quantity_35: item.quantity_35,
          quantity_65: item.quantity_65,
          quantity_85: item.quantity_85,
          unit_price_cents: item.unit_price_cents,
          sort_order: index,
        })),
      )
    }

    return note
  })

const NewDeliveryNotePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const today = new Date().toISOString().split('T')[0]
  const [lieferscheinNr, setLieferscheinNr] = useState('')
  const [bestellnummer, setBestellnummer] = useState('356585')
  const [deliveryDate, setDeliveryDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DeliveryNoteItem[]>([])
  const [customArticle, setCustomArticle] = useState('')

  const { data: defaultArticles } = useQuery({
    queryKey: ['default-articles'],
    queryFn: () => getDefaultArticles(),
  })

  const initializeItems = () => {
    if (defaultArticles && items.length === 0) {
      setItems(
        defaultArticles.map((name) => ({
          article_name: name,
          quantity_35: 0,
          quantity_65: 0,
          quantity_85: 0,
          unit_price_cents: 0,
        })),
      )
    }
  }

  console.log('defaultArticles', defaultArticles)
  if (defaultArticles && items.length === 0) {
    initializeItems()
  }

  const mutation = useMutation({
    mutationFn: (data: CreateDeliveryNoteInput) => createDeliveryNote({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] })
      toast.success('Lieferschein erstellt')
      navigate({ to: '/delivery-notes/overview' })
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`)
    },
  })

  const handleSubmit = () => {
    mutation.mutate({
      lieferschein_nr: lieferscheinNr,
      bestellnummer,
      delivery_date: deliveryDate,
      notes,
      items,
    })
  }

  const updateItem = (index: number, field: keyof DeliveryNoteItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const addCustomArticle = () => {
    if (!customArticle.trim()) return
    setItems((prev) => [
      ...prev,
      {
        article_name: customArticle.trim(),
        quantity_35: 0,
        quantity_65: 0,
        quantity_85: 0,
        unit_price_cents: 0,
      },
    ])
    setCustomArticle('')
  }

  const formatPrice = (cents: number) => {
    if (cents === 0) return ''
    return (cents / 100).toFixed(2)
  }

  const parsePrice = (value: string): number => {
    const cleaned = value.replace(',', '.')
    const parsed = Number.parseFloat(cleaned)
    if (Number.isNaN(parsed)) return 0
    return Math.round(parsed * 100)
  }

  const bestellChunks = splitBestellnummer(bestellnummer)

  const handleChunkChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 2)
    const chunks = splitBestellnummer(bestellnummer)
    chunks[index] = digits
    setBestellnummer(chunks.join(''))
  }

  return (
    <div className="flex-1 p-4 pb-24">
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/delivery-notes/overview' })}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">Neuer Lieferschein</h2>
        </div>

        {/* Row 1: Warenempfänger (left) + Lieferant (right) */}
        <div className="grid grid-cols-[1fr_1fr] gap-4">
          <div className="border border-black">
            <div className="border-b border-black bg-gray-50 px-3 py-1.5 text-center text-sm font-bold">
              Warenempfänger:
            </div>
            <div className="flex items-start gap-3 p-3">
              <div className="flex-1 text-xs leading-relaxed">
                <p>Loest Blumengrosshandel e.K.</p>
                <p>Kirchwerder Marschbahndamm 300</p>
                <p>21037 Hamburg</p>
              </div>
              <img src="/loest_logo.jpg" alt="Loest Logo" className="h-10 w-auto" />
            </div>
          </div>
          <div className="border border-black">
            <div className="border-b border-black bg-gray-50 px-3 py-1.5 text-center text-sm font-bold">
              Lieferant:
            </div>
            <div className="p-3 text-xs leading-relaxed">
              <p>Ralf Hitscher</p>
              <p>Süderquerweg 484</p>
              <p>21037 Hamburg</p>
            </div>
          </div>
        </div>

        {/* Row 2: Lieferschein Nr (left) + Datum (right) */}
        <div className="grid grid-cols-[1fr_1fr] gap-4">
          <div className="flex items-center gap-2 border border-black px-3 py-1.5">
            <span className="text-sm font-bold whitespace-nowrap">Lieferschein Nr:</span>
            <Input
              className="h-7 border-0 border-b border-black rounded-none shadow-none px-1 text-sm focus-visible:ring-0"
              placeholder="z.B. 2026-001"
              value={lieferscheinNr}
              onChange={(e) => setLieferscheinNr(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 border border-black px-3 py-1.5">
            <span className="text-sm font-bold whitespace-nowrap">Hamburg, den</span>
            <Input
              type="date"
              className="h-7 border-0 border-b border-black rounded-none shadow-none px-1 text-sm focus-visible:ring-0"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>
        </div>

        {/* Items table matching PDF layout */}
        <table className="w-full border-collapse text-sm">
          <thead>
            {/* Header row 1: column group labels */}
            <tr>
              <th className="border border-black px-2 py-1 text-left text-xs font-bold">
                Artikel und Topfgröße
              </th>
              <th colSpan={6} className="border border-black px-2 py-1 text-center text-xs font-bold">
                Stück / VPE
              </th>
              <th className="border-t border-l border-r border-black border-b-0 px-2 py-1 text-center text-xs font-bold">
                Netto
              </th>
            </tr>
            {/* Header row 2: Bestellnummer chunks */}
            <tr>
              <th className="border border-black px-2 py-1 text-left text-xs font-bold align-middle">
                Bestellnummer
              </th>
              {[0, 1, 2, 3, 4, 5].map((pos) => (
                <th key={`chunk${pos}`} className="border border-black p-0.5 text-center">
                  <Input
                    className="h-8 w-full border-0 shadow-none text-center text-lg font-extrabold px-0 focus-visible:ring-0"
                    inputMode="numeric"
                    maxLength={2}
                    value={bestellChunks[pos]}
                    onChange={(e) => handleChunkChange(pos, e.target.value)}
                  />
                </th>
              ))}
              <th className="border-b border-l border-r border-black border-t-0 px-2 py-1 text-center text-xs font-bold">
                Einzelpreis
                <br />
                in €
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.article_name} className="group">
                <td className="border border-black px-2 py-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>{item.article_name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2Icon className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                </td>
                <td className="border border-black px-1 py-1" />
                <td className="border border-black px-1 py-1" />
                <td className="border border-black px-1 py-1" />
                <td className="border border-black px-1 py-1" />
                <td className="border border-black px-1 py-1" />
                <td className="border border-black px-1 py-1" />
                <td className="border border-black px-1 py-0.5">
                  <Input
                    type="text"
                    inputMode="decimal"
                    className="h-7 w-full border-0 shadow-none text-right text-xs px-1 focus-visible:ring-0"
                    placeholder="0,00"
                    value={formatPrice(item.unit_price_cents)}
                    onChange={(e) => updateItem(index, 'unit_price_cents', parsePrice(e.target.value))}
                  />
                </td>
              </tr>
            ))}
            {/* Empty padding rows to match PDF (min 15 rows) */}
            {Array.from({ length: Math.max(0, 15 - items.length) }, (_, rowIdx) => {
              const key = `empty-row-${items.length + rowIdx}`
              return (
                <tr key={key}>
                  <td className="border border-black px-2 py-2.5 text-xs">&nbsp;</td>
                  <td className="border border-black px-1 py-2.5" />
                  <td className="border border-black px-1 py-2.5" />
                  <td className="border border-black px-1 py-2.5" />
                  <td className="border border-black px-1 py-2.5" />
                  <td className="border border-black px-1 py-2.5" />
                  <td className="border border-black px-1 py-2.5" />
                  <td className="border border-black px-1 py-2.5" />
                </tr>
              )
            })}

            <tr>
              <td colSpan={9} className="px-2 pb-2.5 text-xs text-center">
                <p className="mt-2 text-[10px]">Pflanzenpass: DE-HH1-110071</p>
              </td>
            </tr>

          </tbody>
        </table>

        {/* Add custom article */}
        <div className="flex gap-2">
          <Input
            placeholder="Neuen Artikel hinzufügen..."
            value={customArticle}
            onChange={(e) => setCustomArticle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomArticle()}
          />
          <Button variant="outline" size="icon" onClick={addCustomArticle}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Notes */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Notizen:</span>
          <Input
            placeholder="Optionale Notizen..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={mutation.isPending}>
            <SaveIcon className="mr-2 h-4 w-4" />
            {mutation.isPending ? 'Wird gespeichert...' : 'Lieferschein speichern'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_app/delivery-notes/new')({
  component: NewDeliveryNotePage,
})
