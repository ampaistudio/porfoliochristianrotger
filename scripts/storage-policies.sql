-- Storage policies for portfolio-photos bucket
-- Run in Supabase SQL Editor AFTER creating the bucket

-- Allow anyone to view photos (public portfolio)
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-photos');

-- Allow uploads (admin panel is password-protected at UI level)
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'portfolio-photos');

-- Allow replacing existing files (upsert)
CREATE POLICY "Allow updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'portfolio-photos');

-- Allow deleting photos
CREATE POLICY "Allow deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'portfolio-photos');
