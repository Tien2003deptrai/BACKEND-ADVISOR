from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

OUTPUT_DIR = Path("ml/risk/data")


def derive_risk_label(
    gpa_current: np.ndarray,
    num_failed: np.ndarray,
    stress_level: np.ndarray,
    sentiment_score: np.ndarray,
    attendance_rate: np.ndarray,
) -> np.ndarray:
    # Hard rule priority:
    # - If GPA is very low OR failed subjects are too many => always High risk.
    hard_high = (gpa_current < 2.0) | (num_failed >= 3)

    # High indicators (user-defined)
    high_count = (
        (gpa_current < 2.5).astype(int)
        + (num_failed >= 2).astype(int)
        + (stress_level >= 3).astype(int)
        + (sentiment_score < -0.2).astype(int)
        + (attendance_rate < 0.7).astype(int)
    )

    # Low indicators (proposed)
    low_count = (
        (gpa_current >= 2.8).astype(int)
        + (num_failed == 0).astype(int)
        + (stress_level <= 2).astype(int)
        + (sentiment_score >= 0.2).astype(int)
        + (attendance_rate >= 0.8).astype(int)
    )

    # Priority:
    # 1) hard_high -> High
    # 2) high_count >= 3 -> High
    # 3) low_count >= 3 -> Low
    # 4) else -> Medium
    return np.where(hard_high, -1, np.where(high_count >= 3, -1, np.where(low_count >= 3, 1, 0))).astype(int)


def make_frame(n: int, seed: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    gpa_current = np.clip(rng.normal(loc=2.6, scale=0.8, size=n), 0.0, 4.0)
    attendance_rate = np.clip(rng.normal(loc=0.82, scale=0.15, size=n), 0.0, 1.0)
    num_failed = np.clip(rng.poisson(lam=1.0, size=n), 0, 5)
    stress_level = rng.integers(1, 6, size=n)
    motivation_score = rng.integers(1, 6, size=n)
    shcvht_participation = np.clip(rng.normal(loc=3.2, scale=1.1, size=n), 0.0, 5.0)
    study_hours = np.clip(rng.normal(loc=16, scale=6, size=n), 0.0, 30.0)
    sentiment_score = np.clip(rng.normal(loc=0.1, scale=0.55, size=n), -1.0, 1.0)

    raw_score = (
        (1 - (gpa_current / 4.0)) * 0.3
        + (1 - attendance_rate) * 0.15
        + np.minimum(num_failed / 5.0, 1.0) * 0.15
        + ((stress_level - 1) / 4.0) * 0.1
        + ((5 - motivation_score) / 4.0) * 0.1
        + (1 - np.minimum(shcvht_participation / 5.0, 1.0)) * 0.1
        + (1 - np.minimum(study_hours / 30.0, 1.0)) * 0.1
        + ((1 - sentiment_score) / 2.0) * 0.1
    )
    noise = rng.normal(loc=0.0, scale=0.05, size=n)
    risk_score = np.clip(raw_score + noise, 0.0, 1.0)
    gpa_out = np.round(gpa_current, 2)
    failed_out = num_failed.astype(int)
    attendance_out = np.round(attendance_rate, 3)
    sentiment_out = np.round(sentiment_score, 4)
    risk_label = derive_risk_label(
        gpa_current=gpa_out,
        num_failed=failed_out,
        stress_level=stress_level.astype(int),
        sentiment_score=sentiment_out,
        attendance_rate=attendance_out,
    )

    return pd.DataFrame(
        {
            "gpa_current": gpa_out,
            "attendance_rate": attendance_out,
            "num_failed": failed_out,
            "stress_level": stress_level.astype(int),
            "motivation_score": motivation_score.astype(int),
            "shcvht_participation": np.round(shcvht_participation, 3),
            "study_hours": np.round(study_hours, 2),
            "sentiment_score": sentiment_out,
            "risk_label": risk_label.astype(int),
        }
    )


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    train_df = make_frame(1200, seed=42)
    valid_df = make_frame(250, seed=43)
    test_df = make_frame(250, seed=44)

    train_df.to_csv(OUTPUT_DIR / "risk_train.csv", index=False, encoding="utf-8-sig")
    valid_df.to_csv(OUTPUT_DIR / "risk_valid.csv", index=False, encoding="utf-8-sig")
    test_df.to_csv(OUTPUT_DIR / "risk_test.csv", index=False, encoding="utf-8-sig")

    print("Generated risk datasets:")
    print(f"- {OUTPUT_DIR / 'risk_train.csv'} ({len(train_df)} rows)")
    print(f"- {OUTPUT_DIR / 'risk_valid.csv'} ({len(valid_df)} rows)")
    print(f"- {OUTPUT_DIR / 'risk_test.csv'} ({len(test_df)} rows)")


if __name__ == "__main__":
    main()
