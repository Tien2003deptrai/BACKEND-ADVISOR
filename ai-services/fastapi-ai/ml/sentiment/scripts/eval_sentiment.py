from __future__ import annotations

import argparse

import numpy as np
import torch
from sklearn.metrics import accuracy_score, classification_report, f1_score
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from sentiment_common import (
    load_config,
    normalize_label,
    validate_and_read_csv,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate trained sentiment checkpoint.")
    parser.add_argument(
        "--config",
        default="ml/sentiment/configs/sentiment_train.yaml",
        help="Path to yaml config",
    )
    parser.add_argument(
        "--checkpoint",
        default=None,
        help="Checkpoint path (default: <output_dir>/final)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config)

    model_cfg = cfg["model"]
    data_cfg = cfg["data"]
    train_cfg = cfg["train"]

    labels = [normalize_label(label) for label in model_cfg["labels"]]
    label2id = {label: idx for idx, label in enumerate(labels)}
    id2label = {idx: label for label, idx in label2id.items()}

    checkpoint = args.checkpoint or f"{train_cfg['output_dir']}/final"
    tokenizer = AutoTokenizer.from_pretrained(checkpoint)
    model = AutoModelForSequenceClassification.from_pretrained(checkpoint)
    model.eval()

    test_file = data_cfg.get("test_file") or data_cfg.get("valid_file")
    text_col = data_cfg["text_column"]
    label_col = data_cfg["label_column"]
    max_length = int(data_cfg.get("max_length", 256))

    df = validate_and_read_csv(test_file, text_col, label_col)
    df[text_col] = df[text_col].astype(str).str.strip()
    df[label_col] = df[label_col].map(normalize_label)
    invalid = sorted(set(df[label_col].unique()) - set(labels))
    if invalid:
        raise ValueError(f"test has unknown labels: {invalid}. Allowed: {labels}")

    y_true: list[int] = [label2id[label] for label in df[label_col].tolist()]
    y_pred: list[int] = []

    batch_size = 32
    texts = df[text_col].tolist()
    for start in range(0, len(texts), batch_size):
        batch = texts[start : start + batch_size]
        encoded = tokenizer(
            batch,
            return_tensors="pt",
            truncation=True,
            max_length=max_length,
            padding=True,
        )
        with torch.no_grad():
            logits = model(**encoded).logits
        preds = torch.argmax(logits, dim=-1).cpu().numpy().tolist()
        y_pred.extend(preds)

    accuracy = accuracy_score(y_true, y_pred)
    f1_macro = f1_score(y_true, y_pred, average="macro")
    f1_weighted = f1_score(y_true, y_pred, average="weighted")

    print("Evaluation done")
    print(f"Checkpoint: {checkpoint}")
    print(f"Samples: {len(y_true)}")
    print(f"accuracy={accuracy:.4f} | f1_macro={f1_macro:.4f} | f1_weighted={f1_weighted:.4f}")
    print(classification_report(y_true, y_pred, target_names=[id2label[i] for i in range(len(labels))]))


if __name__ == "__main__":
    main()
