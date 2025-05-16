
-- Create site_content table for storing editable content
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY,
  content_en TEXT NOT NULL,
  content_bg TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Create policy for reading content (allow all)
CREATE POLICY "Allow everyone to read site content"
  ON public.site_content
  FOR SELECT
  USING (true);

-- Create policy for updating content (admin only)
CREATE POLICY "Allow only admins to update site content"
  ON public.site_content
  FOR UPDATE
  USING (is_admin());

-- Create policy for inserting content (admin only)
CREATE POLICY "Allow only admins to insert site content"
  ON public.site_content
  FOR INSERT
  WITH CHECK (is_admin());

-- Create policy for deleting content (admin only)
CREATE POLICY "Allow only admins to delete site content"
  ON public.site_content
  FOR DELETE
  USING (is_admin());
