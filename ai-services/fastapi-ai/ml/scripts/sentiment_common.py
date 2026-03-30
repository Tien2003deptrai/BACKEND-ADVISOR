from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pandas as pd
import yaml


def load_config(config_path: str) -> dict[str, Any]:
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def normalize_label(value: Any) -> str:
    return str(value).strip().upper()


def validate_and_read_csv(file_path: str, text_column: str, label_column: str) -> pd.DataFrame:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Missing dataset file: {file_path}")

    df = pd.read_csv(path)
    missing = [col for col in [text_column, label_column] if col not in df.columns]
    if missing:
        raise ValueError(f"{file_path} missing required columns: {missing}")
    return df


def build_label_maps(labels: list[str]) -> tuple[dict[str, int], dict[int, str]]:
    label2id = {label: idx for idx, label in enumerate(labels)}
    id2label = {idx: label for label, idx in label2id.items()}
    return label2id, id2label


def save_label_maps(output_dir: str, label2id: dict[str, int], id2label: dict[int, str]) -> None:
    target = Path(output_dir)
    target.mkdir(parents=True, exist_ok=True)
    with open(target / "label_mapping.json", "w", encoding="utf-8") as f:
        json.dump({"label2id": label2id, "id2label": id2label}, f, ensure_ascii=False, indent=2)
