-- Require warga login for service request submissions.

begin;

create or replace function public.submit_service_request(
  p_category text,
  p_title text,
  p_description text,
  p_priority text default 'normal'
)
returns table (request_id uuid, upload_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  created_request_id uuid;
  created_upload_token uuid := gen_random_uuid();
  current_user_id uuid := auth.uid();
  clean_title text := btrim(coalesce(p_title, ''));
  clean_description text := btrim(coalesce(p_description, ''));
begin
  if current_user_id is null then
    raise exception 'Login warga diperlukan untuk mengajukan layanan';
  end if;

  if p_category not in ('administrasi', 'pengaduan', 'keamanan', 'iuran', 'aspirasi', 'palugada', 'lainnya') then
    raise exception 'Kategori layanan tidak valid';
  end if;

  if p_priority not in ('normal', 'high', 'urgent') then
    raise exception 'Prioritas layanan tidak valid';
  end if;

  if char_length(clean_title) < 3 or char_length(clean_title) > 160 then
    raise exception 'Judul layanan harus berisi 3 sampai 160 karakter';
  end if;

  if char_length(clean_description) < 10 or char_length(clean_description) > 5000 then
    raise exception 'Detail layanan harus berisi 10 sampai 5000 karakter';
  end if;

  insert into public.service_requests (
    household_id,
    submitted_by,
    category,
    title,
    description,
    status,
    priority,
    assigned_to
  ) values (
    null,
    current_user_id,
    p_category,
    clean_title,
    clean_description,
    'submitted',
    p_priority,
    null
  )
  returning id into created_request_id;

  insert into public.service_request_upload_sessions (request_id, upload_token)
  values (created_request_id, created_upload_token);

  return query select created_request_id, created_upload_token;
end;
$$;

revoke all on function public.submit_service_request(text, text, text, text) from public;
grant execute on function public.submit_service_request(text, text, text, text) to authenticated;

revoke all on function public.is_valid_service_upload_path(text, uuid) from public;
grant execute on function public.is_valid_service_upload_path(text, uuid) to authenticated;

drop policy if exists "service_request_storage_public_insert" on storage.objects;
drop policy if exists "service_request_storage_authenticated_insert" on storage.objects;

create policy "service_request_storage_authenticated_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'service-request-attachments'
  and public.is_valid_service_upload_path(name)
);

drop policy if exists "service_attachments_public_insert" on public.attachments;
drop policy if exists "service_attachments_authenticated_insert" on public.attachments;

create policy "service_attachments_authenticated_insert"
on public.attachments for insert
to authenticated
with check (
  owner_user_id = auth.uid()
  and linked_type = 'service_request'
  and visibility = 'admin_only'
  and moderation_status = 'pending'
  and file_size between 1 and 10485760
  and public.is_valid_service_upload_path(storage_path, linked_id)
);

commit;
