import type { ReactNode } from 'react'
import { Button } from '~/lib/components/ui/button'
import { CheckCircle2Icon } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '~/lib/components/ui/drawer'

interface SaveDrawerProps {
  open: boolean
  onClose: () => void
  children?: ReactNode
}

export function SaveDrawer({ open, onClose, children }: SaveDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle2Icon className="h-12 w-12 text-green-500" />
            </div>
            <DrawerTitle>Gespeichert</DrawerTitle>
            <DrawerDescription>
              Der Lieferschein wurde erfolgreich gespeichert.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="gap-3">
            {children}
            <Button variant="outline" onClick={onClose}>Schließen</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
