from __future__ import annotations

import argparse
import pickle
from pathlib import Path

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

from risk_common import load_config, save_json, validate_and_read_csv


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train AI-01 academic risk classifier.")
    parser.add_argument(
        "--config",
        default="ml/risk/configs/risk_train.yaml",
        help="Path to yaml config",
    )
    return parser.parse_args()


def evaluate_multiclass(y_true: list[int], y_pred: list[int]) -> dict[str, float]:
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision_macro": float(precision_score(y_true, y_pred, average="macro", zero_division=0)),
        "recall_macro": float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
        "f1_macro": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
        "f1_weighted": float(f1_score(y_true, y_pred, average="weighted", zero_division=0)),
    }


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config)

    seed = int(cfg.get("seed", 42))
    data_cfg = cfg["data"]
    model_cfg = cfg["model"]
    train_cfg = cfg["train"]

    feature_columns = [str(col) for col in data_cfg["feature_columns"]]
    label_column = str(data_cfg["label_column"])
    low_threshold = float(train_cfg.get("low_threshold", 0.33))
    high_threshold = float(train_cfg.get("high_threshold", 0.66))

    train_df = validate_and_read_csv(data_cfg["train_file"], feature_columns + [label_column])
    valid_df = validate_and_read_csv(data_cfg["valid_file"], feature_columns + [label_column])

    x_train = train_df[feature_columns]
    y_train = train_df[label_column].astype(int)
    x_valid = valid_df[feature_columns]
    y_valid = valid_df[label_column].astype(int)

    params = model_cfg.get("params", {})
    clf = RandomForestClassifier(
        n_estimators=int(params.get("n_estimators", 300)),
        max_depth=None if params.get("max_depth") is None else int(params["max_depth"]),
        min_samples_split=int(params.get("min_samples_split", 2)),
        min_samples_leaf=int(params.get("min_samples_leaf", 1)),
        class_weight=str(params.get("class_weight", "balanced")),
        random_state=seed,
        n_jobs=int(params.get("n_jobs", -1)),
    )
    try:
        clf.fit(x_train, y_train)
    except PermissionError:
        clf.set_params(n_jobs=1)
        clf.fit(x_train, y_train)

    valid_preds = clf.predict(x_valid).astype(int).tolist()
    valid_metrics = evaluate_multiclass(y_valid.tolist(), valid_preds)

    output_dir = Path(train_cfg["output_dir"]) / "final"
    output_dir.mkdir(parents=True, exist_ok=True)

    artifact = {
        "model": clf,
        "feature_columns": feature_columns,
        "label_column": label_column,
        "low_threshold": low_threshold,
        "high_threshold": high_threshold,
        "model_name": str(model_cfg.get("name", "risk-random-forest")),
        "seed": seed,
    }
    with open(output_dir / "model.pkl", "wb") as f:
        pickle.dump(artifact, f)

    save_json(output_dir / "metrics_valid.json", valid_metrics)
    save_json(
        output_dir / "metadata.json",
        {
            "feature_columns": feature_columns,
            "label_column": label_column,
            "low_threshold": low_threshold,
            "high_threshold": high_threshold,
            "model_name": artifact["model_name"],
            "seed": seed,
        },
    )

    print("Training finished")
    print(f"Model saved to: {output_dir / 'model.pkl'}")
    print(f"Validation metrics: {valid_metrics}")


if __name__ == "__main__":
    main()
