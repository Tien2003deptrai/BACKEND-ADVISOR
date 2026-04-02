from __future__ import annotations

import pickle

from risk_common import load_config

# Edit values here, then run:
# uv run python ml/risk/scripts/predict_risk_edit_input.py
PAYLOAD = {
    "gpa_current": 2.1,
    "attendance_rate": 0.72,
    "num_failed": 2,
    "stress_level": 4,
    "motivation_score": 2,
    "shcvht_participation": 0.6,
    "study_hours": 12.0,
    "sentiment_score": -0.2,
}

CONFIG_PATH = "ml/risk/configs/risk_train.yaml"
CHECKPOINT_PATH = ""  # Leave empty to use config train.output_dir/final/model.pkl


def main() -> None:
    cfg = load_config(CONFIG_PATH)
    checkpoint = CHECKPOINT_PATH or f"{cfg['train']['output_dir']}/final/model.pkl"

    with open(checkpoint, "rb") as f:
        artifact = pickle.load(f)

    model = artifact["model"]
    feature_columns = artifact["feature_columns"]

    missing = [col for col in feature_columns if col not in PAYLOAD]
    if missing:
        raise ValueError(f"PAYLOAD missing required fields: {missing}")

    sample = [[PAYLOAD[col] for col in feature_columns]]
    probs = model.predict_proba(sample)[0].tolist()
    classes = list(model.classes_)
    if -1 in classes:
        risk_idx = classes.index(-1)
        score = float(probs[risk_idx])
    else:
        score = float(max(probs))
    pred_idx = max(range(len(probs)), key=lambda i: probs[i])
    label = int(classes[pred_idx])

    print("Input payload:", PAYLOAD)
    print(f"risk_score={score:.6f}")
    print(f"risk_label={label}")


if __name__ == "__main__":
    main()
