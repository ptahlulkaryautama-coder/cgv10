-- Migration: PALUGADA Backfill Active Seller Status
-- Description: Updates existing approved listings from 'offline' (waiting verification)
-- to 'online' (active), and ensures existing attachments are approved for public display.

begin;

-- 1. Backfill approved listings seller status
update public.palugada_listings
set
  seller_status = 'online',
  seller_status_note = 'Buka · Lapak aktif'
where status = 'approved'
  and seller_status_note like '%verifikasi%';

-- 2. Ensure existing attachments of approved listings are marked approved and visible
update public.attachments
set
  visibility = 'public_after_approval',
  moderation_status = 'approved'
where linked_type = 'palugada_listing'
  and linked_id in (
    select id from public.palugada_listings where status = 'approved'
  );

commit;
