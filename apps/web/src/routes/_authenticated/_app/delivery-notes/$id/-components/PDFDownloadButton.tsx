import { Button } from '~/lib/components/ui/button'
import { DownloadIcon } from 'lucide-react'

interface DeliveryNoteItem {
  id?: string
  article_name: string
  quantities: number[]
  unit_price_cents: number
}

export interface PDFDownloadButtonProps {
  note: {
    lieferschein_nr: string | null
    bestellnummer: string | null
    delivery_date: string
    notes: string | null
    items: DeliveryNoteItem[]
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

async function loadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

function splitBestellnummer(nr: string | null): string[] {
  const digits = (nr || '').replace(/\D/g, '').slice(0, 12)
  const chunks: string[] = []
  for (let i = 0; i < 12; i += 2) {
    chunks.push(digits.slice(i, i + 2))
  }
  return chunks
}

async function downloadPdf(note: PDFDownloadButtonProps['note']) {
  const pdfMake = await import('pdfmake/build/pdfmake')
  await import('pdfmake/build/vfs_fonts')

  const logoBase64 = await loadImageAsBase64('/loest_logo.jpg')

  const itemRows = note.items.map((item) => [
    { text: item.article_name, fontSize: 9, margin: [4, 6, 4, 6] as [number, number, number, number] },
    ...item.quantities.map((q) => ({
      text: q > 0 ? String(q) : '',
      alignment: 'center' as const,
      fontSize: 9,
      margin: [2, 6, 2, 6] as [number, number, number, number],
    })),
    {
      text: item.unit_price_cents > 0
        ? (item.unit_price_cents / 100).toFixed(2).replace('.', ',')
        : '',
      alignment: 'right' as const,
      fontSize: 9,
      margin: [4, 6, 4, 6] as [number, number, number, number],
    },
  ])

  const minRows = 15
  const emptyRowsNeeded = Math.max(0, minRows - note.items.length)
  const emptyRows = Array.from({ length: emptyRowsNeeded }, () => [
    { text: '', margin: [4, 6, 4, 6] as [number, number, number, number] },
    { text: '', margin: [2, 6, 2, 6] as [number, number, number, number] },
    { text: '', margin: [2, 6, 2, 6] as [number, number, number, number] },
    { text: '', margin: [2, 6, 2, 6] as [number, number, number, number] },
    { text: '', margin: [2, 6, 2, 6] as [number, number, number, number] },
    { text: '', margin: [2, 6, 2, 6] as [number, number, number, number] },
    { text: '', margin: [2, 6, 2, 6] as [number, number, number, number] },
    { text: '', margin: [4, 6, 4, 6] as [number, number, number, number] },
  ])

  const docDefinition = {
    pageSize: 'A4' as const,
    pageMargins: [28, 28, 28, 28] as [number, number, number, number],
    content: [
      // --- Row 1: Warenempfänger (left) and Lieferant (right) boxes ---
      {
        columns: [
          // Left box: recipient address with logo
          {
            width: '*',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    text: 'Warenempfänger:',
                    bold: true,
                    fontSize: 10,
                    alignment: 'center' as const,
                    margin: [4, 4, 4, 4] as [number, number, number, number],
                  },
                ],
                [
                  {
                    columns: [
                      {
                        width: '*',
                        stack: [
                          { text: 'Loest Blumengrosshandel e.K.', fontSize: 9 },
                          { text: 'Kirchwerder Marschbahndamm 300', fontSize: 9 },
                          { text: '21037 Hamburg', fontSize: 9 },
                        ],
                      },
                      {
                        width: 80,
                        image: logoBase64,
                        fit: [75, 50],
                        alignment: 'right' as const,
                      },
                    ],
                    margin: [6, 6, 6, 6] as [number, number, number, number],
                  },
                ],
              ],
            },
            // 1pt solid black borders on all sides
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000',
              vLineColor: () => '#000',
            },
          },
          // Borderless gap between the two boxes
          { width: '8%', text: '' },
          // Right box: supplier details + Pflanzenpass
          {
            width: '*',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    text: 'Lieferant:',
                    bold: true,
                    fontSize: 10,
                    alignment: 'center' as const,
                    margin: [4, 4, 4, 4] as [number, number, number, number],
                  },
                ],
                [
                  {
                    stack: [
                      { text: 'Ralf Hitscher', fontSize: 9 },
                      { text: 'Süderquerweg 484', fontSize: 9 },
                      { text: '21037 Hamburg', fontSize: 9 },
                      { text: '', margin: [0, 4, 0, 0] as [number, number, number, number] },
                      { text: 'Pflanzenpass: DE-HH1-110071', fontSize: 8 },
                    ],
                    margin: [6, 6, 6, 6] as [number, number, number, number],
                  },
                ],
              ],
            },
            // 1pt solid black borders on all sides
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000',
              vLineColor: () => '#000',
            },
          },
        ],
      },

      { text: '', margin: [0, 10, 0, 0] as [number, number, number, number] },

      // --- Row 2: Lieferschein Nr (left) and delivery date (right) ---
      {
        columns: [
          // Left box: delivery note number
          {
            width: '*',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    columns: [
                      { text: 'Lieferschein Nr:', bold: true, fontSize: 10, width: 'auto' },
                      { text: note.lieferschein_nr || '', fontSize: 10, width: '*', decoration: 'underline' as const, margin: [4, 0, 0, 0] as [number, number, number, number] },
                    ],
                    margin: [4, 4, 4, 4] as [number, number, number, number],
                  },
                ],
              ],
            },
            // 1pt solid black borders on all sides
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000',
              vLineColor: () => '#000',
            },
          },
          // Borderless gap
          { width: '8%', text: '' },
          // Right box: date
          {
            width: '*',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    columns: [
                      { text: 'Hamburg, den', bold: true, fontSize: 10, width: 'auto' },
                      { text: formatDate(note.delivery_date), fontSize: 10, width: '*', margin: [4, 0, 0, 0] as [number, number, number, number] },
                    ],
                    margin: [4, 4, 4, 4] as [number, number, number, number],
                  },
                ],
              ],
            },
            // 1pt solid black borders on all sides
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000',
              vLineColor: () => '#000',
            },
          },
        ],
      },

      { text: '', margin: [0, 10, 0, 0] as [number, number, number, number] },

      // --- Items table: header rows + line items ---
      {
        table: {
          headerRows: 2,
          widths: ['*', 30, 30, 30, 30, 30, 30, 75],
          body: [
            // Header row 1: column group labels
            [
              { 
                text: 'Artikel und Topfgröße', 
                bold: true, 
                fontSize: 9, 
                margin: [2, 2, 2, 2] as [number, number, number, number],
                alignment: 'left' as const,
              },
              { 
                text: 'Stück / VPE', 
                bold: true, 
                fontSize: 9,
                colSpan: 6, 
                alignment: 'center' as const,
                margin: [2, 2, 2, 2] as [number, number, number, number] 
              },
              {},
              {},
              {},
              {},
              {},
              { 
                text: 'Netto', 
                bold: true, 
                fontSize: 9, 
                alignment: 'center' as const, 
                margin: [2, 2, 2, 0] as [number, number, number, number],
                border: [true, true, true, false],
              },
            ],
            // Header row 2: Bestellnummer split into 6 two-digit chunks
            [
              { text: 'Bestellnummer', bold: true, fontSize: 9, margin: [4, 8, 4, 4] as [number, number, number, number] },
              ...splitBestellnummer(note.bestellnummer).map((chunk) => ({
                text: chunk,
                bold: true,
                fontSize: 20,
                alignment: 'center' as const,
                margin: [2, 2, 2, 2] as [number, number, number, number],
              })),
              { text: 'Einzelpreis\nin \u20AC', bold: true, fontSize: 9, alignment: 'center' as const, margin: [2, 0, 2, 2] as [number, number, number, number], border: [true, false, true, true] },
            ],
            // Data rows + empty padding rows
            ...itemRows,
            ...emptyRows,
          ],
        },
        // 0.5pt thin borders for the item grid
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#000',
          vLineColor: () => '#000',
        },
      },
    ],
  }

  const filename = note.lieferschein_nr
    ? `Lieferschein-${note.lieferschein_nr}.pdf`
    : `Lieferschein-${formatDate(note.delivery_date)}.pdf`

  pdfMake.default.createPdf(docDefinition).download(filename)
}

export function PDFDownloadButton({ note }: PDFDownloadButtonProps) {
  return (
    <Button variant="outline" size="lg" onClick={() => downloadPdf(note)}>
      <DownloadIcon className="mr-2 h-4 w-4" />
      PDF herunterladen
    </Button>
  )
}
