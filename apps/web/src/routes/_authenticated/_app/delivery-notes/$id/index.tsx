import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postgres_db, schema, eq, asc } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Skeleton } from '~/lib/components/ui/skeleton'
import { toast } from 'sonner'
import { useRef } from 'react'
import { ArrowLeftIcon, Trash2Icon, PencilIcon, PrinterIcon } from 'lucide-react'
import { PDFDownloadButton } from './-components/PDFDownloadButton'
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

const deleteDeliveryNote = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await postgres_db
      .delete(schema.delivery_notes)
      .where(eq(schema.delivery_notes.id, data.id))
  })

const DeliveryNoteDetailPage = () => {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLDivElement>(null)

  const { data: note, isLoading } = useQuery({
    queryKey: ['delivery-note', id],
    queryFn: () => getDeliveryNote({ data: { id } }),
  })

  const handlePrint = useReactToPrint({
    contentRef: formRef,
    documentTitle: note?.lieferschein_nr ? `Lieferschein-${note.lieferschein_nr}` : 'Lieferschein',
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
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/delivery-notes/overview' })}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">
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

        <div className="flex gap-3">
          <Button className="flex-1" size="lg" onClick={() => navigate({ to: '/delivery-notes/$id/edit', params: { id } })}>
            <PencilIcon className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
          <Button size="lg" variant="outline" onClick={() => handlePrint()}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Drucken
          </Button>
          <PDFDownloadButton note={note} />
          <Button variant="destructive" size="lg" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            <Trash2Icon className="mr-2 h-4 w-4" />
            {deleteMutation.isPending ? 'Löschen...' : 'Löschen'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_app/delivery-notes/$id/')({
  component: DeliveryNoteDetailPage,
})
