import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postgres_db, schema, eq } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { toast } from 'sonner'
import { useRef, useState } from 'react'
import { ArrowLeftIcon, SaveIcon, PlusIcon, PrinterIcon } from 'lucide-react'
import { LieferscheinForm } from './-components/LieferscheinForm'
import { PDFDownloadButton } from './$id/-components/PDFDownloadButton'
import { useReactToPrint } from 'react-to-print'

interface DeliveryNoteItem {
  article_name: string
  quantities: number[]
  unit_price_cents: number
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
      (item) => item.quantities.some((q) => q > 0) || item.unit_price_cents > 0,
    )

    if (itemsWithData.length > 0) {
      await postgres_db.insert(schema.delivery_note_items).values(
        itemsWithData.map((item, index) => ({
          delivery_note_id: note.id,
          article_name: item.article_name,
          quantities: item.quantities,
          unit_price_cents: item.unit_price_cents,
          sort_order: index,
        })),
      )
    }

    return note
  })

const NewDeliveryNotePage = () => {
  const DEFAULT_BESTELLNUMMER = '356585'

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const today = new Date().toISOString().split('T')[0]
  const [lieferscheinNr, setLieferscheinNr] = useState('')
  const [bestellnummer, setBestellnummer] = useState(DEFAULT_BESTELLNUMMER)
  const [deliveryDate, setDeliveryDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DeliveryNoteItem[]>([])
  const [customArticle, setCustomArticle] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: formRef,
    documentTitle: lieferscheinNr ? `Lieferschein-${lieferscheinNr}` : 'Lieferschein',
  })

  const { data: defaultArticles } = useQuery({
    queryKey: ['default-articles'],
    queryFn: () => getDefaultArticles(),
  })

  const initializeItems = () => {
    if (defaultArticles && items.length === 0) {
      setItems(
        defaultArticles.map((name) => ({
          article_name: name,
          quantities: [0, 0, 0, 0, 0, 0],
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

  const updateItemQuantity = (index: number, chunkIndex: number, value: number) => {
    setItems((prev) => {
      const updated = [...prev]
      const quantities = [...updated[index].quantities]
      quantities[chunkIndex] = value
      updated[index] = { ...updated[index], quantities }
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
        quantities: [0, 0, 0, 0, 0, 0],
        unit_price_cents: 0,
      },
    ])
    setCustomArticle('')
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

        <LieferscheinForm
          ref={formRef}
          lieferscheinNr={lieferscheinNr}
          onLieferscheinNrChange={setLieferscheinNr}
          bestellnummer={bestellnummer}
          onBestellnummerChange={setBestellnummer}
          deliveryDate={deliveryDate}
          onDeliveryDateChange={setDeliveryDate}
          items={items}
          onRemoveItem={removeItem}
          onUpdateItemQuantity={updateItemQuantity}
          onUpdateItemPrice={(index, cents) => updateItem(index, 'unit_price_cents', cents)}
        />

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
          <div className="flex gap-2">
            <Button className="flex-1" size="lg" onClick={handleSubmit} disabled={mutation.isPending}>
              <SaveIcon className="mr-2 h-4 w-4" />
              {mutation.isPending ? 'Wird gespeichert...' : 'Lieferschein speichern'}
            </Button>
            <Button variant="outline" size="lg" onClick={() => handlePrint()}>
              <PrinterIcon className="mr-2 h-4 w-4" />
              Drucken
            </Button>
            <PDFDownloadButton
              note={{
                lieferschein_nr: lieferscheinNr || null,
                bestellnummer: bestellnummer || null,
                delivery_date: deliveryDate,
                notes: notes || null,
                items,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_app/delivery-notes/new')({
  component: NewDeliveryNotePage,
})
