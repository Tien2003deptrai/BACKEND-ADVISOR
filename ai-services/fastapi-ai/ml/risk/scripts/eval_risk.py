from __future__ import annotations

import argparse
import pickle

from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

from risk_common import load_config, validate_and_read_csv


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate trained AI-01 risk classifier.")
    parser.add_argument(
        "--config",
        default="ml/risk/configs/risk_train.yaml",
        help="Path to yaml config",
    )
    parser.add_argument(
        "--checkpoint",
        default="",
        help="Path to model.pkl. If empty, use output_dir/final/model.pkl from config.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config)

    data_cfg = cfg["data"]
    train_cfg = cfg["train"]

    checkpoint = args.checkpoint or f"{train_cfg['output_dir']}/final/model.pkl"
    with open(checkpoint, "rb") as f:
        artifact = pickle.load(f)

    model = artifact["model"]
    feature_columns = artifact["feature_columns"]
    label_column = artifact.get("label_column", data_cfg["label_column"])

    eval_file = data_cfg.get("test_file") or data_cfg["valid_file"]
    eval_df = validate_and_read_csv(eval_file, feature_columns + [label_column])

    x_eval = eval_df[feature_columns]
    y_eval = eval_df[label_column].astype(int)

    preds = model.predict(x_eval).astype(int).tolist()

    metrics = {
        "accuracy": float(accuracy_score(y_eval, preds)),
        "precision_macro": float(precision_score(y_eval, preds, average="macro", zero_division=0)),
        "recall_macro": float(recall_score(y_eval, preds, average="macro", zero_division=0)),
        "f1_macro": float(f1_score(y_eval, preds, average="macro", zero_division=0)),
        "f1_weighted": float(f1_score(y_eval, preds, average="weighted", zero_division=0)),
    }

    print(f"Checkpoint: {checkpoint}")
    print(f"Eval file: {eval_file}")
    print(f"Metrics: {metrics}")


if __name__ == "__main__":
    main()
