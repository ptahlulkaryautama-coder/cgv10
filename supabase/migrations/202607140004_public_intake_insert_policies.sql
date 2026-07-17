-- Phase C2.1: public intake inserts for services and PALUGADA.
-- Anonymous visitors may submit new intake rows only. Reading and status updates remain protected.

begin;

do $$
begin
  if to_regclass('public.service_requests') is null then
    raise exception 'Missing required table: public.service_requests';
  end if;

  if to_regclass('public.palugada_listings') is null then
    raise exception 'Missing required table: public.palugada_listings';
  end if;
end $$;

drop policy if exists "service_requests_public_insert_intake" on public.service_requests;
drop policy if exists "palugada_listings_public_insert_intake" on public.palugada_listings;

create policy "service_requests_public_insert_intake"
on public.service_requests for insert
to anon, authenticated
with check (
  household_id is null
  and submitted_by is null
  and assigned_to is null
  and status = 'submitted'
  and category in ('administrasi', 'pengaduan', 'keamanan', 'iuran', 'aspirasi', 'palugada', 'lainnya')
  and priority in ('normal', 'high', 'urgent')
);

create policy "palugada_listings_public_insert_intake"
on public.palugada_listings for insert
to anon, authenticated
with check (
  seller_user_id is null
  and seller_household_id is null
  and status = 'submitted'
  and seller_status = 'offline'
  and published_at is null
  and category in ('barang', 'kuliner', 'jasa', 'properti', 'lainnya')
);

commit;
