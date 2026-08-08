#!/usr/bin/env python
"""Dry-run parser for CGV10 resident workbook.

This script extracts resident/address rows from the source XLSX, normalizes
cluster and unit values, flags rows that need review, and writes local CSV/JSON
outputs without touching Supabase.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import zipfile
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "public" / "assets" / "data" / "imports" / "Data Warga CGV Updated_Juli26.xlsx"
DEFAULT_OUTPUT_DIR = ROOT / "tmp" / "resident-import-dry-run"
NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}

KNOWN_CLUSTERS = [
    "Acacia",
    "Anthurium",
    "Aurora",
    "Caribbean",
    "Chiswick",
    "Colosseum",
    "Canyon",
    "Greenwich",
    "Gardenia",
    "Mandeville",
    "Meteora",
    "Pinnata",
    "Plumeria",
    "Ruko",
    "Victoria",
]

CLUSTER_ALIASES = {
    "ACACIA": "Acacia",
    "ANTHURIUM": "Anthurium",
    "AURORA": "Aurora",
    "CARIBEAN": "Caribbean",
    "CAREBIAN": "Caribbean",
    "CARIBBEAN": "Caribbean",
    "CHIS WICK": "Chiswick",
    "CHISWICK": "Chiswick",
    "COLOSEUM": "Colosseum",
    "COLOSSEUM": "Colosseum",
    "COLLOSEUM": "Colosseum",
    "CANYON": "Canyon",
    "GREEN WICH": "Greenwich",
    "GREENWICH": "Greenwich",
    "GARDENIA": "Gardenia",
    "MANDEVIL": "Mandeville",
    "MANDEVILL": "Mandeville",
    "MANDEVILLE": "Mandeville",
    "MENDEVIL": "Mandeville",
    "METEORA": "Meteora",
    "PINNATA": "Pinnata",
    "PLUMERIA": "Plumeria",
    "RUKO": "Ruko",
    "VICTORIA": "Victoria",
}

NOISE_VALUES = {
    "",
    "-",
    "--",
    "NO",
    "N0",
    "NOMOR",
    "NAMA",
    "ALAMAT",
    "CLUSTER",
    "KETERANGAN",
    "NO HP",
    "NO. HP",
    "TELP",
    "TELEPON",
    "DOMISILI",
}


@dataclass
class ImportRow:
    source_sheet: str
    source_row: int
    resident_name_raw: str
    address_raw: str
    cluster_raw: str
    cluster_normalized: str
    phone_raw: str
    unit_number_raw: str
    unit_number_normalized: str
    household_key: str
    confidence: int
    review_status: str
    review_reason: str
    import_note: str
    raw_values_json: str


def col_index(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha())
    total = 0
    for ch in letters:
        total = total * 26 + (ord(ch.upper()) - 64)
    return total - 1


def text_content(node: ET.Element | None) -> str:
    if node is None:
        return ""
    return "".join(node.itertext()).strip()


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\u00a0", " ")).strip()


def normalize_key(value: str) -> str:
    value = normalize_space(value).upper()
    value = re.sub(r"[^\w\s]", " ", value)
    return normalize_space(value)


def load_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    return [text_content(si) for si in root.findall("main:si", NS)]


def load_sheet_paths(zf: zipfile.ZipFile) -> list[tuple[str, str]]:
    workbook = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rel_targets = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in rels.findall("pkgrel:Relationship", NS)
    }
    sheets: list[tuple[str, str]] = []
    for sheet in workbook.findall("main:sheets/main:sheet", NS):
        name = sheet.attrib["name"]
        rel_id = sheet.attrib[f"{{{NS['rel']}}}id"]
        target = rel_targets[rel_id].lstrip("/")
        path = target if target.startswith("xl/") else f"xl/{target}"
        sheets.append((name, path))
    return sheets


def parse_cell(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t", "")
    if cell_type == "inlineStr":
        return normalize_space(text_content(cell.find("main:is", NS)))

    value_node = cell.find("main:v", NS)
    raw_value = text_content(value_node)
    if cell_type == "s" and raw_value.isdigit():
        index = int(raw_value)
        if 0 <= index < len(shared_strings):
            return normalize_space(shared_strings[index])
    return normalize_space(raw_value)


def parse_sheet(zf: zipfile.ZipFile, path: str, shared_strings: list[str]) -> list[tuple[int, list[str]]]:
    root = ET.fromstring(zf.read(path))
    rows: list[tuple[int, list[str]]] = []
    for row in root.findall(".//main:sheetData/main:row", NS):
        row_num = int(row.attrib.get("r", "0"))
        values: list[str] = []
        for cell in row.findall("main:c", NS):
            idx = col_index(cell.attrib.get("r", "A1"))
            while len(values) <= idx:
                values.append("")
            values[idx] = parse_cell(cell, shared_strings)
        while values and values[-1] == "":
            values.pop()
        rows.append((row_num, values))
    return rows


def canonical_cluster(raw: str) -> str:
    key = normalize_key(raw)
    if key in CLUSTER_ALIASES:
        return CLUSTER_ALIASES[key]
    return ""


def find_cluster(text: str) -> tuple[str, str]:
    key = normalize_key(text)
    for alias, canonical in sorted(CLUSTER_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        if re.search(rf"(^|\s){re.escape(alias)}(\s|$)", key):
            return canonical, alias.title()
    return "", ""


def normalize_unit(raw: str) -> str:
    value = normalize_space(raw).upper()
    value = re.sub(r"\b(NO|NOMOR|UNIT|BLOK|BLOCK|CLUSTER|RUMAH)\b", " ", value)
    value = re.sub(r"[^A-Z0-9/\- ]", " ", value)
    value = normalize_space(value)
    match = re.search(r"\d+[A-Z]?(?:[-/]\d+[A-Z]?)?", value)
    return match.group(0).replace(" ", "") if match else ""


def extract_phone(raw: str) -> str:
    phones = re.findall(r"(?:\+?62|0)\d[\d\s\-]{7,}\d", raw)
    return "; ".join(normalize_space(phone) for phone in phones)


def strip_phone(raw: str) -> str:
    return re.sub(r"(?:\+?62|0)\d[\d\s\-]{7,}\d", " ", raw)


def normalize_unit_from_address(address: str, cluster: str) -> str:
    text = strip_phone(address)
    cluster_variants = [cluster.upper()]
    cluster_variants.extend(alias for alias, canonical in CLUSTER_ALIASES.items() if canonical == cluster)
    pattern = "|".join(re.escape(variant) for variant in sorted(set(cluster_variants), key=len, reverse=True))
    match = re.search(
        rf"(?:{pattern})\s*(?:NO\.?|NOMOR|UNIT|BLOK|BLOCK)?\s*([0-9]+[A-Z]?(?:[-/][0-9]+[A-Z]?)?)",
        normalize_key(text),
    )
    if match:
        return match.group(1)
    return normalize_unit(text)


def split_address(address: str, fallback_cluster: str = "") -> tuple[str, str, str]:
    cluster, cluster_raw = find_cluster(address)
    unit = normalize_unit_from_address(address, cluster) if cluster else normalize_unit(strip_phone(address))
    if not cluster and fallback_cluster:
        cluster = canonical_cluster(fallback_cluster)
        cluster_raw = fallback_cluster
        unit = normalize_unit_from_address(address, cluster) if cluster else unit
    return cluster, cluster_raw, unit


def likely_name(value: str) -> bool:
    key = normalize_key(value)
    if key in NOISE_VALUES or canonical_cluster(value):
        return False
    if re.search(r"\d", value):
        return False
    return len(value) >= 3


def choose_resident_name(values: list[str], address_index: int | None) -> str:
    candidates = values[: address_index if address_index is not None else len(values)]
    for value in candidates:
        if likely_name(value):
            return value
    for value in values:
        if likely_name(value):
            return value
    return ""


def iter_candidate_rows(sheet_name: str, rows: list[tuple[int, list[str]]]) -> Iterable[ImportRow]:
    sheet_cluster = canonical_cluster(sheet_name)
    for row_num, values in rows:
        clean_values = [normalize_space(value) for value in values]
        joined = " ".join(value for value in clean_values if value)
        if not joined:
            continue

        row_key = normalize_key(joined)
        if row_key in NOISE_VALUES or row_key.startswith("DATA WARGA"):
            continue

        cluster, cluster_raw, unit = split_address(joined, sheet_cluster)
        address_index = next(
            (idx for idx, value in enumerate(clean_values) if find_cluster(value)[0] or normalize_unit(value)),
            None,
        )
        resident_name = choose_resident_name(clean_values, address_index)
        if not cluster and not unit and not resident_name:
            continue
        if not cluster and sheet_cluster:
            cluster = sheet_cluster
            cluster_raw = sheet_name
        if not unit:
            unit = normalize_unit(joined)

        address_raw = joined
        confidence = 100
        reasons: list[str] = []
        if not resident_name:
            confidence -= 30
            reasons.append("missing_resident_name")
        if not cluster:
            confidence -= 35
            reasons.append("unknown_cluster")
        if not unit:
            confidence -= 35
            reasons.append("missing_unit_number")
        if cluster == "Ruko":
            confidence -= 25
            reasons.append("ruko_needs_separate_handling")
        if cluster == "Aurora" and unit == "3A":
            confidence -= 40
            reasons.append("aurora_3a_needs_confirmation")

        household_key = f"{cluster}|{unit}" if cluster and unit else ""
        yield ImportRow(
            source_sheet=sheet_name,
            source_row=row_num,
            resident_name_raw=resident_name,
            address_raw=address_raw,
            cluster_raw=cluster_raw,
            cluster_normalized=cluster,
            phone_raw=extract_phone(joined),
            unit_number_raw=unit,
            unit_number_normalized=unit,
            household_key=household_key,
            confidence=max(confidence, 0),
            review_status="pending",
            review_reason=";".join(reasons),
            import_note="",
            raw_values_json=json.dumps(clean_values, ensure_ascii=False),
        )


def apply_duplicate_review(rows: list[ImportRow]) -> None:
    by_key: dict[str, list[ImportRow]] = defaultdict(list)
    for row in rows:
        if row.household_key:
            by_key[row.household_key].append(row)

    for key_rows in by_key.values():
        names = {normalize_key(row.resident_name_raw) for row in key_rows if row.resident_name_raw}
        sheets = {row.source_sheet for row in key_rows}
        if len(names) > 1:
            for row in key_rows:
                append_reason(row, "same_address_multiple_names")
                row.confidence = min(row.confidence, 65)
        elif len(sheets) > 1:
            for row in key_rows:
                append_note(row, "duplicate_seen_in_multiple_sheets")
                row.confidence = min(row.confidence, 85)

    for row in rows:
        if row.review_reason:
            row.review_status = "needs_review"
        elif row.confidence >= 80:
            row.review_status = "auto_matched"
        else:
            row.review_status = "needs_review"


def append_reason(row: ImportRow, reason: str) -> None:
    reasons = [part for part in row.review_reason.split(";") if part]
    if reason not in reasons:
        reasons.append(reason)
    row.review_reason = ";".join(reasons)


def append_note(row: ImportRow, note: str) -> None:
    notes = [part for part in row.import_note.split(";") if part]
    if note not in notes:
        notes.append(note)
    row.import_note = ";".join(notes)


def write_csv(path: Path, rows: list[ImportRow]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = list(asdict(rows[0]).keys()) if rows else [field.name for field in ImportRow.__dataclass_fields__.values()]
    with path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow(asdict(row))


def write_dict_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def build_household_candidates(rows: list[ImportRow]) -> list[dict[str, object]]:
    grouped: dict[str, list[ImportRow]] = defaultdict(list)
    for row in rows:
        if row.household_key:
            grouped[row.household_key].append(row)

    candidates: list[dict[str, object]] = []
    for household_key, key_rows in grouped.items():
        best = sorted(key_rows, key=lambda row: (row.confidence, -row.source_row), reverse=True)[0]
        names = sorted({row.resident_name_raw for row in key_rows if row.resident_name_raw}, key=str.casefold)
        phones = sorted({row.phone_raw for row in key_rows if row.phone_raw})
        sheets = sorted({row.source_sheet for row in key_rows})
        reasons = sorted({
            reason
            for row in key_rows
            for reason in row.review_reason.split(";")
            if reason
        })
        notes = sorted({
            note
            for row in key_rows
            for note in row.import_note.split(";")
            if note
        })
        status = "ready"
        if reasons:
            status = "needs_review"
        candidates.append(
            {
                "household_key": household_key,
                "cluster_normalized": best.cluster_normalized,
                "unit_number_normalized": best.unit_number_normalized,
                "primary_resident_name_suggested": best.resident_name_raw,
                "resident_names_seen": "; ".join(names),
                "phone_numbers_seen": "; ".join(phones),
                "source_sheets_seen": "; ".join(sheets),
                "source_row_count": len(key_rows),
                "confidence": min(row.confidence for row in key_rows),
                "candidate_status": status,
                "review_reason": ";".join(reasons),
                "import_note": ";".join(notes),
            }
        )
    return sorted(candidates, key=lambda row: (str(row["cluster_normalized"]), natural_unit_key(str(row["unit_number_normalized"]))))


def natural_unit_key(value: str) -> tuple[int, str]:
    match = re.match(r"(\d+)(.*)", value)
    if not match:
        return (10**9, value)
    return (int(match.group(1)), match.group(2))


def write_summary(path: Path, rows: list[ImportRow], source: Path) -> None:
    by_status = Counter(row.review_status for row in rows)
    by_cluster = Counter(row.cluster_normalized or "(unknown)" for row in rows)
    by_reason = Counter(
        reason
        for row in rows
        for reason in row.review_reason.split(";")
        if reason
    )
    unique_households = {row.household_key for row in rows if row.household_key}
    summary = {
        "source": str(source.relative_to(ROOT)),
        "total_candidate_rows": len(rows),
        "unique_household_keys": len(unique_households),
        "status_counts": dict(by_status),
        "cluster_counts": dict(sorted(by_cluster.items())),
        "review_reason_counts": dict(by_reason.most_common()),
    }
    path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Dry-run CGV10 resident workbook import.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()

    source = args.source if args.source.is_absolute() else ROOT / args.source
    out_dir = args.out_dir if args.out_dir.is_absolute() else ROOT / args.out_dir

    with zipfile.ZipFile(source) as zf:
        shared_strings = load_shared_strings(zf)
        all_rows: list[ImportRow] = []
        for sheet_name, sheet_path in load_sheet_paths(zf):
            sheet_rows = parse_sheet(zf, sheet_path, shared_strings)
            all_rows.extend(iter_candidate_rows(sheet_name, sheet_rows))

    apply_duplicate_review(all_rows)
    review_rows = [row for row in all_rows if row.review_status == "needs_review"]
    household_candidates = build_household_candidates(all_rows)
    household_review_candidates = [
        row for row in household_candidates if row["candidate_status"] == "needs_review"
    ]

    write_csv(out_dir / "resident_import_rows.csv", all_rows)
    write_csv(out_dir / "resident_import_needs_review.csv", review_rows)
    household_fields = [
        "household_key",
        "cluster_normalized",
        "unit_number_normalized",
        "primary_resident_name_suggested",
        "resident_names_seen",
        "phone_numbers_seen",
        "source_sheets_seen",
        "source_row_count",
        "confidence",
        "candidate_status",
        "review_reason",
        "import_note",
    ]
    write_dict_csv(out_dir / "household_candidates.csv", household_candidates, household_fields)
    write_dict_csv(out_dir / "household_candidates_needs_review.csv", household_review_candidates, household_fields)
    write_summary(out_dir / "resident_import_summary.json", all_rows, source)

    print(f"Wrote {len(all_rows)} candidate rows to {out_dir / 'resident_import_rows.csv'}")
    print(f"Wrote {len(review_rows)} review rows to {out_dir / 'resident_import_needs_review.csv'}")
    print(f"Wrote {len(household_candidates)} household candidates to {out_dir / 'household_candidates.csv'}")
    print(f"Wrote {len(household_review_candidates)} household review candidates to {out_dir / 'household_candidates_needs_review.csv'}")
    print(f"Wrote summary to {out_dir / 'resident_import_summary.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
