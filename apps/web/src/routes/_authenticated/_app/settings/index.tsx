import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postgres_db, schema, eq } from '@lieferschein-hitscher/db-drizzle'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Label } from '~/lib/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/lib/components/ui/card'
import { Separator } from '~/lib/components/ui/separator'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { SaveIcon, PlusIcon, Trash2Icon } from 'lucide-react'

interface SupplierInfo {
  name: string
  street: string
  city: string
  pflanzenpass: string
}

interface RecipientInfo {
  company: string
  street: string
  city: string
}

interface AllSettings {
  supplier_info: SupplierInfo
  recipient_info: RecipientInfo
  default_articles: string[]
}

const getSettings = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await postgres_db.select().from(schema.app_settings)

  const settings: AllSettings = {
    supplier_info: { name: '', street: '', city: '', pflanzenpass: '' },
    recipient_info: { company: '', street: '', city: '' },
    default_articles: [],
  }

  for (const row of rows) {
    if (row.setting_key === 'supplier_info') {
      settings.supplier_info = row.setting_value as SupplierInfo
    } else if (row.setting_key === 'recipient_info') {
      settings.recipient_info = row.setting_value as RecipientInfo
    } else if (row.setting_key === 'default_articles') {
      settings.default_articles = row.setting_value as string[]
    }
  }

  return settings
})

const settingsQueryOptions = {
  queryKey: ['settings'],
  queryFn: () => getSettings(),
} as const

const saveSettings = createServerFn({ method: 'POST' })
  .validator((input: AllSettings) => input)
  .handler(async ({ data }) => {
    const upsert = async (key: string, value: unknown) => {
      const existing = await postgres_db
        .select()
        .from(schema.app_settings)
        .where(eq(schema.app_settings.setting_key, key))
        .limit(1)

      if (existing.length > 0) {
        await postgres_db
          .update(schema.app_settings)
          .set({ setting_value: value, updated_at: new Date().toISOString() })
          .where(eq(schema.app_settings.setting_key, key))
      } else {
        await postgres_db
          .insert(schema.app_settings)
          .values({ setting_key: key, setting_value: value })
      }
    }

    await upsert('supplier_info', data.supplier_info)
    await upsert('recipient_info', data.recipient_info)
    await upsert('default_articles', data.default_articles)

    return { success: true }
  })

const SettingsPage = () => {
  const queryClient = useQueryClient()

  const { data: settings } = useSuspenseQuery(settingsQueryOptions)

  const [supplier, setSupplier] = useState<SupplierInfo>({
    name: '',
    street: '',
    city: '',
    pflanzenpass: '',
  })
  const [recipient, setRecipient] = useState<RecipientInfo>({
    company: '',
    street: '',
    city: '',
  })
  const [articles, setArticles] = useState<string[]>([])
  const [newArticle, setNewArticle] = useState('')

  useEffect(() => {
    if (settings) {
      setSupplier(settings.supplier_info)
      setRecipient(settings.recipient_info)
      setArticles(settings.default_articles)
    }
  }, [settings])

  const mutation = useMutation({
    mutationFn: (data: AllSettings) => saveSettings({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['default-articles'] })
      toast.success('Einstellungen gespeichert')
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`)
    },
  })

  const handleSave = () => {
    mutation.mutate({
      supplier_info: supplier,
      recipient_info: recipient,
      default_articles: articles.filter((a) => a.trim() !== ''),
    })
  }

  const addArticle = () => {
    if (!newArticle.trim()) return
    setArticles((prev) => [...prev, newArticle.trim()])
    setNewArticle('')
  }

  const removeArticle = (index: number) => {
    setArticles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateArticle = (index: number, value: string) => {
    setArticles((prev) => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  return (
    <div className="flex-1 p-4 pb-24">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Einstellungen</h2>
          <p className="text-muted-foreground">
            Lieferant, Warenempfänger und Standard-Artikel verwalten.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lieferant</CardTitle>
            <CardDescription>Ihre Adressdaten als Lieferant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Name</Label>
              <Input
                id="supplier_name"
                value={supplier.name}
                onChange={(e) => setSupplier((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_street">Straße</Label>
              <Input
                id="supplier_street"
                value={supplier.street}
                onChange={(e) => setSupplier((s) => ({ ...s, street: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_city">PLZ / Ort</Label>
              <Input
                id="supplier_city"
                value={supplier.city}
                onChange={(e) => setSupplier((s) => ({ ...s, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_pflanzenpass">Pflanzenpass</Label>
              <Input
                id="supplier_pflanzenpass"
                value={supplier.pflanzenpass}
                onChange={(e) => setSupplier((s) => ({ ...s, pflanzenpass: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warenempfänger</CardTitle>
            <CardDescription>Adresse des Empfängers auf dem Lieferschein.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient_company">Firma</Label>
              <Input
                id="recipient_company"
                value={recipient.company}
                onChange={(e) => setRecipient((r) => ({ ...r, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient_street">Straße</Label>
              <Input
                id="recipient_street"
                value={recipient.street}
                onChange={(e) => setRecipient((r) => ({ ...r, street: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient_city">PLZ / Ort</Label>
              <Input
                id="recipient_city"
                value={recipient.city}
                onChange={(e) => setRecipient((r) => ({ ...r, city: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Standard-Artikel</CardTitle>
            <CardDescription>
              Diese Artikel werden automatisch in jeden neuen Lieferschein eingefügt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {articles.map((article, index) => (
              <div key={`article-${index}-${article}`} className="flex gap-2">
                <Input
                  value={article}
                  onChange={(e) => updateArticle(index, e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => removeArticle(index)}>
                  <Trash2Icon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}

            <Separator />

            <div className="flex gap-2">
              <Input
                placeholder="Neuen Artikel hinzufügen..."
                value={newArticle}
                onChange={(e) => setNewArticle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addArticle()}
              />
              <Button variant="outline" size="icon" onClick={addArticle}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <Button className="w-full" size="lg" onClick={handleSave} disabled={mutation.isPending}>
            <SaveIcon className="mr-2 h-4 w-4" />
            {mutation.isPending ? 'Wird gespeichert...' : 'Einstellungen speichern'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_app/settings/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(settingsQueryOptions),
  component: SettingsPage,
})
