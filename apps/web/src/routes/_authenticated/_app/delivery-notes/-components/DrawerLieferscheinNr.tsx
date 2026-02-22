import { useState } from 'react'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { MinusIcon, PlusIcon } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '~/lib/components/ui/drawer'

interface LieferscheinNrDrawerProps {
  open: boolean
  initialValue: string
  onSubmit: (value: string) => void
  onClose: () => void
}

function parseNr(value: string): { year: string; seq: number } {
  const match = value.match(/^(\d{4})-(\d+)$/)
  if (match) return { year: match[1], seq: Number.parseInt(match[2]) }
  const currentYear = new Date().getFullYear().toString()
  return { year: currentYear, seq: 1 }
}

export function LieferscheinNrDrawer({ open, initialValue, onSubmit, onClose }: LieferscheinNrDrawerProps) {
  const [year, setYear] = useState(() => parseNr(initialValue).year)
  const [seq, setSeq] = useState(() => parseNr(initialValue).seq)

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const parsed = parseNr(initialValue)
      setYear(parsed.year)
      setSeq(parsed.seq)
    } else {
      onClose()
    }
  }

  const formatted = `${year}-${String(seq).padStart(3, '0')}`

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Lieferschein Nr</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0 space-y-6">
            <div>
              <div className="text-muted-foreground text-xs uppercase text-center mb-2">Jahr</div>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={4}
                className="text-center text-3xl font-bold h-14 tabular-nums"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>

            <div>
              <div className="text-muted-foreground text-xs uppercase text-center mb-2">Laufende Nr</div>
              <div className="flex items-center justify-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={() => setSeq((v) => Math.max(1, v - 1))}
                  disabled={seq <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-6xl font-bold tracking-tighter tabular-nums">
                    {String(seq).padStart(3, '0')}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={() => setSeq((v) => v + 1)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-center text-lg font-medium text-muted-foreground">
              = {formatted}
            </div>
          </div>
          <DrawerFooter>
            <Button size="lg" onClick={() => onSubmit(formatted)}>Übernehmen</Button>
            <DrawerClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
