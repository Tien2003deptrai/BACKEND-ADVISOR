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
SEED = 69
random.seed(SEED)

TRAIN_N = 1000
TEST_N  = 100
VAL_N   = 100

# ─────────────────────────────────────────────
# 1. FIXED SEEDS  (90 câu – 30 mỗi nhãn)
# ─────────────────────────────────────────────
FIXED: list[tuple[str, str]] = [
    # POSITIVE (20 câu gốc)
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
    # POSITIVE (10 câu bổ sung)
    ("Môn này ban đầu em sợ lắm nhưng giờ thấy khá thú vị rồi.", "POSITIVE"),
    ("Được thầy hướng dẫn tận tình, em hiểu ra nhiều thứ.", "POSITIVE"),
    ("Học kỳ này em cảm thấy tiến bộ rõ rệt, rất vui.", "POSITIVE"),
    ("Em vừa hiểu ra phần khó nhất, cảm giác nhẹ nhõm ghê.", "POSITIVE"),
    ("Nhóm học của em hợp tác ăn ý, làm bài xong mà còn vui.", "POSITIVE"),
    ("Sau buổi hỏi thêm, em nắm bài chắc hơn hẳn.", "POSITIVE"),
    ("Tâm trạng em tốt hơn nhiều kể từ khi sắp xếp lại lịch học.", "POSITIVE"),
    ("Em thấy môn này giúp ích cho mình nhiều, đang rất hứng thú.", "POSITIVE"),
    ("Kỳ này em cân bằng được học và nghỉ ngơi, cảm thấy ổn lắm.", "POSITIVE"),
    ("Thầy cô luôn sẵn sàng hỗ trợ, em không ngại hỏi thêm nữa.", "POSITIVE"),

    # NEUTRAL (20 câu gốc)
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
    ("Nói chung thì ổn ạ, không có gì đặc biệt.", "NEUTRAL"),
    ("Môn này không phải sở thích của em nhưng em vẫn cố học.", "NEUTRAL"),
    ("Em thấy mọi thứ đang đi đúng hướng, chưa có gì đáng lo.", "NEUTRAL"),
    ("Bình thường, em không thấy khó hơn các kỳ trước.", "NEUTRAL"),
    ("Em học theo được nhưng cần đọc thêm tài liệu ngoài.", "NEUTRAL"),
    ("Chưa hứng thú lắm, nhưng em vẫn hoàn thành bài đúng hạn.", "NEUTRAL"),
    ("Em thấy môn này cần kiên nhẫn, chứ không đặc biệt khó.", "NEUTRAL"),
    # NEUTRAL (10 câu bổ sung – bao gồm các câu Mức 1 bị relabel)
    ("Bài hôm nay hơi khó hiểu, em cần xem lại một chút.", "NEUTRAL"),
    ("Hơi mệt sau buổi học dài, nhưng không có gì đáng lo.", "NEUTRAL"),
    ("Em chưa hiểu hết phần cuối bài, cần ôn thêm chút nữa.", "NEUTRAL"),
    ("Deadline tuần này nhiều hơn bình thường, hơi bận.", "NEUTRAL"),
    ("Hơi tụt hậu so với tiến độ chung nhưng em đang cố bắt kịp.", "NEUTRAL"),
    ("Lo lắng về điểm giữa kỳ nhưng em vẫn đang ôn tập bình thường.", "NEUTRAL"),
    ("Bài này em chưa nắm rõ lắm nhưng chưa đến mức lo nhiều.", "NEUTRAL"),
    ("Tuần này hơi bận, nhưng em vẫn theo kịp được.", "NEUTRAL"),
    ("Em thấy tạm ổn, chỉ cần đọc thêm tài liệu là hiểu được.", "NEUTRAL"),
    ("Có vài chỗ em còn mơ hồ nhưng nhìn chung bài không quá khó.", "NEUTRAL"),

    # NEGATIVE (20 câu gốc)
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
    # NEGATIVE (10 câu bổ sung – đặc biệt cấu trúc cảm xúc + nguyên nhân)
    ("Em hay cáu gắt và mất động lực dạo này, chắc do áp lực thi cử tích tụ lâu quá.", "NEGATIVE"),
    ("Dạo này em dễ bực bội với mọi thứ, cảm giác như sắp bùng phát đến nơi.", "NEGATIVE"),
    ("Em trở nên khó chịu và thiếu kiên nhẫn hơn, áp lực học hành đè nặng quá.", "NEGATIVE"),
    ("Mất ngủ liên tục, sáng nào cũng dậy mà không thấy nghỉ ngơi gì cả.", "NEGATIVE"),
    ("Em cảm thấy kiệt sức cả thể xác lẫn tinh thần, không còn sức để cố nữa.", "NEGATIVE"),
    ("Nhìn vào bài tập là em thấy tê liệt, không muốn bắt đầu gì hết.", "NEGATIVE"),
    ("Áp lực từ gia đình cộng với bài vở khiến em căng thẳng không chịu được.", "NEGATIVE"),
    ("Em đang trải qua giai đoạn rất khó, cảm giác một mình xử lý hết mọi thứ.", "NEGATIVE"),
    ("Cứ nghĩ đến bài kiểm tra là tim em đập nhanh, lo đến mức không học được.", "NEGATIVE"),
    ("Em không nói được với ai, chỉ biết chịu đựng, mà dạo này thật sự quá sức rồi.", "NEGATIVE"),
]

# ─────────────────────────────────────────────
# 2. TOPIC GROUPS  (đa dạng, không chỉ môn học)
# ─────────────────────────────────────────────
TOPIC_GROUPS = {
    "hoc_tap": [
        "deadline bài tập", "bài kiểm tra giữa kỳ", "kỳ thi cuối kỳ",
        "tốc độ giảng bài", "tài liệu học tập", "bài thực hành",
        "việc học nhóm", "cách chấm điểm", "lịch học", "feedback từ thầy cô",
    ],
    "tam_ly": [
        "tâm trạng gần đây", "cảm giác cô đơn", "áp lực thi cử",
        "lo âu về tương lai", "cảm giác không đủ năng lực",
        "nỗi sợ thất bại", "tâm lý bất ổn", "cảm giác mất phương hướng",
    ],
    "suc_khoe": [
        "giấc ngủ", "sức khoẻ thể chất", "việc ăn uống", "mức năng lượng hàng ngày",
        "tình trạng mệt mỏi", "đau đầu liên tục", "sức đề kháng giảm",
    ],
    "cuoc_song": [
        "chi tiêu hàng tháng", "việc làm thêm", "chỗ ở trọ", "đi lại hàng ngày",
        "cân bằng học và nghỉ ngơi", "thời gian tự do", "việc nấu ăn tự túc",
    ],
    "quan_he": [
        "bạn bè trong lớp", "mối quan hệ nhóm", "chuyện gia đình",
        "mối quan hệ với thầy cô", "chuyện tình cảm", "cảm giác bị hiểu lầm",
        "áp lực từ bố mẹ",
    ],
    "tuong_lai": [
        "định hướng nghề nghiệp", "việc tìm kiếm thực tập", "kế hoạch sau tốt nghiệp",
        "lo ngại về việc làm", "sự phù hợp của ngành học", "mục tiêu cá nhân",
    ],
}

def random_topic() -> str:
    group = random.choice(list(TOPIC_GROUPS.values()))
    return random.choice(group)

def topic_by_label(label: str) -> str:
    """Bias topic selection per label to sound natural."""
    if label == "NEGATIVE":
        weights = [2, 4, 3, 3, 3, 3]
    elif label == "POSITIVE":
        weights = [4, 2, 2, 3, 2, 3]
    else:
        weights = [3, 2, 2, 3, 2, 2]
    keys = list(TOPIC_GROUPS.keys())
    chosen = random.choices(keys, weights=weights, k=1)[0]
    return random.choice(TOPIC_GROUPS[chosen])

# ─────────────────────────────────────────────
# 3. SLOT VALUES
# ─────────────────────────────────────────────
FEELINGS = {
    "POSITIVE": [
        "rất thoải mái", "khá tự tin", "có động lực hơn hẳn",
        "hứng thú hẳn lên", "yên tâm hơn nhiều", "hài lòng ghê",
        "dễ tiếp thu hơn", "thấy tiến bộ rõ", "nhẹ đầu hơn nhiều",
        "chill hơn hẳn", "tự tin hơn trước nhiều", "vui vì hiểu ra rồi",
        "phấn khởi hơn nhiều", "thoải mái và nhẹ nhõm", "rất ổn",
    ],
    "NEUTRAL": [
        "bình thường", "khá ổn", "tạm chấp nhận được",
        "không có gì nổi bật", "ở mức trung bình", "vừa phải",
        "học được", "không thích không ghét", "chưa có cảm xúc gì mạnh",
        "bình bình", "ổn định", "không lo không vui gì đặc biệt",
    ],
    "NEGATIVE": [
        "rất áp lực", "mệt mỏi ghê", "khó theo kịp",
        "bị quá tải", "hoang mang thật sự", "mất động lực",
        "dễ nản", "không tập trung được", "đuối sức",
        "stress liên tục", "đầu óc quay tít", "không thở được",
        "hơi mệt", "căng thẳng", "không thoải mái",
        "nản lắm rồi", "kiệt sức", "muốn bỏ cuộc",
        "lo lắng không yên", "bất an", "rất chán nản",
        "cáu gắt và mất kiên nhẫn", "bực bội không lý do",
        "tê liệt không muốn làm gì", "nặng nề trong lòng",
    ],
}

REASONS_POS = [
    "thầy cô hỗ trợ nhiệt tình", "tài liệu rõ ràng hơn",
    "được hướng dẫn chi tiết", "môi trường lớp tích cực",
    "bạn nhóm hợp tác tốt", "em chủ động hỏi thêm",
    "ngủ đủ giấc hơn trước", "tâm lý thoải mái hơn",
    "sắp xếp được thời gian hợp lý", "áp lực gia đình giảm bớt",
    "tìm được phương pháp học phù hợp", "được nghỉ ngơi đủ cuối tuần",
]

REASONS_NEG = [
    "bài nhiều mà thời gian không đủ", "deadline dồn vào một tuần",
    "tiến độ học quá nhanh", "không có tài liệu rõ ràng",
    "không hiểu bài mà ngại hỏi", "thiếu ngủ liên tục mấy ngày",
    "nhóm không làm việc được với nhau", "áp lực từ nhiều môn cùng lúc",
    "chuyện gia đình làm em phân tâm", "tài chính eo hẹp làm em lo lắng",
    "việc làm thêm chiếm hết thời gian", "mất định hướng không biết đi đâu",
    "cảm thấy cô đơn và không có ai chia sẻ", "sức khoẻ không tốt dạo này",
    "áp lực thi cử tích lũy quá lâu", "cứ thất bại hoài không biết sai ở đâu",
    "kỳ vọng của gia đình quá lớn", "mất ngủ liên tục mấy tuần nay",
]

CONTEXT_POS = [
    "Nhờ {reason} nên", "Vì {reason} nên", "Do {reason},",
    "Từ khi {reason},", "Gần đây {reason} nên",
]
CONTEXT_NEG = [
    "Vì {reason} nên", "Do {reason},", "Chuyện {reason} khiến em",
    "Từ hôm {reason},", "Dạo này {reason} làm em",
]

# ─────────────────────────────────────────────
# 4. TEMPLATE BANKS
# ─────────────────────────────────────────────
TEMPLATES = {
    "POSITIVE": [
        "Em thấy {feeling} khi học {topic}, thầy/cô giải thích dễ hiểu lắm.",
        "{topic} thật ra không khó như em nghĩ, em thấy {feeling}.",
        "Nhờ {reason}, em thấy {feeling} với {topic} hơn rồi.",
        "Kỳ này {topic} làm em {feeling}, em học vào hơn nhiều.",
        "Dạo này tâm trạng em tốt hơn, {topic} không còn là gánh nặng nữa.",
        "Em vừa tìm lại được động lực sau khoảng thời gian khó khăn, cảm thấy {feeling}.",
        "Sau khi nói chuyện với thầy/cô, em cảm thấy {feeling} hơn hẳn về {topic}.",
        "{reason} nên em thấy {feeling} khi nhìn lại {topic}.",
        "Ngủ đủ giấc hơn nên {topic} cũng trở nên {feeling} hơn rất nhiều.",
        "Em sắp xếp lại lịch sinh hoạt và thấy {topic} dễ xử lý hơn, cảm giác {feeling}.",
        "Bạn bè ủng hộ em nhiều nên {topic} không còn đáng sợ nữa, em thấy {feeling}.",
        "Gia đình hiểu và ủng hộ hơn, em thấy {feeling} và có thêm năng lượng.",
        "Em vừa tìm được hướng đi rõ ràng hơn cho {topic}, cảm thấy {feeling}.",
        "Sau buổi tư vấn, em thấy {feeling} hơn về {topic} và biết cần làm gì.",
        "Tuy {topic} vẫn còn khó nhưng em thấy {feeling} vì đang tiến bộ dần.",
        "Dù áp lực vẫn còn đó nhưng em cảm thấy {feeling} vì có thêm sự hỗ trợ.",
    ],
    "NEUTRAL": [
        "Em học {topic} được nhưng chưa thấy gì đặc biệt.",
        "{topic} không quá khó nhưng cũng chưa gây hứng thú cho em.",
        "Em {feeling} với {topic}, vẫn đang cố làm quen.",
        "Nhìn chung {topic} ổn, chưa cần can thiệp gì.",
        "Tâm trạng em dạo này {feeling}, không có gì đáng lo nhưng cũng chưa vui hẳn.",
        "Em đang cố cân bằng mọi thứ, kết quả là {feeling} thôi.",
        "Mọi thứ đang ở mức {feeling}, chưa có gì nổi bật để nói.",
        "{topic} cũng không phải là vấn đề lớn, em thấy {feeling}.",
        "Sức khoẻ em {feeling}, không tốt lắm nhưng vẫn đủ để đi học.",
        "{topic} ổn thôi, em không có phàn nàn gì đặc biệt.",
        "Cuộc sống sinh viên của em dạo này {feeling}, bình bình.",
        "Em đang trong giai đoạn {feeling} về mọi mặt, không có gì thay đổi nhiều.",
        "Mối quan hệ với bạn bè {feeling}, không thân lắm nhưng cũng không xung đột.",
        "{topic} chưa phải vấn đề em lo nhất, nhưng cũng không thể bỏ qua.",
        "Em chưa quyết định được hướng đi, thấy {feeling} với {topic}.",
        "Kế hoạch tương lai vẫn mơ hồ, em thấy {feeling} và chưa biết bắt đầu từ đâu.",
    ],
    "NEGATIVE": [
        # học tập
        "Em thấy {feeling} vì {topic} tiến độ quá nhanh.",
        "{topic} đang làm em {feeling}, không biết hỏi ai.",
        "Dạo này {topic} khiến em {feeling}, {reason}.",
        "Em {feeling} thật sự – {topic} khó quá mà không có đủ tài liệu.",
        # tâm lý – cảm xúc rõ ràng + nguyên nhân
        "Em đang rất {feeling} về {topic}, không ngủ được mấy đêm nay.",
        "Cứ nghĩ đến {topic} là em lại thấy {feeling} và không tập trung được.",
        "{reason} khiến em {feeling} với mọi thứ xung quanh.",
        "Em không muốn nói nhưng {topic} đang làm em {feeling} thật sự.",
        # cáu gắt / bực bội + nguyên nhân (FIX nhóm 2)
        "Em hay {feeling} dạo này, chắc do {reason} tích tụ quá lâu rồi.",
        "Dạo này em {feeling} với mọi người xung quanh, do {reason} làm em căng thẳng.",
        "Em trở nên {feeling} hơn hẳn so với trước, {reason} đang bào mòn sức chịu đựng của em.",
        "{reason} làm em {feeling} và khó giữ được bình tĩnh như trước.",
        # sức khoẻ
        "{topic} ảnh hưởng đến em nhiều lắm, cơ thể cảm thấy {feeling} liên tục.",
        "Do {reason} nên sức khoẻ em không ổn, cảm thấy {feeling} suốt.",
        # cuộc sống
        "{topic} đang là vấn đề lớn với em, cảm thấy {feeling} và không biết xử lý sao.",
        "Áp lực từ {topic} và {reason} cộng lại khiến em {feeling} không chịu nổi.",
        # quan hệ
        "Chuyện {topic} làm em {feeling}, không biết chia sẻ cùng ai.",
        "Em đang {feeling} vì {topic}, cảm giác không ai hiểu mình.",
        # tương lai
        "Nghĩ đến {topic} là em lại {feeling}, không biết mình có đủ năng lực không.",
        "{reason} khiến em {feeling} khi nghĩ tới tương lai, rất bất an.",
        # contrast
        "Cứ tưởng mọi thứ sẽ ổn hơn nhưng {topic} lại khiến em {feeling}.",
        "Dù đã cố gắng nhưng {topic} vẫn làm em {feeling}, nản lắm rồi.",
    ],
}

# ─────────────────────────────────────────────
# 5. PERSONAL-CONTEXT TEMPLATES
# ─────────────────────────────────────────────
PERSONAL_TEMPLATES = {
    "POSITIVE": [
        "Dạo này tinh thần em khá ổn, đối mặt với {topic} em thấy {feeling} và dễ chịu hơn trước.",
        "Nhờ {reason} nên em có thêm năng lượng, thấy {feeling} với mọi thứ, kể cả {topic}.",
        "Gần đây em cân đối được thời gian hơn nên {topic} không còn là áp lực lớn, em thấy {feeling}.",
        "Tâm trạng em tốt hơn hẳn, nhìn lại {topic} em thấy {feeling} và dễ xử lý hơn trước.",
    ],
    "NEUTRAL": [
        "Dạo này sinh hoạt của em hơi rối nên {topic} cũng chỉ ở mức {feeling}, chưa có gì nổi bật.",
        "Em vẫn đang cố cân bằng giữa cuộc sống và {topic} nên nhìn chung thấy {feeling} thôi.",
        "Tình hình cá nhân chưa ổn định nên {topic} cũng chỉ dừng ở mức {feeling} như vậy.",
        "Em chưa quyết định được hướng đi nên mọi thứ, kể cả {topic}, vẫn còn {feeling}.",
    ],
    "NEGATIVE": [
        "Dạo này em đang gặp chuyện {reason}, vì thế khi đối mặt với {topic} cứ thấy {feeling} và khó tập trung.",
        "Vì {reason} nên dù {topic} không hẳn là quá khó, em vẫn cứ thấy {feeling} liên tục.",
        "Chuyện {reason} đang ảnh hưởng nhiều, cứ tiếp cận {topic} mà em luôn trong trạng thái {feeling} mấy ngày nay.",
        "Em đang phải vừa lo {reason} vừa lo {topic}, cảm giác {feeling} thật sự, không biết trụ được bao lâu.",
        # Thêm mẫu cáu gắt / kiệt sức + nguyên nhân
        "Do {reason} kéo dài, em trở nên {feeling} với xung quanh, kể cả với {topic} dù không muốn vậy.",
        "Em biết {reason} không phải lỗi của ai nhưng cứ thấy {feeling} và không kiểm soát được cảm xúc.",
    ],
}

# ─────────────────────────────────────────────
# 6. CONTRAST TEMPLATES
# ─────────────────────────────────────────────
CONTRAST = {
    "NEUTRAL": [
        "Hơi {neg} nhưng em vẫn {pos}.",
        "Tuy {neg} nhưng nhìn chung em vẫn {pos}.",
        "Mặc dù {neg} nhưng em vẫn {pos} được.",
        "Có lúc thấy {neg} nhưng nhìn chung em vẫn {pos}.",
        "Dù hơi {neg} thật nhưng em vẫn đang {pos} bình thường.",
    ],
    "POSITIVE": [
        "Dù {issue} nhưng em vẫn {pos} tốt, không quá lo.",
        "Dù {issue}, em vẫn cảm thấy ổn và {pos} được.",
        "{issue} không làm em nản, em vẫn {pos} như thường.",
        "Dù áp lực vì {issue} nhưng cuối cùng em vẫn {pos}.",
    ],
    "NEGATIVE": [
        "Tưởng sẽ {pos_exp} nhưng cuối cùng em lại thấy {neg}.",
        "Dù đã cố gắng nhưng em vẫn cứ thấy {neg}, không biết làm thế nào.",
        "Cứ tưởng sẽ dễ {pos_exp} hơn nhưng thực ra em đang {neg} nhiều lắm.",
        "Cứ nghĩ mọi thứ sẽ ổn hơn nhưng em lại thấy {neg} hoài.",
        "Em cũng muốn {pos_exp} lắm nhưng hiện tại chỉ thấy {neg} thôi.",
    ],
}

C_NEG = [
    "đuối sức", "quá tải thật sự", "không theo kịp",
    "stress nặng", "kiệt sức", "mất động lực",
    "không tập trung được", "cảm thấy bất an", "rất mệt mỏi",
    "cáu gắt liên tục", "bực bội không kiểm soát được",
]
C_POS = [
    "theo kịp bài", "hiểu được nội dung chính",
    "làm được bài tập", "vẫn học ổn",
    "giữ được tâm lý tốt", "xử lý ổn mọi thứ",
]
C_ISSUE = [
    "deadline nhiều", "bài hơi khó", "tiến độ nhanh",
    "lịch học dày", "áp lực thi cử", "thiếu ngủ",
]
C_POS_EXP = [
    "theo kịp", "hiểu bài", "học tốt", "ổn định",
    "cân bằng được", "vượt qua dễ dàng",
]


# ─────────────────────────────────────────────
# 7. GENERATION HELPERS
# ─────────────────────────────────────────────
def _fill(tpl: str, label: str) -> str | None:
    topic   = topic_by_label(label)
    feeling = random.choice(FEELINGS[label])
    reason  = random.choice(REASONS_POS if label == "POSITIVE" else REASONS_NEG)
    try:
        return tpl.format(
            topic=topic, feeling=feeling, reason=reason,
            neg=random.choice(C_NEG),
            pos=random.choice(C_POS),
            issue=random.choice(C_ISSUE),
            pos_exp=random.choice(C_POS_EXP),
            neg_feeling=random.choice(FEELINGS["NEGATIVE"]),
        )
    except KeyError:
        return None


def gen_template_bank(label: str, n: int) -> list[str]:
    out: list[str] = []
    tpls = TEMPLATES[label]
    attempts = 0
    seen: set[str] = set()
    while len(out) < n and attempts < n * 20:
        attempts += 1
        tpl = random.choice(tpls)
        result = _fill(tpl, label)
        if result and result not in seen and len(result) >= 20:
            seen.add(result)
            out.append(result)
    return out


def gen_personal(label: str, n: int) -> list[str]:
    out: list[str] = []
    tpls = PERSONAL_TEMPLATES[label]
    seen: set[str] = set()
    attempts = 0
    while len(out) < n and attempts < n * 20:
        attempts += 1
        tpl = random.choice(tpls)
        result = _fill(tpl, label)
        if result and result not in seen and len(result) >= 20:
            seen.add(result)
            out.append(result)
    return out


def gen_contrast(label: str, n: int) -> list[str]:
    out: list[str] = []
    tpls = CONTRAST[label]
    seen: set[str] = set()
    attempts = 0
    while len(out) < n and attempts < n * 20:
        attempts += 1
        tpl = random.choice(tpls)
        result = _fill(tpl, label)
        if result and result not in seen and len(result) >= 20:
            seen.add(result)
            out.append(result)
    return out


# ─────────────────────────────────────────────
# 8. MAIN COLLECTOR
# ─────────────────────────────────────────────
def collect(per_label: dict[str, int]) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {k: [] for k in per_label}
    used: set[str] = set()

    def push(label: str, text: str):
        t = text.strip()
        if t and t not in used and len(result[label]) < per_label[label]:
            used.add(t)
            result[label].append(t)

    # 1. Fixed seeds
    for txt, lab in FIXED:
        push(lab, txt)

    # 2. Contrast
    for lab in per_label:
        need = per_label[lab]
        for txt in gen_contrast(lab, need):
            push(lab, txt)

    # 3. Personal context
    for lab in per_label:
        need = per_label[lab]
        for txt in gen_personal(lab, need):
            push(lab, txt)

    # 4. Template bank (fill remainder)
    for lab in per_label:
        need = per_label[lab]
        remaining = need - len(result[lab])
        if remaining > 0:
            for txt in gen_template_bank(lab, remaining * 3):
                push(lab, txt)

    for lab, texts in result.items():
        print(f"  {lab}: {len(texts)}/{per_label[lab]} câu")

    return result


# ─────────────────────────────────────────────
# 9. STRATIFIED SPLIT
# ─────────────────────────────────────────────
def build_counts(total: int) -> dict[str, int]:
    labels = ["POSITIVE", "NEUTRAL", "NEGATIVE"]
    base = total // len(labels)
    rem  = total % len(labels)
    counts = {lab: base for lab in labels}
    for lab in labels[:rem]:
        counts[lab] += 1
    return counts


def stratified_split(
    labeled: dict[str, list[str]],
    train_n: int, test_n: int, val_n: int,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    labels = list(labeled.keys())

    def alloc(split_n: int, remaining: dict[str, int]) -> dict[str, int]:
        base = split_n // len(labels)
        rem  = split_n % len(labels)
        a = {lab: base for lab in labels}
        for lab in sorted(labels, key=lambda x: (-remaining[x], x))[:rem]:
            a[lab] += 1
        return a

    rem = {lab: len(labeled[lab]) for lab in labels}
    pa  = alloc(train_n, rem);  [rem.__setitem__(l, rem[l]-pa[l]) for l in labels]
    pb  = alloc(test_n,  rem);  [rem.__setitem__(l, rem[l]-pb[l]) for l in labels]
    pc  = alloc(val_n,   rem)

    tr, te, va = [], [], []
    for lab, texts in labeled.items():
        need = pa[lab] + pb[lab] + pc[lab]
        bucket = texts[:need]
        random.shuffle(bucket)
        i = 0
        tr += [(t, lab) for t in bucket[i:i+pa[lab]]]; i += pa[lab]
        te += [(t, lab) for t in bucket[i:i+pb[lab]]]; i += pb[lab]
        va += [(t, lab) for t in bucket[i:i+pc[lab]]]

    random.shuffle(tr); random.shuffle(te); random.shuffle(va)

    def _df(rows):
        return pd.DataFrame({
            "feedback_text":  [r[0] for r in rows],
            "sentiment_label":[r[1] for r in rows],
        })
    return _df(tr), _df(te), _df(va)


# ─────────────────────────────────────────────
# 10. ENTRY POINT
# ─────────────────────────────────────────────
def main():
    total  = TRAIN_N + TEST_N + VAL_N
    counts = build_counts(total)
    print(f"Cần tạo: {counts}")

    labeled = collect(counts)

    # Kiểm tra đủ data
    for lab, need in counts.items():
        got = len(labeled[lab])
        if got < need:
            print(f"[WARN] {lab}: chỉ có {got}/{need} câu!")

    train_df, test_df, val_df = stratified_split(labeled, TRAIN_N, TEST_N, VAL_N)

    train_df.to_csv(OUTPUT_DIR / "sentiment_train.csv",  index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)
    test_df.to_csv( OUTPUT_DIR / "sentiment_test.csv",   index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)
    val_df.to_csv(  OUTPUT_DIR / "sentiment_valid.csv",  index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)

    print(f"\nDone → train={len(train_df)}, test={len(test_df)}, valid={len(val_df)}")

    # Thống kê phân phối
    for name, df in [("train", train_df), ("test", test_df), ("valid", val_df)]:
        dist = df["sentiment_label"].value_counts().to_dict()
        print(f"  {name}: {dist}")

    # Kiểm tra min length
    all_df = pd.concat([train_df, test_df, val_df])
    short  = all_df[all_df["feedback_text"].str.len() < 20]
    if len(short):
        print(f"[WARN] {len(short)} câu ngắn hơn 20 ký tự!")
    else:
        print("✓ Tất cả câu đều >= 20 ký tự")

    # Kiểm tra trùng lặp
    dups = all_df["feedback_text"].duplicated().sum()
    print(f"✓ Duplicate: {dups}")


if __name__ == "__main__":
    main()