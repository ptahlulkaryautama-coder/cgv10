-- Migration: Add avatar_url column to profiles and setup resident-avatars storage bucket

-- 1. Add avatar_url column to public.profiles if not exists
alter table public.profiles add column if not exists avatar_url text;

-- 2. Create public storage bucket 'resident-avatars' if storage.buckets table exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resident-avatars',
  'resident-avatars',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 3. Setup RLS policies for resident-avatars storage bucket
drop policy if exists "resident_avatars_public_select" on storage.objects;
create policy "resident_avatars_public_select" on storage.objects
  for select
  using (bucket_id = 'resident-avatars');

drop policy if exists "resident_avatars_authenticated_insert" on storage.objects;
create policy "resident_avatars_authenticated_insert" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'resident-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resident_avatars_authenticated_update" on storage.objects;
create policy "resident_avatars_authenticated_update" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'resident-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'resident-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resident_avatars_authenticated_delete" on storage.objects;
create policy "resident_avatars_authenticated_delete" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'resident-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
