import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { postgres_db, schema, eq } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '~/lib/components/ui/drawer'

const deleteDeliveryNote = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await postgres_db
      .delete(schema.delivery_notes)
      .where(eq(schema.delivery_notes.id, data.id))
  })

interface DeleteButtonProps {
  id: string
  lieferscheinNr: string | null
}

export function DeleteButton({ id, lieferscheinNr }: DeleteButtonProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  return (
    <>
      <Button className="w-full" variant="destructive" size="lg" onClick={() => setDrawerOpen(true)}>
        <Trash2Icon className="mr-2 h-4 w-4" />
        Löschen
      </Button>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Lieferschein löschen?</DrawerTitle>
              <DrawerDescription>
                {lieferscheinNr
                  ? `"${lieferscheinNr}" wird unwiderruflich gelöscht.`
                  : 'Dieser Lieferschein wird unwiderruflich gelöscht.'}
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                {deleteMutation.isPending ? 'Wird gelöscht...' : 'Endgültig löschen'}
              </Button>
              <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                Abbrechen
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
