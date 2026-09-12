-- Migration: Clean base64 image data from auth.users user_metadata and ensure storage bucket
-- Purpose: Storing base64 images in user_metadata causes the JWT token to exceed 50KB, triggering 400 Bad Request on all REST queries.

-- 1. Strip base64 avatar_url from auth.users raw_user_meta_data
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'avatar_url'
WHERE raw_user_meta_data->>'avatar_url' LIKE 'data:image/%';

-- 2. Ensure resident-avatars bucket exists with proper public access and size limit
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resident-avatars',
  'resident-avatars',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

-- 3. Storage RLS policies for resident-avatars
DROP POLICY IF EXISTS "resident_avatars_public_select" ON storage.objects;
DROP POLICY IF EXISTS "resident_avatars_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "resident_avatars_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "resident_avatars_auth_delete" ON storage.objects;

CREATE POLICY "resident_avatars_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resident-avatars');

CREATE POLICY "resident_avatars_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resident-avatars');

CREATE POLICY "resident_avatars_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resident-avatars');

CREATE POLICY "resident_avatars_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resident-avatars');
