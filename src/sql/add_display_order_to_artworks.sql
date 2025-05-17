
-- Add display_order column to artworks table
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS display_order INT;

-- Initialize display_order based on id (for existing artworks)
UPDATE public.artworks 
SET display_order = id 
WHERE display_order IS NULL;

-- Create index on display_order for faster queries
CREATE INDEX IF NOT EXISTS idx_artworks_display_order 
ON public.artworks(display_order);

-- Make display_order NOT NULL after initializing values
ALTER TABLE public.artworks 
ALTER COLUMN display_order SET NOT NULL;
