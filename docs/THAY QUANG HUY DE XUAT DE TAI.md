Tên đề tài đề xuất: AI-ADVISOR: Nền tảng Giám sát & Hỗ trợ Cố vấn Học tập 4.0 ứng dụng Trí tuệ Nhân tạo

Mô tả tổng quan
AI-Advisor là một nền tảng độc lập hỗ trợ công tác cố vấn học tập bằng cách:
- Thu thập dữ liệu học tập – hành vi – phản hồi của sinh viên
- Áp dụng các mô hình AI để dự đoán nguy cơ học vụ, phân tích cảm xúc, tóm tắt biên bản tư vấn
- Hỗ trợ giảng viên CVHT ra quyết định nhanh hơn
- Hỗ trợ sinh viên hiểu rõ hiệu suất học tập và nhận cảnh báo sớm
- Hỗ trợ Khoa/Hội đồng theo dõi hiệu quả cố vấn qua dashboard KPI

Đây là đề tài có hàm lượng AI cao, mang tính xã hội, và giá trị ứng dụng lớn trong môi trường giáo dục.

## 2. DANH SÁCH CHỨC NĂNG CHÍNH

Chia thành 2 nhóm:
- A. Chức năng AI (bắt buộc – tạo tính mới mạnh)
- B. Chức năng Hệ thống (đủ để hoàn thiện sản phẩm platform)

### A. CHỨC NĂNG AI

**AI-01. Dự đoán nguy cơ cảnh báo học vụ (Academic Risk Prediction AI)**

Dùng ML để dự đoán sinh viên thuộc nhóm:
- Nguy cơ cao : Cảnh báo học vụ
- Trung bình
- Bình thường

Input từ dataset:
- GPA
- Số môn rớt
- Vắng học
- Tham gia SHCVHT
- Stress level
- Phản hồi tiêu cực
- Tự đánh giá động lực học tập

Output:
- Risk Score (0–100)
- Gợi ý biện pháp hỗ trợ

**AI-02. Phân tích cảm xúc phản hồi SHCVHT (Sentiment Analysis AI)**

Tự động đọc phản hồi sinh viên (text) và phân tích:
- Tích cực
- Trung tính
- Tiêu cực
- Mức độ căng thẳng, lo lắng

Ứng dụng:
- CVHT biết SV nào đang gặp vấn đề
- Tự động cảnh báo các từ khóa nguy hiểm: “stress”, “áp lực”, “khó khăn”, “muốn nghỉ học”

**AI-03. Tóm tắt tự động biên bản SHCVHT (Meeting Summarization)**

Cho phép CVHT:
- Tải lên nội dung ghi chú
- Hệ thống tóm tắt lại thành 3–5 gạch đầu dòng
- Tự tạo báo cáo tháng trường/đầu kỳ

Dùng mô hình Transformers (T5, BART hoặc PhoBERT Summarization).

**AI-04. Phát hiện bất thường trong hoạt động học tập (Anomaly Detection)**

Dựa trên các yếu tố:
- Tham gia SHCVHT giảm đột ngột
- Vắng học bất thường
- Số môn rớt tăng nhanh
- Phản hồi rất tiêu cực
- Mức độ stress tăng cao

AI phát hiện Outliers và cảnh báo cho CVHT.

**AI-05. Chatbot Học vụ tự động (Academic Advising Chatbot)**

Sinh viên có thể hỏi:
- Tôi có nguy cơ học vụ không?
- Tôi nên học lại môn nào trước?
- Làm sao cải thiện GPA?
- Tôi bị stress quá phải làm sao?

Chatbot dùng RAG + LLM nhỏ (phiên bản on-premise).

### B. CHỨC NĂNG HỆ THỐNG

**SYS-01. Sinh viên nhập dữ liệu học tập / khảo sát**

Bao gồm:
- GPA
- Điểm từng môn
- Số tín chỉ tích lũy
- Mức độ stress
- Tự đánh giá động lực học tập

=> Dữ liệu đầu vào cho AI-01 và AI-04.

**SYS-02. Sinh viên gửi phản hồi tư vấn (Feedback Form)**
- Text phản hồi (nguồn cho AI-02)
- Rating mức độ hài lòng
- Chủ đề phản hồi
- Lựa chọn "tôi cần hỗ trợ thêm"

**SYS-03. Giảng viên/CVHT nhập biên bản tư vấn**
- Nội dung tư vấn
- Danh sách SV tham dự (nhập tay)
- Hệ thống tự động tóm tắt (AI-03)

**SYS-04. Dashboard dành cho CVHT**

Hiển thị:
- DS sinh viên + Risk Score
- Cảnh báo từ AI
- Phản hồi tiêu cực
- Xu hướng điểm / vắng học

**SYS-05. Dashboard dành cho Sinh viên**
- Tình trạng học tập hiện tại
- Xu hướng nguy cơ
- Gợi ý AI (môn cần cải thiện, lịch học)

**SYS-06. Dashboard dành cho Khoa**
- KPI lớp
- KPI CVHT
- Tỷ lệ SV nguy cơ
- Biểu đồ sentiment theo tuần/tháng

## 3. MÔ TẢ CHI TIẾT CÁC CHỨC NĂNG CẦN THỰC HIỆN

Dưới đây là mô tả theo chuẩn mục tiêu – đầu vào – đầu ra – công nghệ.
Dễ đưa vào chương 3 (Phân tích thiết kế hệ thống).

**AI-01. Dự đoán nguy cơ học vụ**

Mục tiêu
Giúp CVHT phát hiện sớm SV có nguy cơ thấp – trung bình – cao.

Đầu vào
- GPA học kỳ
- Số môn rớt
- Vắng học
- Tham gia SHCVHT
- Stress level
- Sentiment Score
- Daily study hours
- Motivation score

Đầu ra
- Risk Score
- Nhãn: High/Medium/Low
- Gợi ý: “Cải thiện môn X”, “Nhờ CVHT tư vấn”, “Tham gia học nhóm”…

Công nghệ
- Random Forest / XGBoost
- Python + Scikit-learn
- API Flask/FastAPI

**AI-02. Phân tích cảm xúc phản hồi**

Mục tiêu
Hiểu cảm xúc SV: mức độ hài lòng, stress, bất mãn.

Đầu vào
- Nội dung phản hồi dạng text
- Chủ đề phản hồi

Đầu ra
- Sentiment: Positive/Neutral/Negative
- Stress Index
- Toxicity Warning (nếu SV đang gặp vấn đề)

Công nghệ
- PhoBERT / BERT-base
- Python Transformers

**AI-03. Tóm tắt biên bản tư vấn**

Mục tiêu
Tự động tổng hợp nội dung buổi SHCVHT.

Đầu vào
Nội dung biên bản 200–1500 từ.

Đầu ra
Tóm tắt 10–15 dòng.

Công nghệ
- T5-small / mT5
- HuggingFace

**AI-04. Phát hiện bất thường**

Mục tiêu
Cảnh báo khi kết quả học tập của SV có biến động bất thường.

Đầu vào
- Biểu đồ GPA
- Attendance history
- Sentiment history

Đầu ra
- Alert list
- Category: Study anomaly / Attendance anomaly / Sentiment anomaly

Công nghệ
- Isolation Forest
- Z-score anomaly detection

**AI-05. Chatbot học vụ**

Mục tiêu
Trả lời câu hỏi của SV theo tài liệu mô tả về học vụ.

Công nghệ
- LLM nhỏ (Qwen 1.5B / Llama 3B)
- RAG từ PDF rulebook

## 4. TẬP DỮ LIỆU PHỤC VỤ CHO AI

Dưới đây là dataset mô phỏng đầy đủ (kèm cột dữ liệu) để nhóm dùng cho AI.

**Dataset 1 – Student Academic Performance (cho AI-01 + AI-04)**

Số dòng đề xuất: 500 – 1000 bản ghi

| Cột dữ liệu | Mô tả |
|---|---|
| student_id | Mã sinh viên |
| gpa_prev_sem | GPA học kỳ trước |
| gpa_current | GPA hiện tại |
| num_failed | Số môn rớt |
| attendance_rate | Tỷ lệ chuyên cần (%) |
| shcvht_participation | Số buổi SHCVHT tham gia |
| study_hours | Giờ tự học mỗi tuần |
| motivation_score | Mức độ động lực (1–5) |
| stress_score | Mức độ stress (1–5) |
| sentiment_score | Điểm cảm xúc từ AI-02 |
| risk_label | 0/1 (Low risk / High risk) |

**Dataset 2 – Feedback Sentiment (cho AI-02)**

Số dòng: 2000 phản hồi

| feedback_id | student_id | text | label |
|---|---|---|---|
| 1 | 1023 | “Em đang quá tải học phần này…” | Negative |
| 2 | 1055 | “Buổi SH hôm nay rất hữu ích.” | Positive |
| 3 | 1030 | “Em cảm thấy lo lắng…” | Negative |
| 4 | 1080 | “Thông tin rõ ràng, dễ hiểu.” | Positive |

**Dataset 3 – SHCVHT Meeting Notes (cho AI-03)**

Số dòng: 300–400 biên bản

| meeting_id | text_full | summary_target |
|---|---|---|

**Dataset 4 – Behavioral Data (cho AI-04)**

| student_id | week | attendance | assignments_missing | sentiment | stress |
|---|---|---|---|---|---|
