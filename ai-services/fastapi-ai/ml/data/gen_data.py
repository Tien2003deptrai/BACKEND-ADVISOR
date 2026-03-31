from __future__ import annotations

import csv
import random
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, OSError):
        pass

import pandas as pd

OUTPUT_DIR = Path(__file__).resolve().parent
SEED = 42
random.seed(SEED)

COUNTS = {"POSITIVE": 334, "NEUTRAL": 333, "NEGATIVE": 333}


FIXED: list[tuple[str, str]] = [
    # POSITIVE
    ("Thầy dạy dễ hiểu lắm, em theo kịp hết.", "POSITIVE"), 
    ("Buổi học hôm nay thú vị hơn em tưởng.", "POSITIVE"),
    ("Em thấy môn này khá hay, không chán như em nghĩ.", "POSITIVE"),
    ("Cô giải thích rõ ràng, em hiểu bài nhanh hơn nhiều.", "POSITIVE"),
    ("Học nhóm hiệu quả ghê, em thích kiểu học này.", "POSITIVE"),
    ("Bài giảng tuần này dễ hiểu hơn hẳn tuần trước.", "POSITIVE"),
    ("Em cảm thấy tự tin hơn sau buổi ôn tập.", "POSITIVE"),
    ("Tài liệu thầy cho rõ ràng, em tự đọc được.", "POSITIVE"),
    ("Môn này không khó như em nghĩ ban đầu.", "POSITIVE"),
    ("Em thích cái cách thầy kết nối lý thuyết với thực tế.", "POSITIVE"),
    ("Lớp học thoải mái, em dám phát biểu hơn.", "POSITIVE"),
    ("Feedback của cô rất cụ thể, em biết cần sửa chỗ nào.", "POSITIVE"),
    ("Dạo này em học vào hơn, có lẽ do bài hay hơn.", "POSITIVE"),
    ("Em thấy tiến bộ rõ so với đầu kỳ.", "POSITIVE"),
    ("Nói chung em hài lòng với cách học kỳ này.", "POSITIVE"),
    ("Em cảm thấy được hỗ trợ nhiều, không bị bơ như các môn khác.", "POSITIVE"),
    ("Bài tập vừa sức, em làm được mà vẫn học được thêm.", "POSITIVE"),
    ("Em thích được học theo nhóm nhỏ hơn, trao đổi được nhiều hơn.", "POSITIVE"),
    ("Thầy hay cho ví dụ thực tế lắm, dễ nhớ hơn.", "POSITIVE"),
    ("Em thấy yên tâm hơn sau khi hỏi thầy.", "POSITIVE"),

    # NEUTRAL
    ("Môn này bình thường thôi, không quá khó cũng không quá dễ.", "NEUTRAL"),
    ("Em học được nhưng chưa thực sự hứng thú lắm.", "NEUTRAL"),
    ("Tạm ổn, em vẫn theo kịp bài.", "NEUTRAL"),
    ("Chưa có gì nổi bật, mọi thứ đang ở mức trung bình.", "NEUTRAL"),
    ("Em thấy bình thường, không có vấn đề gì đặc biệt.", "NEUTRAL"),
    ("Bài hơi khó nhưng em vẫn xử lý được.", "NEUTRAL"),
    ("Em chưa có cảm xúc gì mạnh với môn này, học xong rồi thôi.", "NEUTRAL"),
    ("Tốc độ học vừa phải, em không bị quá tải.", "NEUTRAL"),
    ("Em cần thêm thời gian để quen với cách dạy.", "NEUTRAL"),
    ("Môn này ổn, không khiến em thích hay chán gì đặc biệt.", "NEUTRAL"),
    ("Em học được những thứ cần thiết, không hơn không kém.", "NEUTRAL"),
    ("Khối lượng bài vừa đủ, không nhàn quá mà cũng không nhiều quá.", "NEUTRAL"),
    ("Em vẫn theo kịp, dù có một số phần hơi mơ hồ.", "NEUTRAL"),
    ("Nói chung thì ổn ạ.", "NEUTRAL"),
    ("Môn này không phải sở thích của em nhưng em vẫn cố học.", "NEUTRAL"),
    ("Em thấy mọi thứ đang đi đúng hướng, chưa có gì đáng lo.", "NEUTRAL"),
    ("Bình thường, em không thấy khó hơn các kỳ trước.", "NEUTRAL"),
    ("Em học theo được nhưng cần đọc thêm tài liệu ngoài.", "NEUTRAL"),
    ("Chưa hứng thú lắm, nhưng em vẫn hoàn thành bài đúng hạn.", "NEUTRAL"),
    ("Em thấy môn này cần kiên nhẫn, chứ không đặc biệt khó.", "NEUTRAL"),

    # NEGATIVE
    ("Em đang rất stress, bài nhiều mà thời gian không đủ.", "NEGATIVE"),
    ("Không hiểu bài, hỏi thì ngại, cứ thế ngồi ngẩn.", "NEGATIVE"),
    ("Deadline dồn hết vào một tuần, em không thở được.", "NEGATIVE"),
    ("Em thấy chán, học mãi mà không thấy hiểu thêm được gì.", "NEGATIVE"),
    ("Áp lực quá, em không ngủ được mấy ngày nay.", "NEGATIVE"),
    ("Em đang cảm thấy đuối sức, theo không kịp tiến độ.", "NEGATIVE"),
    ("Bài giảng nhanh quá, em ghi không kịp chứ chưa nói hiểu.", "NEGATIVE"),
    ("Em muốn bỏ cuộc thật sự, căng thẳng quá mức.", "NEGATIVE"),
    ("Không có tài liệu rõ ràng, em mò mẫm mãi không ra.", "NEGATIVE"),
    ("Em cảm thấy tụt hậu so với cả lớp.", "NEGATIVE"),
    ("Mỗi lần tới môn này là em thấy nặng nề hẳn.", "NEGATIVE"),
    ("Em không theo kịp và không biết hỏi ai.", "NEGATIVE"),
    ("Nhóm em làm việc không hiệu quả, ai cũng mệt hết.", "NEGATIVE"),
    ("Em thấy nản vì cố mãi mà điểm vẫn không cải thiện.", "NEGATIVE"),
    ("Cách chấm điểm không rõ ràng, em không biết mình sai ở đâu.", "NEGATIVE"),
    ("Em bị quá tải thật sự, không biết ưu tiên cái gì nữa.", "NEGATIVE"),
    ("Giờ học căng thẳng, em ra về là đầu óc trống không.", "NEGATIVE"),
    ("Em cảm thấy bị bỏ lại, cô dạy nhanh mà em chưa kịp tiêu hoá.", "NEGATIVE"),
    ("Thật ra em đang rất mệt, học kiểu này không vào đầu được.", "NEGATIVE"),
    ("Em không muốn than thở nhưng dạo này thật sự quá sức.", "NEGATIVE"),
]

# ---------------------------------------------------------------------------
# Template có slot – đa dạng cấu trúc câu
# ---------------------------------------------------------------------------
TEMPLATES_POS = [
    "Em thấy {feeling} khi học {topic}, thầy/cô giải thích dễ hiểu lắm.",
    "{topic} thật ra không khó như em nghĩ, em thấy {feeling}.",
    "Học {topic} xong em thấy {feeling}, hiểu ra nhiều thứ hơn.",
    "Dạo này {topic} khiến em {feeling}, có lẽ nhờ {reason}.",
    "Em {feeling} khi tiếp cận {topic}, cảm giác rất khác so với trước.",
    "Nhờ {reason}, em thấy {feeling} với {topic} hơn rồi.",
    "Kỳ này {topic} làm em {feeling}, em học vào hơn nhiều.",
    "Thật ra {topic} cũng thú vị, em thấy {feeling} khi làm quen rồi.",
    "Em {feeling} lắm – {reason} giúp em nhiều.",
    "{reason} nên em thấy {feeling} khi học {topic}.",
    "Cứ nghĩ {topic} sẽ khó, nhưng em lại thấy {feeling}.",
    "Gần đây {topic} không còn là nỗi lo nữa, em thấy {feeling}.",
    "Em thấy {feeling} ạ, {topic} hợp với em hơn kỳ trước.",
    "Nhìn lại thì {topic} không tệ chút nào, em cảm thấy {feeling}.",
]

TEMPLATES_NEU = [
    "Em học {topic} được nhưng chưa thấy gì đặc biệt.",
    "{topic} theo kịp được, không phải vấn đề lớn.",
    "Em thấy {feeling} với {topic}, không hơn không kém.",
    "Tình trạng hiện tại của em là {feeling} thôi, chưa có chuyện gì.",
    "Học {topic} ổn, nhưng em chưa có cảm hứng gì đặc biệt.",
    "{topic} không quá khó nhưng cũng chưa gây hứng thú cho em.",
    "Em {feeling} với {topic}, vẫn đang cố làm quen.",
    "Cũng ổn thôi, {topic} vừa sức với em.",
    "Em thấy {feeling} – không có gì đáng lo nhưng cũng chưa thích lắm.",
    "{topic} bình thường, em học được nhưng cần thêm thời gian.",
    "Tạm chấp nhận được, {topic} không phải điểm em lo nhất.",
    "Em vẫn theo kịp {topic}, nhưng cần đọc thêm ngoài giờ.",
    "Nhìn chung {topic} ổn, chưa cần can thiệp gì.",
    "Em đang ở mức trung bình với {topic}, {feeling}.",
]

TEMPLATES_NEG = [
    "Em thấy {feeling} vì {topic} tiến độ quá nhanh.",
    "{topic} đang làm em {feeling}, không biết hỏi ai.",
    "Dạo này {topic} khiến em {feeling}, {reason}.",
    "Em {feeling} thật sự – {topic} khó quá mà không có đủ tài liệu.",
    "Mỗi lần đụng tới {topic} là em lại {feeling}.",
    "{reason} khiến em {feeling} với {topic}.",
    "Em đang {feeling} vì {topic}, stress lắm rồi.",
    "Thật ra em không muốn nói nhưng {topic} đang làm em {feeling}.",
    "{topic} làm em {feeling}, em không biết mình còn theo được không.",
    "Em {feeling} khi học {topic} – {reason}.",
    "Cứ tới {topic} là em lại thấy {feeling}, nản lắm.",
    "Không theo kịp {topic} làm em {feeling} nhiều ngày nay.",
    "{reason} nên {topic} làm em {feeling} liên tục.",
    "Em thấy {feeling} – {topic} và {reason} cộng lại quá sức.",
]

# ---------------------------------------------------------------------------
# Slot values – đa dạng, có cả cụm từ kiểu sinh viên thật
# ---------------------------------------------------------------------------
SLOTS: dict[str, dict[str, list[str]]] = {
    "POSITIVE": {
        "feeling": [
            "rất thoải mái", "khá tự tin", "có động lực hơn hẳn",
            "hứng thú hẳn lên", "yên tâm hơn nhiều", "hài lòng ghê",
            "dễ tiếp thu hơn", "hiểu bài nhanh hơn", "thấy tiến bộ rõ",
            "nhẹ đầu hơn nhiều", "chill hơn hẳn", "ổn áp",
            "tự tin hơn trước nhiều", "vui vì hiểu ra rồi",
        ],
        "topic": [
            "deadline bài tập", "bài kiểm tra giữa kỳ", "tốc độ giảng bài",
            "cách giải thích của thầy cô", "tài liệu học tập", "bài giảng",
            "việc học nhóm", "hoạt động nhóm", "cách chấm điểm",
            "khối lượng kiến thức", "lịch học", "sự tương tác trong lớp",
            "feedback từ giảng viên", "yêu cầu môn học", "bài thực hành",
        ],
        "reason": [
            "thầy cô hỗ trợ nhiệt tình", "tài liệu rõ ràng hơn",
            "được hướng dẫn chi tiết hơn", "môi trường lớp tích cực",
            "cách tổ chức môn hợp lý", "bạn nhóm hợp tác tốt",
            "bài giảng được cải thiện nhiều", "em chủ động hỏi thêm",
        ],
    },
    "NEUTRAL": {
        "feeling": [
            "bình thường", "khá ổn", "tạm chấp nhận được",
            "không có gì nổi bật", "ở mức trung bình", "không quá khó",
            "không quá dễ", "ổn định", "vừa phải", "học được",
            "không thích không ghét", "chưa có cảm xúc gì mạnh",
            "hơi mệt", "khá áp lực", "hơi rối","căng thẳng nhẹ", "không thoải mái lắm",
        ],
        "topic": [
            "deadline bài tập", "bài kiểm tra giữa kỳ", "tốc độ giảng bài",
            "cách dạy", "tài liệu", "bài giảng", "việc học nhóm",
            "khối lượng kiến thức", "lịch học", "bài tập",
            "các yêu cầu môn học", "nội dung tuần này",
        ],
        "reason": [
            "nội dung không quá phức tạp", "tiến độ vừa phải",
            "chưa thực sự hứng thú", "cần thêm thời gian làm quen",
            "chưa thấy khác biệt nhiều", "mọi thứ đang bình ổn",
        ],
    },
    "NEGATIVE": {
        "feeling": [
            "rất áp lực", "mệt mỏi ghê", "khó theo kịp",
            "bị quá tải", "hoang mang thật sự", "mất động lực",
            "dễ nản", "không tập trung được", "đuối sức",
            "stress liên tục", "đầu óc quay tít", "không thở được",
            "nản lắm rồi", "kiệt sức", "muốn bỏ cuộc",
        ],
        "topic": [
            "deadline bài tập", "bài kiểm tra giữa kỳ", "kỳ thi cuối kỳ",
            "tốc độ giảng bài", "cách dạy", "tài liệu thiếu",
            "bài tập nhóm", "khối lượng kiến thức", "lịch học dày",
            "cách chấm điểm", "yêu cầu môn học", "bài thực hành",
            "tiến độ học kỳ", "nội dung khó",
        ],
        "reason": [
            "bài nhiều mà thời gian không đủ", "deadline dồn vào một tuần",
            "tiến độ học quá nhanh", "không có tài liệu rõ ràng",
            "không hiểu bài mà ngại hỏi", "cách dạy hơi khó theo",
            "bài tập quá nhiều so với thời gian", "em đang thiếu ngủ ghê",
            "nhóm không làm việc được với nhau", "áp lực từ nhiều môn cùng lúc",
        ],
    },
}

CONTRAST_TEMPLATES = {
    "NEUTRAL": [
        "Hơi {neg_feeling} nhưng em vẫn {pos_outcome}.",
        "Tuy {neg_feeling} nhưng em vẫn {pos_outcome}.",
        "Mặc dù {neg_feeling} nhưng em vẫn {pos_outcome}.",
    ],
    "POSITIVE": [
        "{neg_issue} nhưng em vẫn {pos_outcome} tốt.",
        "Dù {neg_issue} nhưng em vẫn {pos_outcome} được.",
    ],
    "NEGATIVE": [
        "{pos_expectation} nhưng thực tế em lại {neg_feeling}.",
        "Tưởng sẽ {pos_expectation} nhưng cuối cùng lại {neg_feeling}.",
    ],
}

CONTRAST_SLOTS = {
    "neg_feeling": [
        "đuối sức", "quá tải thật sự", "không theo kịp",
        "stress nặng", "kiệt sức", "mất động lực",
    ],
    "pos_outcome": [
        "theo kịp bài", "hiểu được nội dung",
        "làm được bài tập", "vẫn học ổn",
        "nắm được ý chính",
    ],
    "neg_issue": [
        "deadline nhiều", "bài hơi khó",
        "tiến độ nhanh", "lịch học dày",
    ],
    "pos_expectation": [
        "theo kịp", "hiểu bài", "học tốt", "ổn định",
    ],
}

def gen_fixed(result, push):
    for txt, lab in FIXED:
        push(lab, txt)


def gen_contrast(label: str) -> list[str]:
    out = []
    for tpl in CONTRAST_TEMPLATES[label]:
        for nf in CONTRAST_SLOTS["neg_feeling"]:
            for po in CONTRAST_SLOTS["pos_outcome"]:
                try:
                    out.append(tpl.format(
                        neg_feeling=nf,
                        pos_outcome=po,
                        neg_issue=random.choice(CONTRAST_SLOTS["neg_issue"]),
                        pos_expectation=random.choice(CONTRAST_SLOTS["pos_expectation"]),
                    ))
                except KeyError:
                    pass
    random.shuffle(out)
    return out


def gen_from_templates(label: str) -> list[str]:
    s = SLOTS[label]
    if label == "POSITIVE":
        templates = TEMPLATES_POS
    elif label == "NEUTRAL":
        templates = TEMPLATES_NEU
    else:
        templates = TEMPLATES_NEG

    out = []
    for tpl in templates:
        for feeling in s["feeling"]:
            for topic in s["topic"]:
                if "{reason}" in tpl:
                    for reason in s["reason"]:
                        out.append(tpl.format(
                            feeling=feeling,
                            topic=topic,
                            reason=reason
                        ))
                else:
                    out.append(tpl.format(
                        feeling=feeling,
                        topic=topic,
                        reason=""
                    ))
    random.shuffle(out)
    return out


def collect_unique_texts(per_label: dict[str, int]) -> dict[str, list[str]]:
    result = {k: [] for k in per_label}
    used = set()

    def push(label: str, text: str):
        t = text.strip()
        if t and t not in used and len(result[label]) < per_label[label]:
            used.add(t)
            result[label].append(t)

    # 1. Fixed
    gen_fixed(result, push)

    # 2. Contrast (ưu tiên trước)
    for lab in per_label:
        for txt in gen_contrast(lab):
            push(lab, txt)

    # 3. Templates
    for lab in per_label:
        for txt in gen_from_templates(lab):
            push(lab, txt)

    return result


def stratified_split(
    labeled: dict[str, list[str]], train_n: int, test_n: int, val_n: int
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    total = train_n + test_n + val_n
    labels = list(labeled.keys())
    if sum(len(labeled[lab]) for lab in labels) != total:
        raise ValueError("Tong mau va tong split khong khop.")

    remaining = {lab: len(labeled[lab]) for lab in labels}

    def _alloc(split_size: int) -> dict[str, int]:
        n_labels = len(labels)
        base = split_size // n_labels
        rem = split_size % n_labels
        alloc = {lab: base for lab in labels}
        for lab in sorted(labels, key=lambda x: (-remaining[x], x))[:rem]:
            alloc[lab] += 1
        return alloc

    per_train = _alloc(train_n)
    for lab, n in per_train.items():
        remaining[lab] -= n

    per_test = _alloc(test_n)
    for lab, n in per_test.items():
        remaining[lab] -= n

    per_val = _alloc(val_n)

    train_rows: list[tuple[str, str]] = []
    test_rows: list[tuple[str, str]] = []
    val_rows: list[tuple[str, str]] = []

    for lab, texts in labeled.items():
        need = per_train[lab] + per_test[lab] + per_val[lab]
        if len(texts) < need:
            raise ValueError(f"Nhan {lab} chi co {len(texts)} mau, can {need}.")

        bucket = texts[:need]
        random.shuffle(bucket)

        i = 0
        train_rows += [(t, lab) for t in bucket[i : i + per_train[lab]]]
        i += per_train[lab]
        test_rows += [(t, lab) for t in bucket[i : i + per_test[lab]]]
        i += per_test[lab]
        val_rows += [(t, lab) for t in bucket[i : i + per_val[lab]]]

    random.shuffle(train_rows)
    random.shuffle(test_rows)
    random.shuffle(val_rows)

    assert len(train_rows) == train_n
    assert len(test_rows) == test_n
    assert len(val_rows) == val_n

    def _df(chunk: list[tuple[str, str]]) -> pd.DataFrame:
        return pd.DataFrame({
            "feedback_text": [c[0] for c in chunk],
            "sentiment_label": [c[1] for c in chunk],
        })

    return _df(train_rows), _df(test_rows), _df(val_rows)



def main():
    labeled = collect_unique_texts(COUNTS)

    train_df, test_df, val_df = stratified_split(labeled, 800, 100, 100)

    train_df.to_csv(OUTPUT_DIR / "sentiment_train.csv", index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)
    test_df.to_csv(OUTPUT_DIR / "sentiment_test.csv", index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)
    val_df.to_csv(OUTPUT_DIR / "sentiment_valid.csv", index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)

    print("Done. Dataset V2 created.")

if __name__ == "__main__":
    main()
