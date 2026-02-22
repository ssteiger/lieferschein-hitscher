import { useState } from 'react'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { CheckIcon, PlusIcon } from 'lucide-react'
import {
  Drawer,
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
  onSubmit: (selected: string[]) => void
  onClose: () => void
}

export function ProductSelectDrawer({ open, existingArticles, onSubmit, onClose }: ProductSelectDrawerProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [customName, setCustomName] = useState('')
  const [search, setSearch] = useState('')

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelected([...existingArticles])
      setCustomName('')
      setSearch('')
    } else {
      onClose()
    }
  }

  const toggle = (article: string) => {
    setSelected((prev) =>
      prev.includes(article) ? prev.filter((a) => a !== article) : [...prev, article],
    )
  }

  const handleAddCustom = () => {
    const name = customName.trim()
    if (!name || selected.includes(name)) return
    setSelected((prev) => [...prev, name])
    setCustomName('')
  }

  const handleSubmit = () => {
    onSubmit(selected)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const selectedSet = new Set(selected)
  const searchLower = search.toLowerCase()
  const filteredArticles = search
    ? DEFAULT_ARTICLES.filter((a) => a.toLowerCase().includes(searchLower))
    : DEFAULT_ARTICLES

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Artikel hinzufügen</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2">
            <Input
              placeholder="Suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />
          </div>
          <div className="px-4 pb-2 max-h-[50vh] overflow-y-auto">
            <div className="space-y-1">
              {filteredArticles.map((article) => {
                const isSelected = selectedSet.has(article)
                return (
                  <button
                    key={article}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors ${isSelected ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'hover:bg-muted'}`}
                    onClick={() => toggle(article)}
                  >
                    <span>{article}</span>
                    {isSelected && <CheckIcon className="h-4 w-4" />}
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
            <Button onClick={handleSubmit}>Übernehmen</Button>
            <Button variant="outline" onClick={handleCancel}>Abbrechen</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
