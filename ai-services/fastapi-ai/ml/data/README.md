# Sentiment Dataset Placeholder

Ban dat du lieu train/valid/test vao day:

- `sentiment_train.csv`
- `sentiment_valid.csv`
- `sentiment_test.csv` (optional but recommended)

Toi thieu can co 2 cot:

- `feedback_text`
- `sentiment_label` (NEGATIVE / NEUTRAL / POSITIVE)

Cot optional:

- `rating` (khong bat buoc cho baseline train hien tai)

## Sinh du lieu mau

Neu muon sinh du lieu sentiment tu script, chay:

```bash
python ml/data/gen_data.py
```

Ban co the tuy chinh trong `ml/data/gen_data.py` truoc khi chay:

- `COUNTS` (so luong mau moi nhan)
- `FIXED` (mau viet tay)
- `TEMPLATES_*` va `SLOTS` (mau cau va bien the)
- `CONTRAST_TEMPLATES` va `CONTRAST_SLOTS` (mau cau doi lap)
