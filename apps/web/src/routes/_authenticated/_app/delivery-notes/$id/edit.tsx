import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postgres_db, schema, eq, asc } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Skeleton } from '~/lib/components/ui/skeleton'
import { toast } from 'sonner'
import { useRef, useState } from 'react'
import { ArrowLeftIcon, SaveIcon, PrinterIcon } from 'lucide-react'
import { LieferscheinForm } from '../-components/LieferscheinForm'
import { PDFDownloadButton } from './-components/PDFDownloadButton'
import { SaveDrawer } from '../-components/DrawerSave'
import { useReactToPrint } from 'react-to-print'

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

const EditDeliveryNotePage = () => {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const { data: note, isLoading } = useQuery({
    queryKey: ['delivery-note', id],
    queryFn: () => getDeliveryNote({ data: { id } }),
  })

  if (isLoading) {
    return (
      <div className="flex-1 p-4 pb-24">
        <div className="mx-auto max-w-3xl space-y-6">
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
        <Button variant="outline" onClick={() => navigate({ to: '/delivery-notes/overview' })}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
      </div>
    )
  }

  return <EditForm noteId={id} initialNote={note} />
}

function EditForm({
  noteId,
  initialNote,
}: {
  noteId: string
  initialNote: { lieferschein_nr: string | null; bestellnummer: string | null; delivery_date: string; notes: string | null; items: DeliveryNoteItem[] }
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [lieferscheinNr, setLieferscheinNr] = useState(initialNote.lieferschein_nr || '')
  const [bestellnummer, setBestellnummer] = useState(initialNote.bestellnummer || '')
  const [deliveryDate, setDeliveryDate] = useState(initialNote.delivery_date)
  const [notes, setNotes] = useState(initialNote.notes || '')
  const [items, setItems] = useState<DeliveryNoteItem[]>(initialNote.items)
  const [saveDrawerOpen, setSaveDrawerOpen] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: formRef,
    documentTitle: lieferscheinNr ? `Lieferschein-${lieferscheinNr}` : 'Lieferschein',
  })

  const mutation = useMutation({
    mutationFn: (data: UpdateDeliveryNoteInput) => updateDeliveryNote({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-note', noteId] })
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] })
      setSaveDrawerOpen(true)
    },
    onError: (error) => {
      toast.error(`Fehler beim Speichern: ${error.message}`)
    },
  })

  const updateItemQuantity = (index: number, chunkIndex: number, value: number) => {
    setItems((prev) => {
      const updated = [...prev]
      const quantities = [...updated[index].quantities]
      quantities[chunkIndex] = value
      updated[index] = { ...updated[index], quantities }
      return updated
    })
  }

  const updateItemPrice = (index: number, cents: number) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], unit_price_cents: cents }
      return updated
    })
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const setItemsByArticles = (articles: string[]) => {
    setItems((prev) => {
      const existing = new Map(prev.map((item) => [item.article_name, item]))
      return articles.map((name) => existing.get(name) ?? { article_name: name, quantities: [0, 0, 0, 0, 0, 0], unit_price_cents: 0 })
    })
  }

  const handleSubmit = () => {
    mutation.mutate({
      id: noteId,
      lieferschein_nr: lieferscheinNr,
      bestellnummer,
      delivery_date: deliveryDate,
      notes,
      items,
    })
  }

  return (
    <div className="flex-1 p-4 pb-24">
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/delivery-notes/$id', params: { id: noteId } })}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">
            {lieferscheinNr || 'Lieferschein'} bearbeiten
          </h2>
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
          onUpdateItemPrice={updateItemPrice}
          onSetItems={setItemsByArticles}
        />

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
            {mutation.isPending ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>

        <SaveDrawer
          open={saveDrawerOpen}
          onClose={() => navigate({ to: '/delivery-notes/$id', params: { id: noteId } })}
        >
          <Button size="lg" variant="outline" onClick={() => handlePrint()}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Drucken
          </Button>
          <PDFDownloadButton
            deliveryNote={{
              lieferschein_nr: lieferscheinNr || null,
              bestellnummer: bestellnummer || null,
              delivery_date: deliveryDate,
              notes: notes || null,
              items,
            }}
          />
        </SaveDrawer>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_app/delivery-notes/$id/edit')({
  component: EditDeliveryNotePage,
})
