ALTER TABLE public.delivery_notes
  ADD COLUMN bestellnummer VARCHAR(12);

ALTER TABLE public.delivery_notes
  ADD CONSTRAINT chk_bestellnummer_digits CHECK (bestellnummer ~ '^\d{1,12}$' OR bestellnummer IS NULL);
