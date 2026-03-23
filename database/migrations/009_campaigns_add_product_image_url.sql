BEGIN;

ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS product_image_url text;

UPDATE public.campaigns
SET product_image_url = image_url
WHERE product_image_url IS NULL
  AND image_url IS NOT NULL;

COMMIT;
