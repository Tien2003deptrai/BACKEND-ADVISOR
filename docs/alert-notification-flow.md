# Quy trình Alert + Notification (End-to-End)

Tài liệu này mô tả luồng tạo cảnh báo (`alert`) và thông báo chuông (`notification`) cho 2 trường hợp:
- Sentiment Alert (AI-02)
- Risk Alert (AI-01)

## 1) Nguyên tắc chung

AI phát hiện vấn đề -> tạo `alert` -> tạo `notification` cho CVHT.

- `alert`: dùng để tổng hợp/dashboard.
- `notification`: dùng để hiển thị chuông và nhắc CVHT xử lý.

## 2) Flow Sentiment Alert (AI-02)

1. Sinh viên gửi feedback.
2. Hệ thống lưu vào `feedbacks`.
3. Gọi AI-02 phân tích cảm xúc.
4. Nhận kết quả `sentiment_label` + `feedback_score`.
5. Điều kiện tạo alert:
- `sentiment_label == "NEGATIVE"`
- `feedback_score < -0.6`
6. Tính `severity`:
- `feedback_score < -0.8` -> `HIGH`
- Ngược lại -> `MEDIUM`
7. Tạo `alert`:
- `alert_type = "SENTIMENT"`
- `source_ai = "AI02_SENTIMENT"`
- `severity = HIGH|MEDIUM`
- `feedback_id = feedback._id`
- `student_user_id`, `term_id`
8. Tìm CVHT của sinh viên:
- `alert.student_user_id` -> `class_members` (`student_user_id`) -> `class_id`
- `class_id` -> `advisor_classes` -> `advisor_user_id`
9. Tạo `notification` cho đúng CVHT:
- `recipient_user_id = advisor_user_id`
- `alert_id = alert._id`
- `title = "Cảnh báo cảm xúc từ sinh viên"`
- `content` có tên sinh viên (fallback student_code/id nếu thiếu tên)

Khi CVHT bấm chuông:
- `notification` -> `alert` -> `feedback_id` -> xem nội dung feedback chi tiết.

## 3) Flow Risk Alert (AI-01)

1. Sinh viên submit dữ liệu học tập (academic).
2. Hệ thống tính avg sentiment trong kỳ.
3. Gọi AI-01 Risk Prediction.
4. Lưu `risk_predictions` (`risk_score`, `risk_label`).
5. Điều kiện tạo alert:
- `risk_label == -1` (HIGH)
6. Tính `severity`:
- `0.75 <= risk_score <= 0.85` -> `MEDIUM`
- `risk_score > 0.85` -> `HIGH`
7. Tạo `alert`:
- `alert_type = "RISK"`
- `source_ai = "AI01_RISK"`
- `severity = HIGH|MEDIUM`
- `risk_prediction_id = risk_prediction._id`
- `student_user_id`, `term_id`
8. Tìm CVHT của sinh viên:
- `student_user_id` -> `class_members` -> `advisor_classes.advisor_user_id`
9. Tạo `notification` cho CVHT:
- `recipient_user_id = advisor_user_id`
- `alert_id = alert._id`
- `title = "Cảnh báo nguy cơ học vụ"`
- `content` có tên sinh viên
10. Sau đó mới sinh recommendation cho sinh viên.

Khi CVHT bấm chuông:
- `notification` -> `alert` -> `risk_prediction_id` -> xem chi tiết chỉ số risk.

## 4) CVHT sẽ thấy gì

- Dashboard Risk/Sentiment Cards: đọc từ `alert`.
- Chuông thông báo: đọc từ `notification`.

## 5) Mapping du lieu nhanh

- `notifications.alert_id` -> `alert._id`
- `alert.feedback_id` (voi sentiment) -> `feedbacks._id`
- `alert.risk_prediction_id` (voi risk) -> `risk_predictions._id`

## 6) Mô tả Notification

`notification` là bản ghi để hiển thị chuông cho CVHT, được tạo ngay sau khi `alert` được tạo.

Trường dữ liệu chính:
- `recipient_user_id`: user CVHT nhận thông báo.
- `alert_id`: liên kết đến bản ghi `alert` gốc.
- `title`: tiêu đề ngắn để CVHT nhìn nhanh loại cảnh báo.
- `content`: nội dung mô tả, có thể kèm tên sinh viên.
- `is_read`, `read_at`: trạng thái đã đọc/chưa đọc.
- `sent_at`: thời điểm gửi thông báo.

Nội dung hiển thị đề xuất:
- Sentiment: `Cảnh báo cảm xúc từ sinh viên`
- Risk: `Cảnh báo nguy cơ học vụ`

Mẫu content:
- Sentiment: `Sinh viên {student_name} vừa gửi phản hồi có dấu hiệu tâm lý nghiêm trọng.`
- Risk: `Sinh viên {student_name} có nguy cơ cao về chỉ số rủi ro học tập trong học kỳ.`
