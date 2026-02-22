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

interface DateDrawerProps {
  open: boolean
  initialValue: string
  onSubmit: (value: string) => void
  onClose: () => void
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function parseDate(value: string): { day: number; month: number; year: number } {
  const d = value ? new Date(value) : new Date()
  return {
    day: d.getDate(),
    month: d.getMonth() + 1,
    year: d.getFullYear(),
  }
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

function toISODate(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function DateDrawer({ open, initialValue, onSubmit, onClose }: DateDrawerProps) {
  const [day, setDay] = useState(() => parseDate(initialValue).day)
  const [month, setMonth] = useState(() => parseDate(initialValue).month)
  const [year, setYear] = useState(() => parseDate(initialValue).year)

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const parsed = parseDate(initialValue)
      setDay(parsed.day)
      setMonth(parsed.month)
      setYear(parsed.year)
    } else {
      onClose()
    }
  }

  const maxDay = daysInMonth(month, year)
  const clampedDay = Math.min(day, maxDay)

  const handleSubmit = () => {
    onSubmit(toISODate(clampedDay, month, year))
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Datum</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0 space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setDay((v) => Math.max(1, v - 1))}
                disabled={clampedDay <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <div className="text-6xl font-bold tracking-tighter tabular-nums">
                  {String(clampedDay).padStart(2, '0')}
                </div>
                <div className="text-muted-foreground text-xs uppercase">Tag</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setDay((v) => Math.min(maxDay, v + 1))}
                disabled={clampedDay >= maxDay}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setMonth((v) => Math.max(1, v - 1))}
                disabled={month <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <div className="text-4xl font-bold tracking-tighter">
                  {MONTH_NAMES[month - 1]}
                </div>
                <div className="text-muted-foreground text-xs uppercase">Monat</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setMonth((v) => Math.min(12, v + 1))}
                disabled={month >= 12}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setYear((v) => v - 1)}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <div className="text-6xl font-bold tracking-tighter tabular-nums">
                  {year}
                </div>
                <div className="text-muted-foreground text-xs uppercase">Jahr</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setYear((v) => v + 1)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center text-lg font-medium text-muted-foreground">
              = {String(clampedDay).padStart(2, '0')}.{String(month).padStart(2, '0')}.{year}
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
