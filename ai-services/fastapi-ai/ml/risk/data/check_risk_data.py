from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path

DATA_DIR = Path("ml/risk/data")
FILES = {
    "train": DATA_DIR / "risk_train.csv",
    "valid": DATA_DIR / "risk_valid.csv",
    "test": DATA_DIR / "risk_test.csv",
}

LABEL_NAME = {
    -1: "High",
    0: "Medium",
    1: "Low",
}


def summarize_file(path: Path) -> tuple[int, Counter]:
    rows = list(csv.DictReader(path.open("r", encoding="utf-8-sig", newline="")))
    counts = Counter(int(float(r["risk_label"])) for r in rows)
    return len(rows), counts


def main() -> None:
    print("Risk dataset label distribution")
    for split, path in FILES.items():
        if not path.exists():
            print(f"- {split}: missing file -> {path}")
            continue

        total, counts = summarize_file(path)
        pct = {k: (counts.get(k, 0) / total if total else 0.0) for k in (-1, 0, 1)}

        print(f"- {split}: total={total}")
        for key in (-1, 0, 1):
            print(
                f"  {key} ({LABEL_NAME[key]}): "
                f"{counts.get(key, 0)} ({pct[key] * 100:.1f}%)"
            )


if __name__ == "__main__":
    main()
