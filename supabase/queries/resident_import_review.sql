-- Review latest resident import staging batch.
-- Run after loading tmp/resident-import-dry-run/load_resident_import_staging.sql.

with latest_batch as (
  select id
  from public.resident_import_batches
  order by created_at desc
  limit 1
)
select
  batch.source_file_name,
  batch.status,
  batch.created_at,
  count(row.id) as row_count,
  count(distinct nullif(row.household_key, '')) as household_key_count,
  count(*) filter (where row.review_status = 'auto_matched') as auto_matched_rows,
  count(*) filter (where row.review_status = 'needs_review') as needs_review_rows
from latest_batch
join public.resident_import_batches batch on batch.id = latest_batch.id
left join public.resident_import_rows row on row.batch_id = batch.id
group by batch.id;

-- Cluster-level household candidate count for the latest batch.
with latest_batch as (
  select id
  from public.resident_import_batches
  order by created_at desc
  limit 1
),
household_keys as (
  select
    cluster_normalized,
    household_key,
    bool_or(review_status = 'needs_review') as needs_review
  from public.resident_import_rows
  where batch_id = (select id from latest_batch)
    and household_key <> ''
  group by cluster_normalized, household_key
)
select
  cluster_normalized,
  count(*) as household_candidates,
  count(*) filter (where needs_review) as needs_review_candidates,
  count(*) filter (where not needs_review) as ready_candidates
from household_keys
group by cluster_normalized
order by cluster_normalized;

-- Top review reasons for the latest batch.
with latest_batch as (
  select id
  from public.resident_import_batches
  order by created_at desc
  limit 1
)
select
  reason,
  count(*) as row_count
from public.resident_import_rows row
cross join lateral unnest(row.review_reason) as reason
where row.batch_id = (select id from latest_batch)
group by reason
order by row_count desc, reason;

-- Rows that need manual review.
with latest_batch as (
  select id
  from public.resident_import_batches
  order by created_at desc
  limit 1
)
select
  source_sheet,
  source_row,
  resident_name_raw,
  address_raw,
  cluster_normalized,
  unit_number_normalized,
  phone_raw,
  household_key,
  confidence,
  review_reason,
  import_note
from public.resident_import_rows
where batch_id = (select id from latest_batch)
  and review_status = 'needs_review'
order by cluster_normalized, unit_number_normalized, source_sheet, source_row;
