from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from datasets import Dataset
from sklearn.metrics import accuracy_score, f1_score
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    DataCollatorWithPadding,
    Trainer,
    TrainingArguments,
    set_seed,
)

from sentiment_common import (
    build_label_maps,
    load_config,
    normalize_label,
    save_label_maps,
    validate_and_read_csv,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train PhoBERT sentiment classifier (AI-02).")
    parser.add_argument(
        "--config",
        default="ml/configs/sentiment_train.yaml",
        help="Path to yaml config",
    )
    return parser.parse_args()


def compute_metrics(eval_pred: tuple[np.ndarray, np.ndarray]) -> dict[str, float]:
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1_macro": f1_score(labels, preds, average="macro"),
        "f1_weighted": f1_score(labels, preds, average="weighted"),
    }


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config)

    seed = int(cfg.get("seed", 42))
    set_seed(seed)

    model_cfg = cfg["model"]
    data_cfg = cfg["data"]
    train_cfg = cfg["train"]

    labels = [normalize_label(label) for label in model_cfg["labels"]]
    if len(labels) != int(model_cfg.get("num_labels", len(labels))):
        raise ValueError("model.num_labels does not match model.labels length")

    label2id, id2label = build_label_maps(labels)

    train_df = validate_and_read_csv(
        data_cfg["train_file"],
        data_cfg["text_column"],
        data_cfg["label_column"],
    )
    valid_df = validate_and_read_csv(
        data_cfg["valid_file"],
        data_cfg["text_column"],
        data_cfg["label_column"],
    )

    text_col = data_cfg["text_column"]
    label_col = data_cfg["label_column"]

    for frame_name, frame in [("train", train_df), ("valid", valid_df)]:
        frame[text_col] = frame[text_col].astype(str).str.strip()
        frame[label_col] = frame[label_col].map(normalize_label)
        invalid = sorted(set(frame[label_col].unique()) - set(labels))
        if invalid:
            raise ValueError(f"{frame_name} has unknown labels: {invalid}. Allowed: {labels}")
        frame["label_id"] = frame[label_col].map(label2id)

    tokenizer = AutoTokenizer.from_pretrained(
        model_cfg["base_model"],
        use_fast=bool(model_cfg.get("use_fast_tokenizer", False)),
    )

    train_ds = Dataset.from_pandas(train_df[[text_col, "label_id"]], preserve_index=False)
    valid_ds = Dataset.from_pandas(valid_df[[text_col, "label_id"]], preserve_index=False)

    max_length = int(data_cfg.get("max_length", 256))

    def tokenize_fn(batch: dict[str, list]) -> dict[str, list]:
        encoded = tokenizer(
            batch[text_col],
            truncation=True,
            max_length=max_length,
        )
        encoded["labels"] = batch["label_id"]
        return encoded

    train_ds = train_ds.map(tokenize_fn, batched=True, remove_columns=[text_col, "label_id"])
    valid_ds = valid_ds.map(tokenize_fn, batched=True, remove_columns=[text_col, "label_id"])

    model = AutoModelForSequenceClassification.from_pretrained(
        model_cfg["base_model"],
        num_labels=len(labels),
        label2id=label2id,
        id2label=id2label,
    )

    output_dir = Path(train_cfg["output_dir"])
    output_dir.mkdir(parents=True, exist_ok=True)

    training_args = TrainingArguments(
        output_dir=str(output_dir),
        learning_rate=float(train_cfg.get("learning_rate", 2e-5)),
        per_device_train_batch_size=int(train_cfg.get("batch_size", 16)),
        per_device_eval_batch_size=int(train_cfg.get("batch_size", 16)),
        num_train_epochs=float(train_cfg.get("num_train_epochs", 3)),
        weight_decay=float(train_cfg.get("weight_decay", 0.01)),
        warmup_ratio=float(train_cfg.get("warmup_ratio", 0.1)),
        logging_steps=int(train_cfg.get("logging_steps", 20)),
        eval_strategy=str(train_cfg.get("eval_strategy", "epoch")),
        save_strategy=str(train_cfg.get("save_strategy", "epoch")),
        save_total_limit=int(train_cfg.get("save_total_limit", 2)),
        load_best_model_at_end=True,
        metric_for_best_model=str(train_cfg.get("metric_for_best_model", "f1_macro")),
        greater_is_better=bool(train_cfg.get("greater_is_better", True)),
        report_to=[],
        seed=seed,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=valid_ds,
        tokenizer=tokenizer,
        data_collator=DataCollatorWithPadding(tokenizer=tokenizer),
        compute_metrics=compute_metrics,
    )

    trainer.train()
    metrics = trainer.evaluate()
    trainer.save_model(str(output_dir / "final"))
    tokenizer.save_pretrained(str(output_dir / "final"))
    save_label_maps(str(output_dir / "final"), label2id, id2label)

    print("Training finished")
    print(f"Model saved to: {output_dir / 'final'}")
    print(f"Eval metrics: {metrics}")


if __name__ == "__main__":
    main()
