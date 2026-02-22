import { useState } from 'react'
import { Button } from '~/lib/components/ui/button'
import { MinusIcon, PlusIcon } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '~/lib/components/ui/drawer'

interface PriceDrawerProps {
  open: boolean
  articleName: string
  initialCents: number
  onSubmit: (cents: number) => void
  onClose: () => void
}

export function PriceDrawer({ open, articleName, initialCents, onSubmit, onClose }: PriceDrawerProps) {
  const [euros, setEuros] = useState(() => Math.floor(initialCents / 100))
  const [cents, setCents] = useState(() => initialCents % 100)

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setEuros(Math.floor(initialCents / 100))
      setCents(initialCents % 100)
    } else {
      onClose()
    }
  }

  const handleSubmit = () => {
    onSubmit(euros * 100 + cents)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{articleName}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0 space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setEuros((v) => Math.max(0, v - 1))}
                disabled={euros <= 0}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <div className="text-6xl font-bold tracking-tighter tabular-nums">
                  {euros}
                </div>
                <div className="text-muted-foreground text-xs uppercase">Euro</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setEuros((v) => v + 1)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setCents((v) => Math.max(0, v - 5))}
                disabled={cents <= 0}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <div className="text-6xl font-bold tracking-tighter tabular-nums">
                  {String(cents).padStart(2, '0')}
                </div>
                <div className="text-muted-foreground text-xs uppercase">Cent</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setCents((v) => Math.min(99, v + 5))}
                disabled={cents >= 99}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center text-lg font-medium text-muted-foreground">
              = {euros},{String(cents).padStart(2, '0')} €
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleSubmit}>Übernehmen</Button>
            <DrawerClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
