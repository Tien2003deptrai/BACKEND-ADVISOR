from pathlib import Path

from transformers import AutoModelForSequenceClassification, AutoTokenizer

BASE_MODEL = "vinai/phobert-base"
TARGET_DIR = Path("ml/sentiment/artifacts/checkpoints/phobert-base-initial")
NUM_LABELS = 3


def main() -> None:
    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    model = AutoModelForSequenceClassification.from_pretrained(
        BASE_MODEL,
        num_labels=NUM_LABELS,
    )

    tokenizer.save_pretrained(TARGET_DIR)
    model.save_pretrained(TARGET_DIR)

    print(f"Prepared PhoBERT base model at: {TARGET_DIR}")


if __name__ == "__main__":
    main()
