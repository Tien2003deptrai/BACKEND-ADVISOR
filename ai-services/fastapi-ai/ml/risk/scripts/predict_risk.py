from __future__ import annotations

import argparse
import pickle

from risk_common import load_config


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Predict risk score for one sample.")
    parser.add_argument(
        "--config",
        default="ml/risk/configs/risk_train.yaml",
        help="Path to yaml config",
    )
    parser.add_argument("--checkpoint", default="", help="Path to model.pkl")
    parser.add_argument("--gpa_current", type=float, required=True)
    parser.add_argument("--attendance_rate", type=float, required=True)
    parser.add_argument("--num_failed", type=int, required=True)
    parser.add_argument("--stress_level", type=int, required=True)
    parser.add_argument("--motivation_score", type=int, required=True)
    parser.add_argument("--shcvht_participation", type=float, required=True)
    parser.add_argument("--study_hours", type=float, required=True)
    parser.add_argument("--sentiment_score", type=float, required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config)
    checkpoint = args.checkpoint or f"{cfg['train']['output_dir']}/final/model.pkl"

    with open(checkpoint, "rb") as f:
        artifact = pickle.load(f)

    model = artifact["model"]
    feature_columns = artifact["feature_columns"]

    payload = {
        "gpa_current": args.gpa_current,
        "attendance_rate": args.attendance_rate,
        "num_failed": args.num_failed,
        "stress_level": args.stress_level,
        "motivation_score": args.motivation_score,
        "shcvht_participation": args.shcvht_participation,
        "study_hours": args.study_hours,
        "sentiment_score": args.sentiment_score,
    }
    sample = [[payload[col] for col in feature_columns]]
    probs = model.predict_proba(sample)[0].tolist()
    classes = list(model.classes_)
    if -1 in classes:
        risk_idx = classes.index(-1)
        score = float(probs[risk_idx])
    else:
        score = float(max(probs))
    pred_idx = max(range(len(probs)), key=lambda i: probs[i])
    label = int(classes[pred_idx])

    print(f"risk_score={score:.6f}")
    print(f"risk_label={label}")


if __name__ == "__main__":
    main()
