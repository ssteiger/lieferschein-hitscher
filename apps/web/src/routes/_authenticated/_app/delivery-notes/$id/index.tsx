import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postgres_db, schema, eq, asc } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Label } from '~/lib/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/lib/components/ui/card'
import { Separator } from '~/lib/components/ui/separator'
import { Skeleton } from '~/lib/components/ui/skeleton'
import { toast } from 'sonner'
import { useState } from 'react'
import { ArrowLeftIcon, SaveIcon, Trash2Icon, PlusIcon, PencilIcon } from 'lucide-react'
import { PDFDownloadButton } from './-components/PDFDownloadButton'

interface DeliveryNoteItem {
  id?: string
  article_name: string
  quantities: number[]
  unit_price_cents: number
}

interface UpdateDeliveryNoteInput {
  id: string
  lieferschein_nr: string
  bestellnummer: string
  delivery_date: string
  notes: string
  items: DeliveryNoteItem[]
}

const getDeliveryNote = createServerFn({ method: 'GET' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const [note] = await postgres_db
      .select()
      .from(schema.delivery_notes)
      .where(eq(schema.delivery_notes.id, data.id))
      .limit(1)

    if (!note) throw new Error('Lieferschein nicht gefunden')

    const items = await postgres_db
      .select()
      .from(schema.delivery_note_items)
      .where(eq(schema.delivery_note_items.delivery_note_id, data.id))
      .orderBy(asc(schema.delivery_note_items.sort_order))

    return { ...note, items }
  })

const updateDeliveryNote = createServerFn({ method: 'POST' })
  .validator((input: UpdateDeliveryNoteInput) => input)
  .handler(async ({ data }) => {
    const [note] = await postgres_db
      .update(schema.delivery_notes)
      .set({
        lieferschein_nr: data.lieferschein_nr || null,
        bestellnummer: data.bestellnummer || null,
        delivery_date: data.delivery_date,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      })
      .where(eq(schema.delivery_notes.id, data.id))
      .returning()

    await postgres_db
      .delete(schema.delivery_note_items)
      .where(eq(schema.delivery_note_items.delivery_note_id, data.id))

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

const deleteDeliveryNote = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await postgres_db
      .delete(schema.delivery_notes)
      .where(eq(schema.delivery_notes.id, data.id))
  })

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatPrice(cents: number) {
  if (cents === 0) return ''
  return (cents / 100).toFixed(2).replace('.', ',')
}

function formatPriceDisplay(cents: number) {
  if (cents === 0) return '—'
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`
}

function parsePrice(value: string): number {
  const cleaned = value.replace(',', '.')
  const parsed = Number.parseFloat(cleaned)
  if (Number.isNaN(parsed)) return 0
  return Math.round(parsed * 100)
}

function ReadOnlyView({
  note,
  onEdit,
  onDelete,
  isDeleting,
}: {
  note: { lieferschein_nr: string | null; bestellnummer: string | null; delivery_date: string; notes: string | null; items: DeliveryNoteItem[] }
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}) {
  const totalItems = note.items.reduce(
    (acc, item) => acc + item.quantities.reduce((sum, q) => sum + q, 0),
    0,
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Kopfdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Lieferschein Nr.</p>
              <p className="font-medium">{note.lieferschein_nr || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Bestellnummer</p>
              <p className="font-medium">{note.bestellnummer || '—'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Datum</p>
              <p className="font-medium">{formatDate(note.delivery_date)}</p>
            </div>
          </div>
          {note.notes && (
            <div>
              <p className="text-muted-foreground text-sm">Notizen</p>
              <p className="font-medium">{note.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artikel ({note.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {note.items.length > 0 ? (
            <div className="space-y-1">
              <div className="hidden sm:grid sm:grid-cols-[1fr_repeat(6,50px)_90px] sm:gap-2 sm:px-1 sm:pb-2 sm:text-sm sm:font-medium sm:text-muted-foreground">
                <span>Artikel</span>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-center">#{i + 1}</span>
                ))}
                <span className="text-right">Preis</span>
              </div>
              <Separator className="hidden sm:block" />
              {note.items.map((item) => (
                <div key={item.id ?? item.article_name}>
                  {/* Mobile */}
                  <div className="flex flex-col gap-1 py-2 sm:hidden">
                    <p className="text-sm font-medium">{item.article_name}</p>
                    <div className="text-muted-foreground flex gap-3 text-xs">
                      {[0, 1, 2, 3, 4, 5].map((pos) => item.quantities[pos] > 0 && <span key={`q${pos}`}>{item.quantities[pos]}</span>)}
                      {item.unit_price_cents > 0 && <span>{formatPriceDisplay(item.unit_price_cents)}</span>}
                    </div>
                  </div>
                  {/* Desktop */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_repeat(6,50px)_90px] sm:items-center sm:gap-2 sm:py-1.5">
                    <span className="truncate text-sm">{item.article_name}</span>
                    {[0, 1, 2, 3, 4, 5].map((pos) => (
                      <span key={`q${pos}`} className="text-center text-sm">{item.quantities[pos] || '—'}</span>
                    ))}
                    <span className="text-right text-sm">{formatPriceDisplay(item.unit_price_cents)}</span>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="text-muted-foreground pt-1 text-right text-sm">
                Gesamt: {totalItems} Stück
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Keine Artikel vorhanden.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1" size="lg" onClick={onEdit}>
          <PencilIcon className="mr-2 h-4 w-4" />
          Bearbeiten
        </Button>
        <PDFDownloadButton note={note} />
        <Button variant="destructive" size="lg" onClick={onDelete} disabled={isDeleting}>
          <Trash2Icon className="mr-2 h-4 w-4" />
          {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
        </Button>
      </div>
    </>
  )
}

function EditView({
  initialNote,
  onSave,
  onCancel,
  isSaving,
}: {
  initialNote: { lieferschein_nr: string | null; bestellnummer: string | null; delivery_date: string; notes: string | null; items: DeliveryNoteItem[] }
  onSave: (data: { lieferschein_nr: string; bestellnummer: string; delivery_date: string; notes: string; items: DeliveryNoteItem[] }) => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [lieferscheinNr, setLieferscheinNr] = useState(initialNote.lieferschein_nr || '')
  const [bestellnummer, setBestellnummer] = useState(initialNote.bestellnummer || '')
  const [deliveryDate, setDeliveryDate] = useState(initialNote.delivery_date)
  const [notes, setNotes] = useState(initialNote.notes || '')
  const [items, setItems] = useState<DeliveryNoteItem[]>(initialNote.items)
  const [customArticle, setCustomArticle] = useState('')

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
      { article_name: customArticle.trim(), quantities: [0, 0, 0, 0, 0, 0], unit_price_cents: 0 },
    ])
    setCustomArticle('')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Kopfdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lieferschein_nr">Lieferschein Nr.</Label>
              <Input id="lieferschein_nr" placeholder="z.B. 2026-001" value={lieferscheinNr} onChange={(e) => setLieferscheinNr(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bestellnummer">Bestellnummer</Label>
              <Input
                id="bestellnummer"
                inputMode="numeric"
                placeholder="Max. 12 Ziffern"
                maxLength={12}
                value={bestellnummer}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 12)
                  setBestellnummer(v)
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delivery_date">Datum</Label>
              <Input id="delivery_date" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Input id="notes" placeholder="Optionale Notizen..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artikel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden sm:grid sm:grid-cols-[1fr_repeat(6,50px)_80px_40px] sm:gap-2 sm:px-1 sm:text-sm sm:font-medium sm:text-muted-foreground">
            <span>Artikel</span>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-center">#{i + 1}</span>
            ))}
            <span className="text-center">&euro;</span>
            <span />
          </div>

          {items.map((item, index) => (
            <div key={item.id ?? item.article_name}>
              {/* Mobile layout */}
              <div className="flex flex-col gap-2 sm:hidden">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.article_name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(index)}>
                    <Trash2Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 4, 5].map((pos) => (
                    <div key={`chunk${pos}`}>
                      <Label className="text-xs text-muted-foreground">#{pos + 1}</Label>
                      <Input type="number" inputMode="numeric" min={0} className="h-9" value={item.quantities[pos] || ''} onChange={(e) => updateItemQuantity(index, pos, Number.parseInt(e.target.value) || 0)} />
                    </div>
                  ))}
                  <div>
                    <Label className="text-xs text-muted-foreground">&euro;</Label>
                    <Input type="text" inputMode="decimal" className="h-9" placeholder="0,00" value={formatPrice(item.unit_price_cents)} onChange={(e) => updateItem(index, 'unit_price_cents', parsePrice(e.target.value))} />
                  </div>
                </div>
                {index < items.length - 1 && <Separator className="mt-2" />}
              </div>

              {/* Desktop layout */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_repeat(6,50px)_80px_40px] sm:items-center sm:gap-2">
                <span className="truncate text-sm">{item.article_name}</span>
                {[0, 1, 2, 3, 4, 5].map((pos) => (
                  <Input key={`chunk${pos}`} type="number" inputMode="numeric" min={0} className="h-8 text-center" value={item.quantities[pos] || ''} onChange={(e) => updateItemQuantity(index, pos, Number.parseInt(e.target.value) || 0)} />
                ))}
                <Input type="text" inputMode="decimal" className="h-8 text-center" placeholder="0,00" value={formatPrice(item.unit_price_cents)} onChange={(e) => updateItem(index, 'unit_price_cents', parsePrice(e.target.value))} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(index)}>
                  <Trash2Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex gap-2">
            <Input placeholder="Neuen Artikel hinzufügen..." value={customArticle} onChange={(e) => setCustomArticle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomArticle()} />
            <Button variant="outline" size="icon" onClick={addCustomArticle}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" className="flex-1" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button
          className="flex-1"
          size="lg"
          onClick={() => onSave({ lieferschein_nr: lieferscheinNr, bestellnummer, delivery_date: deliveryDate, notes, items })}
          disabled={isSaving}
        >
          <SaveIcon className="mr-2 h-4 w-4" />
          {isSaving ? 'Wird gespeichert...' : 'Speichern'}
        </Button>
      </div>
    </>
  )
}

const DeliveryNoteDetailPage = () => {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)

  const { data: note, isLoading } = useQuery({
    queryKey: ['delivery-note', id],
    queryFn: () => getDeliveryNote({ data: { id } }),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDeliveryNoteInput) => updateDeliveryNote({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-note', id] })
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] })
      toast.success('Lieferschein aktualisiert')
      setEditing(false)
    },
    onError: (error) => {
      toast.error(`Fehler beim Speichern: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteDeliveryNote({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] })
      toast.success('Lieferschein gelöscht')
      navigate({ to: '/delivery-notes/overview' })
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`)
    },
  })

  if (isLoading) {
    return (
      <div className="flex-1 p-4 pb-24">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-lg font-medium">Lieferschein nicht gefunden</p>
        <Link to="/delivery-notes/overview">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 pb-24">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/delivery-notes/overview' })}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">
            {note.lieferschein_nr || 'Lieferschein'}
          </h2>
        </div>

        {editing ? (
          <EditView
            initialNote={note}
            isSaving={updateMutation.isPending}
            onCancel={() => setEditing(false)}
            onSave={(data) => updateMutation.mutate({ id, ...data })}
          />
        ) : (
          <ReadOnlyView
            note={note}
            onEdit={() => setEditing(true)}
            onDelete={() => deleteMutation.mutate()}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_app/delivery-notes/$id/')({
  component: DeliveryNoteDetailPage,
})
