"""
Phase 15: Data-Centric Label Rescue & Disagreement Filtering.

Builds clean soft labels by keeping only studies where Regex and LLM labels
agree across all target pathologies.

Expected input CSV format (both files):
  - One study identifier column: study_id (or id/series_id/exam_id)
  - One column per pathology in PATHOLOGIES (case-insensitive name matching)
  - Label values can be 0/1, true/false, yes/no

Example:
python backend/scripts/build_phase15_agreed_labels.py \
  --regex-csv data/regex_labels.csv \
  --llm-csv data/llm_labels.csv \
  --out-clean-csv data/phase15_clean_soft_labels.csv \
  --out-audit-json data/phase15_audit.json
"""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Dict, List, Tuple


PATHOLOGIES = [
    "ACL Tear",
    "MCL Injury",
    "Medial Meniscus Tear",
    "Lateral Meniscus Tear",
    "Medial OA",
    "Lateral OA",
    "Patellofemoral OA",
    "Joint Effusion",
    "Synovitis",
    "Baker Cyst",
    "Bone Contusion",
    "Fracture",
]

ID_CANDIDATES = ("study_id", "id", "series_id", "exam_id")


def _norm_key(value: str) -> str:
    return "".join(ch for ch in value.lower() if ch.isalnum())


def _to_hard_label(value: str) -> int:
    v = str(value).strip().lower()
    if v in {"1", "1.0", "true", "yes", "y", "pos", "positive"}:
        return 1
    if v in {"0", "0.0", "false", "no", "n", "neg", "negative"}:
        return 0
    raise ValueError(f"Unsupported label value: {value!r}")


def _resolve_columns(headers: List[str]) -> Tuple[str, Dict[str, str]]:
    norm_to_header = {_norm_key(h): h for h in headers}

    id_col = ""
    for c in ID_CANDIDATES:
        if c in headers:
            id_col = c
            break
        c_norm = _norm_key(c)
        if c_norm in norm_to_header:
            id_col = norm_to_header[c_norm]
            break
    if not id_col:
        raise ValueError(
            f"Could not find study ID column. Expected one of: {', '.join(ID_CANDIDATES)}"
        )

    pathology_to_col: Dict[str, str] = {}
    for pathology in PATHOLOGIES:
        key = _norm_key(pathology)
        if key not in norm_to_header:
            raise ValueError(
                f"Missing pathology column {pathology!r}. "
                f"Available columns: {headers}"
            )
        pathology_to_col[pathology] = norm_to_header[key]

    return id_col, pathology_to_col


def _load_labels(csv_path: Path) -> Dict[str, Dict[str, int]]:
    if not csv_path.exists():
        raise FileNotFoundError(f"Input CSV not found: {csv_path}")

    with csv_path.open("r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError(f"CSV has no header: {csv_path}")
        id_col, pathology_cols = _resolve_columns(reader.fieldnames)

        labels: Dict[str, Dict[str, int]] = {}
        for i, row in enumerate(reader, start=2):
            study_id = str(row.get(id_col, "")).strip()
            if not study_id:
                raise ValueError(f"Empty study ID at line {i} in {csv_path}")
            if study_id in labels:
                raise ValueError(f"Duplicate study ID {study_id!r} in {csv_path}")

            study_labels: Dict[str, int] = {}
            for pathology, col_name in pathology_cols.items():
                raw = row.get(col_name, "")
                study_labels[pathology] = _to_hard_label(raw)
            labels[study_id] = study_labels

    return labels


def build_phase15_labels(
    regex_labels: Dict[str, Dict[str, int]],
    llm_labels: Dict[str, Dict[str, int]],
    pos_target: float,
    neg_target: float,
) -> Tuple[List[Dict[str, object]], Dict[str, object], List[Dict[str, object]]]:
    common_studies = sorted(set(regex_labels) & set(llm_labels))
    only_regex = sorted(set(regex_labels) - set(llm_labels))
    only_llm = sorted(set(llm_labels) - set(regex_labels))

    kept_rows: List[Dict[str, object]] = []
    study_audit_rows: List[Dict[str, object]] = []

    disagreement_by_pathology = Counter()
    total_disagree_studies = 0

    for study_id in common_studies:
        r = regex_labels[study_id]
        l = llm_labels[study_id]

        disagreed = []
        for pathology in PATHOLOGIES:
            if r[pathology] != l[pathology]:
                disagreed.append(pathology)
                disagreement_by_pathology[pathology] += 1

        if disagreed:
            total_disagree_studies += 1
            study_audit_rows.append(
                {
                    "study_id": study_id,
                    "status": "dropped_disagreement",
                    "disagree_count": len(disagreed),
                    "disagree_pathologies": "|".join(disagreed),
                }
            )
            continue

        out = {"study_id": study_id}
        for pathology in PATHOLOGIES:
            out[pathology] = pos_target if r[pathology] == 1 else neg_target
        kept_rows.append(out)
        study_audit_rows.append(
            {
                "study_id": study_id,
                "status": "kept_agreement",
                "disagree_count": 0,
                "disagree_pathologies": "",
            }
        )

    kept = len(kept_rows)
    total_common = len(common_studies)
    drop_rate = (total_disagree_studies / total_common) if total_common else 0.0

    pathology_drop_rates = {
        p: (disagreement_by_pathology[p] / total_common if total_common else 0.0)
        for p in PATHOLOGIES
    }

    audit = {
        "phase": "phase15_label_rescue",
        "settings": {
            "positive_soft_target": pos_target,
            "negative_soft_target": neg_target,
            "agreement_rule": "drop study if any pathology disagrees between regex and llm",
        },
        "counts": {
            "regex_total_studies": len(regex_labels),
            "llm_total_studies": len(llm_labels),
            "common_studies": total_common,
            "kept_studies": kept,
            "dropped_disagreement_studies": total_disagree_studies,
            "regex_only_studies": len(only_regex),
            "llm_only_studies": len(only_llm),
        },
        "rates": {
            "drop_rate_over_common": round(drop_rate, 6),
            "keep_rate_over_common": round(1.0 - drop_rate, 6),
            "pathology_disagreement_rates": {
                k: round(v, 6) for k, v in pathology_drop_rates.items()
            },
        },
        "study_id_mismatches": {
            "regex_only_sample": only_regex[:20],
            "llm_only_sample": only_llm[:20],
        },
    }
    return kept_rows, audit, study_audit_rows


def _write_csv(rows: List[Dict[str, object]], out_path: Path, fieldnames: List[str]) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Phase 15 clean agreed soft labels.")
    parser.add_argument("--regex-csv", required=True, type=Path, help="Regex label CSV path")
    parser.add_argument("--llm-csv", required=True, type=Path, help="LLM label CSV path")
    parser.add_argument(
        "--out-clean-csv",
        required=True,
        type=Path,
        help="Output cleaned soft labels CSV",
    )
    parser.add_argument(
        "--out-audit-json",
        required=True,
        type=Path,
        help="Output audit JSON with keep/drop stats",
    )
    parser.add_argument(
        "--out-study-audit-csv",
        type=Path,
        default=None,
        help="Optional per-study keep/drop audit CSV",
    )
    parser.add_argument(
        "--pos-target",
        type=float,
        default=0.90,
        help="Soft target value for positive agreed labels (default: 0.90)",
    )
    parser.add_argument(
        "--neg-target",
        type=float,
        default=0.10,
        help="Soft target value for negative agreed labels (default: 0.10)",
    )
    args = parser.parse_args()

    if not (0.0 <= args.neg_target <= 1.0 and 0.0 <= args.pos_target <= 1.0):
        raise ValueError("pos-target and neg-target must be within [0, 1].")
    if args.pos_target <= args.neg_target:
        raise ValueError("pos-target must be greater than neg-target.")

    regex_labels = _load_labels(args.regex_csv)
    llm_labels = _load_labels(args.llm_csv)

    clean_rows, audit, study_audit_rows = build_phase15_labels(
        regex_labels=regex_labels,
        llm_labels=llm_labels,
        pos_target=args.pos_target,
        neg_target=args.neg_target,
    )

    _write_csv(
        clean_rows,
        args.out_clean_csv,
        fieldnames=["study_id", *PATHOLOGIES],
    )

    args.out_audit_json.parent.mkdir(parents=True, exist_ok=True)
    args.out_audit_json.write_text(json.dumps(audit, indent=2), encoding="utf-8")

    if args.out_study_audit_csv:
        _write_csv(
            study_audit_rows,
            args.out_study_audit_csv,
            fieldnames=["study_id", "status", "disagree_count", "disagree_pathologies"],
        )

    counts = audit["counts"]
    print("Phase 15 label rescue complete.")
    print(f"Common studies: {counts['common_studies']}")
    print(f"Kept studies: {counts['kept_studies']}")
    print(f"Dropped disagreements: {counts['dropped_disagreement_studies']}")
    print(f"Clean labels written to: {args.out_clean_csv}")
    print(f"Audit written to: {args.out_audit_json}")
    if args.out_study_audit_csv:
        print(f"Per-study audit written to: {args.out_study_audit_csv}")


if __name__ == "__main__":
    main()
