ALTER TABLE public.delivery_note_items
  ADD COLUMN quantities JSONB NOT NULL DEFAULT '[0,0,0,0,0,0]';

-- Migrate existing data: map old quantity_35/65/85 into the first three slots
UPDATE public.delivery_note_items
SET quantities = jsonb_build_array(quantity_35, quantity_65, quantity_85, 0, 0, 0);

ALTER TABLE public.delivery_note_items
  DROP COLUMN quantity_35,
  DROP COLUMN quantity_65,
  DROP COLUMN quantity_85;
