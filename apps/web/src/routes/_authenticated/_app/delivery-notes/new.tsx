import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postgres_db, schema, eq } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Label } from '~/lib/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/lib/components/ui/card'
import { Separator } from '~/lib/components/ui/separator'
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

interface CreateDeliveryNoteInput {
  lieferschein_nr: string
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

  return (
    <div className="flex-1 p-4 pb-24">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/delivery-notes/overview' })}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">Neuer Lieferschein</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kopfdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lieferschein_nr">Lieferschein Nr.</Label>
                <Input
                  id="lieferschein_nr"
                  placeholder="z.B. 2026-001"
                  value={lieferscheinNr}
                  onChange={(e) => setLieferscheinNr(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Datum</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <Input
                id="notes"
                placeholder="Optionale Notizen..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artikel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Desktop header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_70px_70px_70px_80px_40px] sm:gap-2 sm:px-1 sm:text-sm sm:font-medium sm:text-muted-foreground">
              <span>Artikel</span>
              <span className="text-center">35</span>
              <span className="text-center">65</span>
              <span className="text-center">85</span>
              <span className="text-center">&euro;</span>
              <span />
            </div>

            {items.map((item, index) => (
              <div key={item.article_name}>
                {/* Mobile layout */}
                <div className="flex flex-col gap-2 sm:hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.article_name}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(index)}>
                      <Trash2Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">35</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        className="h-9"
                        value={item.quantity_35 || ''}
                        onChange={(e) => updateItem(index, 'quantity_35', Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">65</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        className="h-9"
                        value={item.quantity_65 || ''}
                        onChange={(e) => updateItem(index, 'quantity_65', Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">85</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        className="h-9"
                        value={item.quantity_85 || ''}
                        onChange={(e) => updateItem(index, 'quantity_85', Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">&euro;</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="h-9"
                        placeholder="0,00"
                        value={formatPrice(item.unit_price_cents)}
                        onChange={(e) => updateItem(index, 'unit_price_cents', parsePrice(e.target.value))}
                      />
                    </div>
                  </div>
                  {index < items.length - 1 && <Separator className="mt-2" />}
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_70px_70px_70px_80px_40px] sm:items-center sm:gap-2">
                  <span className="truncate text-sm">{item.article_name}</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="h-8 text-center"
                    value={item.quantity_35 || ''}
                    onChange={(e) => updateItem(index, 'quantity_35', Number.parseInt(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="h-8 text-center"
                    value={item.quantity_65 || ''}
                    onChange={(e) => updateItem(index, 'quantity_65', Number.parseInt(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="h-8 text-center"
                    value={item.quantity_85 || ''}
                    onChange={(e) => updateItem(index, 'quantity_85', Number.parseInt(e.target.value) || 0)}
                  />
                  <Input
                    type="text"
                    inputMode="decimal"
                    className="h-8 text-center"
                    placeholder="0,00"
                    value={formatPrice(item.unit_price_cents)}
                    onChange={(e) => updateItem(index, 'unit_price_cents', parsePrice(e.target.value))}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(index)}>
                    <Trash2Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}

            <Separator />

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
          </CardContent>
        </Card>

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
