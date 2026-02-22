import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postgres_db, schema } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { toast } from 'sonner'
import { useRef, useState } from 'react'
import { ArrowLeftIcon, SaveIcon, PrinterIcon } from 'lucide-react'
import { LieferscheinForm } from './-components/LieferscheinForm'
import type { DeliveryNoteItem } from './-components/LieferscheinForm'
import { PDFDownloadButton } from './$id/-components/PDFDownloadButton'
import { SaveDrawer } from './-components/DrawerSave'
import { useReactToPrint } from 'react-to-print'

interface CreateDeliveryNoteInput {
  lieferschein_nr: string
  bestellnummer: string
  delivery_date: string
  notes: string
  items: DeliveryNoteItem[]
}

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
  const [saveDrawerOpen, setSaveDrawerOpen] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: formRef,
    documentTitle: lieferscheinNr ? `Lieferschein-${lieferscheinNr}` : 'Lieferschein',
  })

  const mutation = useMutation({
    mutationFn: (data: CreateDeliveryNoteInput) => createDeliveryNote({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] })
      setSaveDrawerOpen(true)
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
            {mutation.isPending ? 'Wird gespeichert...' : 'Lieferschein speichern'}
          </Button>
        </div>

        <SaveDrawer
          open={saveDrawerOpen}
          onClose={() => navigate({ to: '/delivery-notes/overview' })}
        >
          <Button size="lg" variant="outline" onClick={() => handlePrint()}>
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
        </SaveDrawer>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_app/delivery-notes/new')({
  component: NewDeliveryNotePage,
})
