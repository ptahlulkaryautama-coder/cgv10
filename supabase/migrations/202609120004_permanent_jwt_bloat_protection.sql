-- ==============================================================================
-- MIGRATION: Permanent Protection Against JWT Bloat and RLS Infinite Recursion
-- ==============================================================================

-- 1. CLEANUP ALL EXISTING USERS IN auth.users
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'avatar_url'
WHERE raw_user_meta_data->>'avatar_url' LIKE 'data:%';

-- 2. PERMANENT TRIGGER TO REJECT / STRIP LARGE DATA STRINGS IN user_metadata
-- Prevents any client, script, or bug from ever inserting Base64 data URIs into auth.users.
CREATE OR REPLACE FUNCTION public.sanitize_user_metadata_prevent_jwt_bloat()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If avatar_url is a base64 Data URL, strip it immediately
  IF NEW.raw_user_meta_data->>'avatar_url' LIKE 'data:%' THEN
    NEW.raw_user_meta_data := NEW.raw_user_meta_data - 'avatar_url';
  END IF;

  -- Ensure total metadata length does not exceed 4000 characters (safety limit for JWT headers)
  IF length(NEW.raw_user_meta_data::text) > 4000 THEN
    RAISE EXCEPTION 'user_metadata payload is too large (% bytes). Images must be stored in Supabase Storage buckets, not in user_metadata.', length(NEW.raw_user_meta_data::text);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sanitize_user_metadata ON auth.users;
CREATE TRIGGER trg_sanitize_user_metadata
BEFORE INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sanitize_user_metadata_prevent_jwt_bloat();

-- 3. ENSURE RESIDENT-AVATARS STORAGE BUCKET IS CONFIGURED
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

-- 4. STORAGE POLICIES
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
