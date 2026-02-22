import { useState } from 'react'
import { DataTable } from '~/lib/components/ui/data-table'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { postgres_db, schema, desc } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/lib/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '~/lib/components/ui/toggle-group'
import { PlusCircleIcon, LayoutListIcon, LayoutGridIcon } from 'lucide-react'

interface DeliveryNote {
  id: string
  lieferschein_nr: string | null
  delivery_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

const getDeliveryNotes = createServerFn({ method: 'GET' }).handler(async () => {
  const notes = await postgres_db
    .select()
    .from(schema.delivery_notes)
    .orderBy(desc(schema.delivery_notes.created_at))
    .limit(500)
  return notes
})

const deliveryNotesQueryOptions = {
  queryKey: ['delivery-notes'],
  queryFn: () => getDeliveryNotes(),
} as const

const columns: ColumnDef<DeliveryNote>[] = [
  {
    accessorKey: 'lieferschein_nr',
    header: 'Lieferschein Nr.',
    size: 160,
    cell: ({ row }) => {
      const nr = row.getValue('lieferschein_nr') as string | null
      return nr || '—'
    },
  },
  {
    accessorKey: 'delivery_date',
    header: 'Datum',
    size: 140,
    cell: ({ row }) => {
      const date = row.getValue('delivery_date') as string
      if (!date) return '—'
      return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },
  },
  {
    accessorKey: 'notes',
    header: 'Notizen',
    size: 300,
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string | null
      return notes || '—'
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Erstellt am',
    size: 180,
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function DeliveryNoteCard({ note }: { note: DeliveryNote }) {
  return (
    <Link to="/delivery-notes/$id" params={{ id: note.id }}>
      <Card className="transition-colors hover:border-primary/40 hover:shadow-md">
        <CardHeader>
          <CardTitle>{note.lieferschein_nr || 'Ohne Nr.'}</CardTitle>
          <CardDescription>{formatDate(note.delivery_date)}</CardDescription>
        </CardHeader>
        {note.notes && (
          <CardContent>
            <p className="text-muted-foreground line-clamp-2 text-sm">{note.notes}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}

const DeliveryNotesPage = () => {
  const [view, setView] = useState<'list' | 'grid'>('grid')
  const { data: deliveryNotes, refetch } = useSuspenseQuery(deliveryNotesQueryOptions)

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lieferscheine</h2>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as 'list' | 'grid')} variant="outline" size="sm">
            <ToggleGroupItem value="list" aria-label="Listenansicht">
              <LayoutListIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Kachelansicht">
              <LayoutGridIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Link to="/delivery-notes/new">
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Neuer Lieferschein
            </Button>
          </Link>
        </div>
      </div>

      {view === 'list' ? (
        <DataTable
          data={deliveryNotes}
          columns={columns}
          isLoading={false}
          refetch={refetch}
          showSelectColumn={false}
          emptyState={{
            title: 'Keine Lieferscheine',
            subtitle: 'Erstellen Sie Ihren ersten Lieferschein.',
          }}
        />
      ) : (
        <>
          {deliveryNotes.length ? (
            <div className="mx-auto max-w-3xl space-y-4">
              {deliveryNotes.map((note) => (
                <DeliveryNoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium">Keine Lieferscheine</p>
              <p className="text-muted-foreground text-sm">Erstellen Sie Ihren ersten Lieferschein.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_app/delivery-notes/overview')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(deliveryNotesQueryOptions),
  component: DeliveryNotesPage,
})
