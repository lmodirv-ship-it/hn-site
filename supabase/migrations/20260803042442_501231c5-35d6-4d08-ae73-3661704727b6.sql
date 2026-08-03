ALTER TABLE public.case_studies
  ADD COLUMN IF NOT EXISTS domain text,
  ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS api_specs text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS screenshot_desktop text,
  ADD COLUMN IF NOT EXISTS screenshot_tablet text,
  ADD COLUMN IF NOT EXISTS screenshot_mobile text;