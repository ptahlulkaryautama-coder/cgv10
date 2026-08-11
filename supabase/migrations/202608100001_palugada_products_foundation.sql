-- Additive product catalog foundation for approved PALUGADA listings.
-- Intentionally not applied by this local UI change and does not alter listing intake/moderation.

begin;

create table if not exists public.palugada_products (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.palugada_listings(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 160),
  description text not null default '' check (char_length(description) <= 3000),
  price integer not null check (price >= 0),
  image_path text,
  stock_status text not null default 'available' check (stock_status in ('available', 'preorder', 'out_of_stock')),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists palugada_products_listing_active_sort_idx
  on public.palugada_products (listing_id, active, sort_order, created_at);

alter table public.palugada_products enable row level security;

create policy "palugada_products_public_approved_listing"
on public.palugada_products for select
using (
  active
  and exists (
    select 1 from public.palugada_listings listing
    where listing.id = palugada_products.listing_id
      and listing.status = 'approved'
  )
);

create policy "palugada_products_admin_manage"
on public.palugada_products for all to authenticated
using (public.has_permission('palugada:write'))
with check (public.has_permission('palugada:write'));

drop trigger if exists palugada_products_set_updated_at on public.palugada_products;
create trigger palugada_products_set_updated_at
before update on public.palugada_products
for each row execute function public.set_updated_at();

commit;
