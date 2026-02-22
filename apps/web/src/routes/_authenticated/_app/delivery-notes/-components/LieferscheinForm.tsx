import { useState } from 'react'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { PriceDrawer } from './DrawerPrice'
import { LieferscheinNrDrawer } from './DrawerLieferscheinNr'
import { DateDrawer } from './DrawerDate'
import { ProductSelectDrawer } from './DrawerProductSelect'

export interface DeliveryNoteItem {
  article_name: string
  quantities: string[]
  unit_price_cents: number
}

interface LieferscheinFormProps {
  lieferscheinNr: string
  onLieferscheinNrChange?: (value: string) => void
  bestellnummer: string
  onBestellnummerChange?: (value: string) => void
  deliveryDate: string
  onDeliveryDateChange?: (value: string) => void
  items: DeliveryNoteItem[]
  onRemoveItem?: (index: number) => void
  onUpdateItemQuantity?: (index: number, chunkIndex: number, value: string) => void
  onUpdateItemPrice?: (index: number, cents: number) => void
  onSetItems?: (articles: string[]) => void
  disabled?: boolean
}

function splitBestellnummer(nr: string): string[] {
  const digits = nr.replace(/\D/g, '').slice(0, 12)
  const chunks: string[] = []
  for (let i = 0; i < 12; i += 2) {
    chunks.push(digits.slice(i, i + 2))
  }
  return chunks
}

function formatPrice(cents: number) {
  if (cents === 0) return ''
  return (cents / 100).toFixed(2)
}

export const LieferscheinForm = function LieferscheinForm({ ref, lieferscheinNr, onLieferscheinNrChange, bestellnummer, onBestellnummerChange, deliveryDate, onDeliveryDateChange, items, onRemoveItem, onUpdateItemQuantity, onUpdateItemPrice, onSetItems, disabled = false }: LieferscheinFormProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const bestellChunks = splitBestellnummer(bestellnummer)
  const [priceEditIndex, setPriceEditIndex] = useState<number | null>(null)
  const [lieferscheinNrDrawerOpen, setLieferscheinNrDrawerOpen] = useState(false)
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false)
  const [productDrawerOpen, setProductDrawerOpen] = useState(false)

  const handleChunkChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 2)
    const chunks = splitBestellnummer(bestellnummer)
    chunks[index] = digits
    onBestellnummerChange?.(chunks.join(''))
  }

  return (
    <div ref={ref} className="space-y-3 print:space-y-2 print:p-0 print:text-black">
      {/* Row 1: Warenempfänger (left) + Lieferant (right) */}
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <div className="border border-foreground">
          <div className="border-b border-foreground bg-muted px-3 py-1.5 text-center text-sm font-bold">
            Warenempfänger:
          </div>
          <div className="flex items-start gap-3 p-3">
            <div className="flex-1 text-xs leading-relaxed">
              <p>Loest Blumengrosshandel e.K.</p>
              <p>Kirchwerder Marschbahndamm 300</p>
              <p>21037 Hamburg</p>
            </div>
            <img src="/loest_logo.jpg" alt="Loest Logo" className="h-10 w-auto" />
          </div>
        </div>
        <div className="border border-foreground">
          <div className="border-b border-foreground bg-muted px-3 py-1.5 text-center text-sm font-bold">
            Lieferant:
          </div>
          <div className="p-3 text-xs leading-relaxed">
            <p>Ralf Hitscher</p>
            <p>Süderquerweg 484</p>
            <p>21037 Hamburg</p>
          </div>
        </div>
      </div>

      {/* Row 2: Lieferschein Nr (left) + Datum (right) */}
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <button
          type="button"
          disabled={disabled}
          className="flex items-center gap-2 border border-foreground px-3 py-1.5 text-left cursor-pointer hover:bg-muted/50 transition-colors disabled:cursor-default disabled:hover:bg-transparent"
          onClick={() => setLieferscheinNrDrawerOpen(true)}
        >
          <span className="text-sm font-bold whitespace-nowrap">Lieferschein Nr:</span>
          {lieferscheinNr || <span className="text-muted-foreground">{disabled ? '—' : 'z.B. 2026-001'}</span>}
        </button>
        <button
          type="button"
          disabled={disabled}
          className="flex items-center gap-2 border border-foreground px-3 py-1.5 text-left cursor-pointer hover:bg-muted/50 transition-colors disabled:cursor-default disabled:hover:bg-transparent"
          onClick={() => setDateDrawerOpen(true)}
        >
          <span className="text-sm font-bold whitespace-nowrap">Hamburg, den</span>
          {deliveryDate
            ? new Date(deliveryDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : <span className="text-muted-foreground">{disabled ? '—' : 'Datum wählen'}</span>}
        </button>
      </div>

      {/* Items table matching PDF layout */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-foreground px-2 py-1 text-left text-xs font-bold">
              Artikel und Topfgröße
            </th>
            <th colSpan={6} className="border border-foreground px-2 py-1 text-center text-xs font-bold">
              Stück / VPE
            </th>
            <th className="border-t border-l border-r border-foreground border-b-0 px-2 py-1 text-center text-xs font-bold">
              Netto
            </th>
          </tr>
          <tr>
            <th className="border border-foreground px-2 py-1 text-left text-xs font-bold align-middle">
              Bestellnummer
            </th>
            {[0, 1, 2, 3, 4, 5].map((pos) => (
              <th key={`chunk${pos}`} className="border border-foreground p-0.5 text-center">
                <Input
                  className="h-8 w-full border-0 shadow-none text-center text-lg font-extrabold px-0 focus-visible:ring-0"
                  inputMode="numeric"
                  maxLength={2}
                  disabled={disabled}
                  value={bestellChunks[pos]}
                  onChange={(e) => handleChunkChange(pos, e.target.value)}
                />
              </th>
            ))}
            <th className="border-b border-l border-r border-foreground border-t-0 px-2 py-1 text-center text-xs font-bold">
              Einzelpreis
              <br />
              in €
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={item.article_name} className="group">
              <td className="border border-foreground px-2 py-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>{item.article_name}</span>
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                      onClick={() => onRemoveItem?.(index)}
                    >
                      <Trash2Icon className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </td>
              {[0, 1, 2, 3, 4, 5].map((chunkIdx) => {
                const chunkEmpty = !bestellChunks[chunkIdx]
                return (
                  <td key={`q${chunkIdx}`} className={`border border-foreground px-0.5 py-0.5 ${chunkEmpty ? 'bg-muted' : ''}`}>
                    <Input
                      type="text"
                      disabled={disabled || chunkEmpty}
                      className="h-7 w-full border-0 shadow-none text-center text-xs px-0 focus-visible:ring-0 disabled:opacity-40"
                      value={item.quantities[chunkIdx] || ''}
                      onChange={(e) => onUpdateItemQuantity?.(index, chunkIdx, e.target.value)}
                    />
                  </td>
                )
              })}
              <td className="border border-foreground px-1 py-0.5">
                <button
                  type="button"
                  disabled={disabled}
                  className="h-7 w-full text-right text-xs px-1 cursor-pointer hover:bg-muted/50 rounded transition-colors disabled:cursor-default disabled:hover:bg-transparent"
                  onClick={() => setPriceEditIndex(index)}
                >
                  {item.unit_price_cents > 0 ? formatPrice(item.unit_price_cents) : <span className="text-muted-foreground">0,00</span>}
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={9} className="px-2 pb-2.5 text-xs text-center">
              <p className="mt-2 text-[10px]">Pflanzenpass: DE-HH1-110071</p>
            </td>
          </tr>
        </tbody>
      </table>

      {!disabled && onSetItems && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setProductDrawerOpen(true)}
          className="print:hidden w-full" size="lg"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Artikel hinzufügen
        </Button>
      )}

      {!disabled && (
        <>
          <DateDrawer
            open={dateDrawerOpen}
            initialValue={deliveryDate}
            onSubmit={(value) => {
              onDeliveryDateChange?.(value)
              setDateDrawerOpen(false)
            }}
            onClose={() => setDateDrawerOpen(false)}
          />

          <LieferscheinNrDrawer
            open={lieferscheinNrDrawerOpen}
            initialValue={lieferscheinNr}
            onSubmit={(value) => {
              onLieferscheinNrChange?.(value)
              setLieferscheinNrDrawerOpen(false)
            }}
            onClose={() => setLieferscheinNrDrawerOpen(false)}
          />

          <PriceDrawer
            open={priceEditIndex !== null}
            articleName={priceEditIndex !== null ? items[priceEditIndex]?.article_name ?? 'Einzelpreis' : 'Einzelpreis'}
            initialCents={priceEditIndex !== null ? items[priceEditIndex]?.unit_price_cents ?? 0 : 0}
            onSubmit={(cents) => {
              if (priceEditIndex !== null) onUpdateItemPrice?.(priceEditIndex, cents)
              setPriceEditIndex(null)
            }}
            onClose={() => setPriceEditIndex(null)}
          />

          <ProductSelectDrawer
            open={productDrawerOpen}
            existingArticles={items.map((item) => item.article_name)}
            onSubmit={(selected) => onSetItems?.(selected)}
            onClose={() => setProductDrawerOpen(false)}
          />
        </>
      )}
    </div>
  )
}
