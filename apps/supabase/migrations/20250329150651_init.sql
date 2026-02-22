-- delivery_notes: header information for each delivery note
CREATE TABLE IF NOT EXISTS public.delivery_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lieferschein_nr TEXT,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- delivery_note_items: line items within a delivery note
CREATE TABLE IF NOT EXISTS public.delivery_note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_note_id UUID NOT NULL REFERENCES public.delivery_notes(id) ON DELETE CASCADE,
  article_name TEXT NOT NULL,
  quantity_35 INTEGER NOT NULL DEFAULT 0,
  quantity_65 INTEGER NOT NULL DEFAULT 0,
  quantity_85 INTEGER NOT NULL DEFAULT 0,
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_delivery_note_items_note_id
  ON public.delivery_note_items(delivery_note_id);

-- app_settings: key/value store for application configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO public.app_settings (setting_key, setting_value) VALUES
  ('supplier_info', '{"name": "Ralf Hitscher", "street": "Süderquerweg 484", "city": "21037 Hamburg", "pflanzenpass": "DE-HH1-110071"}'),
  ('recipient_info', '{"company": "Loest Blumengrosshandel e.K.", "street": "Kirchwerder Marschbahndamm 300", "city": "21037 Hamburg"}'),
  ('default_articles', '["Viola F1 WP T9", "Viola F1 ausgetopft", "Hornveilchen WP T9", "Hornveilchen ausgetopft", "Million Bells T12", "Million Bells Trio T12", "Heliotrop T12", "Diaskia T12", "Bacopa T12", "Diamond Frost T12", "Sanvitalia T12", "Nemesia T12", "Tapien T12", "Lobelia Richardii T12", "Euphorbia T12", "Tapien Trio T12", "Zonale T12", "Peltaten T12", "Lantanen T12", "Verbenen T12", "Neu Guinea Imp. T12"]')
ON CONFLICT (setting_key) DO NOTHING;
