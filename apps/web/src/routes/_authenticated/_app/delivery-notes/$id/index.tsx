import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useSuspenseQuery } from '@tanstack/react-query'
import { postgres_db, schema, eq, asc } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { useRef } from 'react'
import { ArrowLeftIcon, PencilIcon, PrinterIcon } from 'lucide-react'
import { PDFDownloadButton } from './-components/PDFDownloadButton'
import { DeleteButton } from './-components/DeleteButton'
import { LieferscheinForm } from '../-components/LieferscheinForm'
import { useReactToPrint } from 'react-to-print'

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

const deliveryNoteQueryOptions = (id: string) => ({
  queryKey: ['delivery-note', id],
  queryFn: () => getDeliveryNote({ data: { id } }),
})

const DeliveryNoteDetailPage = () => {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const formRef = useRef<HTMLDivElement>(null)

  const { data: note } = useSuspenseQuery(deliveryNoteQueryOptions(id))

  const handlePrint = useReactToPrint({
    contentRef: formRef,
    documentTitle: note.lieferschein_nr ? `Lieferschein-${note.lieferschein_nr}` : 'Lieferschein',
  })

  return (
    <div className="flex-1 overflow-auto p-4 pb-24">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/delivery-notes/overview' })}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl">
            {note.lieferschein_nr || 'Lieferschein'}
          </h2>
        </div>

        <LieferscheinForm
          ref={formRef}
          disabled
          lieferscheinNr={note.lieferschein_nr || ''}
          bestellnummer={note.bestellnummer || ''}
          deliveryDate={note.delivery_date}
          items={note.items}
        />

        {note.notes && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Notizen:</span>
            <span className="text-sm">{note.notes}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button className="w-full" size="lg" onClick={() => navigate({ to: '/delivery-notes/$id/edit', params: { id } })}>
            <PencilIcon className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
          <Button className="w-full" size="lg" variant="outline" onClick={() => handlePrint()}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Drucken
          </Button>
          <PDFDownloadButton deliveryNote={note} />
          <DeleteButton id={id} lieferscheinNr={note.lieferschein_nr} />
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_app/delivery-notes/$id/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(deliveryNoteQueryOptions(params.id)),
  component: DeliveryNoteDetailPage,
})
