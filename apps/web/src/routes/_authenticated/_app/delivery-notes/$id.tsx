import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eq, asc } from 'drizzle-orm'
import { postgres_db, schema } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Label } from '~/lib/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/lib/components/ui/card'
import { Separator } from '~/lib/components/ui/separator'
import { Skeleton } from '~/lib/components/ui/skeleton'
import { toast } from 'sonner'
import { useState } from 'react'
import { ArrowLeftIcon, SaveIcon, Trash2Icon, PlusIcon, PencilIcon, DownloadIcon } from 'lucide-react'

interface DeliveryNoteItem {
  id?: string
  article_name: string
  quantity_35: number
  quantity_65: number
  quantity_85: number
  unit_price_cents: number
}

interface UpdateDeliveryNoteInput {
  id: string
  lieferschein_nr: string
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

async function downloadPdf(note: {
  lieferschein_nr: string | null
  delivery_date: string
  notes: string | null
  items: DeliveryNoteItem[]
}) {
  const pdfMake = await import('pdfmake/build/pdfmake')
  await import('pdfmake/build/vfs_fonts')

  const itemRows = note.items.map((item) => [
    { text: item.article_name, fontSize: 9 },
    { text: item.quantity_35 || '', alignment: 'center' as const, fontSize: 9 },
    { text: item.quantity_65 || '', alignment: 'center' as const, fontSize: 9 },
    { text: item.quantity_85 || '', alignment: 'center' as const, fontSize: 9 },
    {
      text: item.unit_price_cents > 0
        ? (item.unit_price_cents / 100).toFixed(2).replace('.', ',')
        : '',
      alignment: 'right' as const,
      fontSize: 9,
    },
  ])

  const totalQuantity = note.items.reduce(
    (acc, item) => acc + item.quantity_35 + item.quantity_65 + item.quantity_85,
    0,
  )

  const docDefinition = {
    pageSize: 'A4' as const,
    pageMargins: [40, 40, 40, 60] as [number, number, number, number],
    content: [
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Lieferant:', fontSize: 8, color: '#666', margin: [0, 0, 0, 2] as [number, number, number, number] },
              { text: 'Loest Blumengrosshandel e.K.', fontSize: 10, bold: true },
              { text: 'Süderquerweg 484', fontSize: 9 },
              { text: '21037 Hamburg', fontSize: 9 },
            ],
          },
          {
            width: '*',
            stack: [
              { text: 'Warenempfänger:', fontSize: 8, color: '#666', margin: [0, 0, 0, 2] as [number, number, number, number] },
              { text: 'Ralf Hitscher', fontSize: 10, bold: true },
              { text: 'Kirchwerder Marschbahndamm 300', fontSize: 9 },
              { text: '21037 Hamburg', fontSize: 9 },
            ],
          },
        ],
      },
      { text: '', margin: [0, 16, 0, 0] as [number, number, number, number] },
      {
        columns: [
          {
            width: '*',
            text: `Hamburg, den ${formatDate(note.delivery_date)}`,
            fontSize: 10,
          },
          {
            width: 'auto',
            text: `Lieferschein Nr: ${note.lieferschein_nr || '—'}`,
            fontSize: 10,
            bold: true,
          },
        ],
      },
      { text: '', margin: [0, 12, 0, 0] as [number, number, number, number] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 45, 45, 45, 70],
          body: [
            [
              { text: 'Artikel und Topfgröße', bold: true, fontSize: 9 },
              { text: '35', bold: true, alignment: 'center' as const, fontSize: 9 },
              { text: '65', bold: true, alignment: 'center' as const, fontSize: 9 },
              { text: '85', bold: true, alignment: 'center' as const, fontSize: 9 },
              { text: 'Netto\nEinzelpreis in €', bold: true, alignment: 'right' as const, fontSize: 8 },
            ],
            ...itemRows,
          ],
        },
        layout: {
          hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
            i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
          vLineWidth: () => 0.5,
          hLineColor: (i: number) => (i <= 1 ? '#333' : '#ccc'),
          vLineColor: () => '#ccc',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
      {
        margin: [0, 8, 0, 0] as [number, number, number, number],
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            text: `Gesamt: ${totalQuantity} Stück`,
            fontSize: 9,
            bold: true,
          },
        ],
      },
      ...(note.notes
        ? [
            { text: '', margin: [0, 12, 0, 0] as [number, number, number, number] },
            { text: 'Notizen:', fontSize: 8, color: '#666' },
            { text: note.notes, fontSize: 9, margin: [0, 2, 0, 0] as [number, number, number, number] },
          ]
        : []),
      { text: '', margin: [0, 20, 0, 0] as [number, number, number, number] },
      {
        text: 'Pflanzenpass: DE-HH1-110071',
        fontSize: 8,
        color: '#666',
      },
    ],
  }

  const filename = note.lieferschein_nr
    ? `Lieferschein-${note.lieferschein_nr}.pdf`
    : `Lieferschein-${formatDate(note.delivery_date)}.pdf`

  pdfMake.default.createPdf(docDefinition).download(filename)
}

function ReadOnlyView({
  note,
  onEdit,
  onDelete,
  onDownloadPdf,
  isDeleting,
}: {
  note: { lieferschein_nr: string | null; delivery_date: string; notes: string | null; items: DeliveryNoteItem[] }
  onEdit: () => void
  onDelete: () => void
  onDownloadPdf: () => void
  isDeleting: boolean
}) {
  const totalItems = note.items.reduce(
    (acc, item) => acc + item.quantity_35 + item.quantity_65 + item.quantity_85,
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
              <div className="hidden sm:grid sm:grid-cols-[1fr_70px_70px_70px_90px] sm:gap-2 sm:px-1 sm:pb-2 sm:text-sm sm:font-medium sm:text-muted-foreground">
                <span>Artikel</span>
                <span className="text-center">35</span>
                <span className="text-center">65</span>
                <span className="text-center">85</span>
                <span className="text-right">Preis</span>
              </div>
              <Separator className="hidden sm:block" />
              {note.items.map((item) => (
                <div key={item.id ?? item.article_name}>
                  {/* Mobile */}
                  <div className="flex flex-col gap-1 py-2 sm:hidden">
                    <p className="text-sm font-medium">{item.article_name}</p>
                    <div className="text-muted-foreground flex gap-3 text-xs">
                      {item.quantity_35 > 0 && <span>35: {item.quantity_35}</span>}
                      {item.quantity_65 > 0 && <span>65: {item.quantity_65}</span>}
                      {item.quantity_85 > 0 && <span>85: {item.quantity_85}</span>}
                      {item.unit_price_cents > 0 && <span>{formatPriceDisplay(item.unit_price_cents)}</span>}
                    </div>
                  </div>
                  {/* Desktop */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_70px_70px_70px_90px] sm:items-center sm:gap-2 sm:py-1.5">
                    <span className="truncate text-sm">{item.article_name}</span>
                    <span className="text-center text-sm">{item.quantity_35 || '—'}</span>
                    <span className="text-center text-sm">{item.quantity_65 || '—'}</span>
                    <span className="text-center text-sm">{item.quantity_85 || '—'}</span>
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
        <Button variant="outline" size="lg" onClick={onDownloadPdf}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          PDF
        </Button>
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
  initialNote: { lieferschein_nr: string | null; delivery_date: string; notes: string | null; items: DeliveryNoteItem[] }
  onSave: (data: { lieferschein_nr: string; delivery_date: string; notes: string; items: DeliveryNoteItem[] }) => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [lieferscheinNr, setLieferscheinNr] = useState(initialNote.lieferschein_nr || '')
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

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const addCustomArticle = () => {
    if (!customArticle.trim()) return
    setItems((prev) => [
      ...prev,
      { article_name: customArticle.trim(), quantity_35: 0, quantity_65: 0, quantity_85: 0, unit_price_cents: 0 },
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
          <div className="hidden sm:grid sm:grid-cols-[1fr_70px_70px_70px_80px_40px] sm:gap-2 sm:px-1 sm:text-sm sm:font-medium sm:text-muted-foreground">
            <span>Artikel</span>
            <span className="text-center">35</span>
            <span className="text-center">65</span>
            <span className="text-center">85</span>
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
                  <div>
                    <Label className="text-xs text-muted-foreground">35</Label>
                    <Input type="number" inputMode="numeric" min={0} className="h-9" value={item.quantity_35 || ''} onChange={(e) => updateItem(index, 'quantity_35', Number.parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">65</Label>
                    <Input type="number" inputMode="numeric" min={0} className="h-9" value={item.quantity_65 || ''} onChange={(e) => updateItem(index, 'quantity_65', Number.parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">85</Label>
                    <Input type="number" inputMode="numeric" min={0} className="h-9" value={item.quantity_85 || ''} onChange={(e) => updateItem(index, 'quantity_85', Number.parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">&euro;</Label>
                    <Input type="text" inputMode="decimal" className="h-9" placeholder="0,00" value={formatPrice(item.unit_price_cents)} onChange={(e) => updateItem(index, 'unit_price_cents', parsePrice(e.target.value))} />
                  </div>
                </div>
                {index < items.length - 1 && <Separator className="mt-2" />}
              </div>

              {/* Desktop layout */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_70px_70px_70px_80px_40px] sm:items-center sm:gap-2">
                <span className="truncate text-sm">{item.article_name}</span>
                <Input type="number" inputMode="numeric" min={0} className="h-8 text-center" value={item.quantity_35 || ''} onChange={(e) => updateItem(index, 'quantity_35', Number.parseInt(e.target.value) || 0)} />
                <Input type="number" inputMode="numeric" min={0} className="h-8 text-center" value={item.quantity_65 || ''} onChange={(e) => updateItem(index, 'quantity_65', Number.parseInt(e.target.value) || 0)} />
                <Input type="number" inputMode="numeric" min={0} className="h-8 text-center" value={item.quantity_85 || ''} onChange={(e) => updateItem(index, 'quantity_85', Number.parseInt(e.target.value) || 0)} />
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
          onClick={() => onSave({ lieferschein_nr: lieferscheinNr, delivery_date: deliveryDate, notes, items })}
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
            onDownloadPdf={() => downloadPdf(note)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_app/delivery-notes/$id')({
  component: DeliveryNoteDetailPage,
})
