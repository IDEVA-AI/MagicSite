-- Add avatar_url column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage bucket for avatars (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: authenticated users can upload to their own folder
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: authenticated users can update their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: authenticated users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: anyone can read avatars (public bucket)
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
