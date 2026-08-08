#!/usr/bin/env python
"""Generate a local SQL loader for resident import staging.

The generated SQL contains resident names, addresses, and phone numbers. Keep it
under tmp/ and do not commit it.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DRY_RUN_DIR = ROOT / "tmp" / "resident-import-dry-run"
DEFAULT_SOURCE = ROOT / "public" / "assets" / "data" / "imports" / "Data Warga CGV Updated_Juli26.xlsx"
DEFAULT_OUTPUT = DEFAULT_DRY_RUN_DIR / "load_resident_import_staging.sql"


def sql_literal(value: object) -> str:
    if value is None:
        return "null"
    text = str(value)
    return "'" + text.replace("'", "''") + "'"


def sql_text_array(raw: str) -> str:
    values = [part for part in raw.split(";") if part]
    if not values:
        return "'{}'::text[]"
    return "array[" + ", ".join(sql_literal(value) for value in values) + "]::text[]"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def build_insert_rows(rows: list[dict[str, str]]) -> str:
    value_lines: list[str] = []
    for row in rows:
        raw_values = row.get("raw_values_json", "[]") or "[]"
        value_lines.append(
            "("
            + ", ".join(
                [
                    "(select id from batch)",
                    sql_literal(row["source_sheet"]),
                    str(int(row["source_row"])),
                    sql_literal(row["resident_name_raw"]),
                    sql_literal(row["address_raw"]),
                    sql_literal(row["cluster_raw"]),
                    sql_literal(row["cluster_normalized"]),
                    sql_literal(row["unit_number_raw"]),
                    sql_literal(row["unit_number_normalized"]),
                    sql_literal(row["phone_raw"]),
                    sql_literal(row["household_key"]),
                    str(int(row["confidence"])),
                    sql_literal(row["review_status"]),
                    sql_text_array(row["review_reason"]),
                    sql_text_array(row["import_note"]),
                    sql_literal(raw_values) + "::jsonb",
                ]
            )
            + ")"
        )
    return ",\n".join(value_lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate local staging SQL for resident import rows.")
    parser.add_argument("--dry-run-dir", type=Path, default=DEFAULT_DRY_RUN_DIR)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    dry_run_dir = args.dry_run_dir if args.dry_run_dir.is_absolute() else ROOT / args.dry_run_dir
    source = args.source if args.source.is_absolute() else ROOT / args.source
    output = args.output if args.output.is_absolute() else ROOT / args.output
    rows_path = dry_run_dir / "resident_import_rows.csv"
    summary_path = dry_run_dir / "resident_import_summary.json"

    rows = load_rows(rows_path)
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    summary["source_file_sha256"] = sha256_file(source)

    sql = f"""-- Local PII loader generated from resident dry-run.
-- Run after applying supabase/migrations/202607200001_resident_import_staging.sql.
-- Do not commit this file.

begin;

with batch as (
  insert into public.resident_import_batches (
    source_file_name,
    source_file_path,
    source_file_sha256,
    status,
    summary
  )
  values (
    {sql_literal(source.name)},
    {sql_literal(str(source.relative_to(ROOT)))},
    {sql_literal(summary["source_file_sha256"])},
    'reviewing',
    {sql_literal(json.dumps(summary, ensure_ascii=False))}::jsonb
  )
  returning id
)
insert into public.resident_import_rows (
  batch_id,
  source_sheet,
  source_row,
  resident_name_raw,
  address_raw,
  cluster_raw,
  cluster_normalized,
  unit_number_raw,
  unit_number_normalized,
  phone_raw,
  household_key,
  confidence,
  review_status,
  review_reason,
  import_note,
  raw_values
)
values
{build_insert_rows(rows)};

commit;
"""
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(sql, encoding="utf-8")
    print(f"Wrote staging loader for {len(rows)} rows to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
