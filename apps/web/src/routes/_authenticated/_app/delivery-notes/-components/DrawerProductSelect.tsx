import { useState } from 'react'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { CheckIcon, PlusIcon } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '~/lib/components/ui/drawer'

const DEFAULT_ARTICLES = [
  'Viola F1 WP T9',
  'Viola F1 ausgetopft',
  'Hornveilchen WP T9',
  'Hornveilchen ausgetopft',
  'Million Bells T12',
  'Million Bells Trio T12',
  'Heliotrop T12',
  'Diaskia T12',
  'Bacopa T12',
  'Diamond Frost T12',
  'Sanvitalia T12',
  'Nemesia T12',
  'Tapien T12',
  'Lobelia Richardii T12',
  'Euphorbia T12',
  'Tapien Trio T12',
  'Zonale T12',
  'Peltaten T12',
  'Lantanen T12',
  'Verbenen T12',
  'Neu Guinea Imp. T12',
] as const

interface ProductSelectDrawerProps {
  open: boolean
  existingArticles: string[]
  onSelect: (articleName: string) => void
  onClose: () => void
}

export function ProductSelectDrawer({ open, existingArticles, onSelect, onClose }: ProductSelectDrawerProps) {
  const [customName, setCustomName] = useState('')

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCustomName('')
    } else {
      onClose()
    }
  }

  const handleAddCustom = () => {
    const name = customName.trim()
    if (!name) return
    onSelect(name)
    setCustomName('')
  }

  const alreadyAdded = new Set(existingArticles)

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Artikel hinzufügen</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2 max-h-[50vh] overflow-y-auto">
            <div className="space-y-1">
              {DEFAULT_ARTICLES.map((article) => {
                const added = alreadyAdded.has(article)
                return (
                  <button
                    key={article}
                    type="button"
                    disabled={added}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-default"
                    onClick={() => onSelect(article)}
                  >
                    <span>{article}</span>
                    {added && <CheckIcon className="h-4 w-4 text-muted-foreground" />}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex gap-2 border-t pt-3">
              <Input
                placeholder="Eigener Artikel..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Button variant="outline" size="icon" onClick={handleAddCustom} disabled={!customName.trim()}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Schließen</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
