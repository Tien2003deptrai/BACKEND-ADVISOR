# API liên quan sinh viên (Student)

Tài liệu tổng hợp từ mã nguồn `src/routes`, `src/controllers`, `src/services`, `src/validations` (tiền tố `/api/...`).  
Với route cần bảo vệ: gửi `Authorization: Bearer <access_token>` sau khi đăng nhập `POST /api/auth/login`.

---

## 1. Tra cứu sinh viên — `src/routes/student.route.js`

Base path: **`/api/students`**

| Phương thức | Đường dẫn | Vai trò | Mô tả |
|-------------|-----------|---------|--------|
| POST | `/api/students/` | `ADVISOR`, `FACULTY`, `ADMIN` | Danh sách user có `role: STUDENT`, phân trang, tìm kiếm |
| POST | `/api/students/:id` | `ADVISOR`, `FACULTY`, `ADMIN` | Chi tiết một sinh viên theo MongoId (`:id` phải là user STUDENT) |

### 1.1. Body — `POST /api/students/` (validator: `listStudentsValidator`)

| Trường | Bắt buộc | Ghi chú |
|--------|-----------|---------|
| `page` | Không | Số nguyên ≥ 1 (mặc định 1) |
| `limit` | Không | 1–100 (mặc định 20) |
| `search` | Không | Chuỗi: tìm theo `username`, `email`, `student_info.student_code`, `profile.full_name` (regex, không phân biệt hoa thường) |

**Response `data`:** `{ items, pagination: { page, limit, total, total_pages } }`  
`items`: các field được select: `_id`, `username`, `email`, `role`, `status`, `profile`, `org`, `student_info`, `createdAt`, `updatedAt`.

### 1.2. Params — `POST /api/students/:id` (validator: `getStudentByIdValidator`)

| Param | Ghi chú |
|-------|---------|
| `id` | MongoId hợp lệ |

**Response `data`:** một document user với `role: STUDENT` và cùng các field select như trên.  
**404** nếu không tìm thấy hoặc không phải STUDENT.

---

## 2. Dashboard sinh viên — `src/routes/dashboard.route.js`

| Phương thức | Đường dẫn | Vai trò | Mô tả |
|-------------|-----------|---------|--------|
| POST | `/api/dashboard/student` | chỉ `STUDENT` | Bảng điều khiển cá nhân: rủi ro, học tập, xu hướng cảm xúc feedback |

### 2.1. Body — `studentDashboardValidator` (`dashboard.validator.js`)

| Trường | Bắt buộc | Ghi chú |
|--------|-----------|---------|
| `student_user_id` | Không (validator) | Trong service, `student_user_id` lấy từ **token** (`currentUser.userId`), không từ body cho luồng chính |
| `history_limit` | Không | Số bản ghi học tập tối đa (1–24, mặc định 6) |
| `risk_threshold` | Không | Float 0–1 |

**Response `data` (rút gọn theo `dashboard.service.js`):**  
`student_user_id`, `risk_score`, `risk_label`, `risk_term_code`, `academic_trend`, `sentiment_trend`.

---

## 3. Nộp dữ liệu học thuật — `src/routes/academic.route.js`

| Phương thức | Đường dẫn | Vai trò | Mô tả |
|-------------|-----------|---------|--------|
| POST | `/api/academic/submit` | chỉ `STUDENT` | Upsert bản ghi `AcademicRecord` theo `student_user_id` + `term_id` |

### 3.1. Body — `submitAcademicValidator`

| Trường | Bắt buộc | Ghi chú |
|--------|-----------|---------|
| `student_user_id` | Không | Validator cho phép; route hiện **chỉ STUDENT** — controller gán `student_user_id` từ `req.user.userId` |
| `term_id` | Có | MongoId học kỳ |
| `gpa_prev_sem`, `gpa_current` | Không | 0–4 |
| `num_failed` | Không | Số nguyên ≥ 0 |
| `attendance_rate` | Không | 0–1 |
| `shcvht_participation` | Không | Số nguyên ≥ 0 |
| `study_hours` | Không | ≥ 0 |
| `motivation_score`, `stress_level` | Không | 1–5 |
| `recorded_at` | Không | ISO8601 |

**Ghi chú:** `sentiment_score` được tính từ aggregate feedback (service), không gửi trực tiếp từ client.

---

## 4. Phản hồi (feedback) — `src/routes/feedback.route.js`

| Phương thức | Đường dẫn | Vai trò | Mô tả |
|-------------|-----------|---------|--------|
| POST | `/api/feedback/` | chỉ `STUDENT` | Gửi phản hồi sau cuộc họp (gắn `student_user_id` từ token) |
| POST | `/api/feedback/list` | `STUDENT`, `ADVISOR`, `FACULTY`, `ADMIN` | Danh sách phản hồi; có thể lọc theo sinh viên |

### 4.1. `POST /api/feedback/` — `submitFeedbackValidator`

| Trường | Bắt buộc |
|--------|----------|
| `meeting_id` | Có (MongoId) |
| `feedback_text` | Có (chuỗi, tối thiểu 20 ký tự) |
| `rating` | Không (1–5) |
<!-- sentiment_label không nhập từ client, backend tự động gán sau khi gọi AI -->
| `submitted_at` | Không (ISO8601) |


**Lưu ý:** sentiment_label và feedback_score được backend tự động gán sau khi gọi AI, client không nhập hai trường này khi gửi feedback.

### 4.2. `POST /api/feedback/list` — `listFeedbackValidator`

| Trường | Ghi chú |
|--------|---------|
| `page`, `limit` | Phân trang |
| `class_id`, `student_user_id`, `advisor_user_id` | Lọc theo MongoId |
| `sentiment_label` | `POSITIVE` \| `NEUTRAL` \| `NEGATIVE` |

---

## 5. Thông báo — `src/routes/notification.route.js`

| Phương thức | Đường dẫn | Vai trò | Ghi chú cho sinh viên |
|-------------|-----------|---------|------------------------|
| POST | `/api/notification/list` | `STUDENT`, `ADVISOR`, `FACULTY`, `ADMIN` | Sinh viên xem thông báo của mình (chi tiết xem `notification.controller` / service) |

---

## 6. Tạo tài khoản sinh viên (ADMIN) — `src/routes/user.route.js`

| Phương thức | Đường dẫn | Vai trò | Mô tả |
|-------------|-----------|---------|--------|
| POST | `/api/users/create` | `ADMIN` | Tạo user; với `role: STUDENT` cần `student_info.student_code` và thường kèm `org.department_id`, `org.major_id` (xem `user.validator.js`, `user.service.js`) |

---

## 7. Thành viên lớp (liên quan sinh viên) — `src/routes/classMember.route.js`

| Phương thức | Đường dẫn | Vai trò | Mô tả |
|-------------|-----------|---------|--------|
| POST | `/api/class-members/add` | `ADVISOR`, `ADMIN` | Thêm `student_user_ids` vào lớp (validate khớp khoa/ngành với lớp) |
| POST | `/api/class-members/list` | `ADVISOR`, `ADMIN` | Danh sách thành viên (kèm populate thông tin `student`) |

Chi tiết body/validator: `classMember.validator.js`, `classMember.service.js`.

---

## 8. Model `User` — trường sinh viên

Trong `src/models/user.model.js`:

- `role === "STUDENT"` yêu cầu `student_info.student_code`.
- `student_info`: object (vd. `student_code`), index unique sparse trên `student_info.student_code`.

---

## 9. Nguồn file tham chiếu

| Chức năng | Route | Service | Validator |
|-----------|-------|---------|-----------|
| CRUD tra cứu | `student.route.js` | `student.service.js` | `student.validator.js` |
| Dashboard SV | `dashboard.route.js` | `dashboard.service.js` | `dashboard.validator.js` |
| Học thuật | `academic.route.js` | `academic.service.js` | `academic.validator.js` |
| Feedback | `feedback.route.js` | `feedback.service.js` | `feedback.validator.js` |
| User tạo SV | `user.route.js` | `user.service.js` | `user.validator.js` |
| Thành viên lớp | `classMember.route.js` | `classMember.service.js` | `classMember.validator.js` |

---

## 10. Endpoint không dành cho sinh viên (để tránh nhầm)

| Đường dẫn | Vai trò | Ghi chú |
|-----------|---------|---------|
| `POST /api/meeting/` | chỉ `ADVISOR` | Tạo meeting (mời sinh viên), không phải API “của” STUDENT |
| `POST /api/dashboard/advisor` | chỉ `ADVISOR` | Dashboard cố vấn |
| `POST /api/dashboard/faculty` | `FACULTY`, `ADMIN` | Dashboard đơn vị |

Tài liệu tổng quan admin: `docs/admin-apis.md`.

---

## 11. Đối chiếu `docs/DS Chuc Nang.md` (Student Portal & bảng API §3)

Bảng dưới đây map **PBI / chức năng sinh viên** trong DS với API **đã có trong repo** và ghi chú lệch tài liệu gốc (method/path).

| PBI / mục DS | Chức năng (DS) | API trong DS (mục 3) | Trạng thái trong repo & `student-apis.md` |
|--------------|----------------|----------------------|-------------------------------------------|
| PB04 | Nộp dữ liệu học tập | `POST /api/academic/submit` | **Đủ** — mục §3 |
| PB05 | Phản hồi sau SHCVHT | `POST /api/feedback` | **Đủ** — `POST /api/feedback/` (mục §4) |
| PB06 | Dashboard SV (risk, biểu đồ) | `GET /api/dashboard/student` | **Có API**, nhưng thực tế là **`POST /api/dashboard/student`** (mục §2), không phải GET |
| PB07 | Chatbot học vụ | `POST /api/chatbot/query` | **Chưa có** route tương ứng trong `src/routes` (backlog trong DS) |
| §3 | Danh sách SV | `GET /api/students` | **Có**, nhưng là **`POST /api/students/`** (mục §1); **không** dành cho role STUDENT — dùng cho ADVISOR/FACULTY/ADMIN |
| §3 | Chi tiết SV | `GET /api/students/{id}` | **Có**, nhưng là **`POST /api/students/:id`** (mục §1) |
| §3 | Danh sách phản hồi | `GET /api/feedback/list` | **Có**, nhưng là **`POST /api/feedback/list`** (mục §4) |
| PB03 (mapping bảng chi tiết) | Profile | `GET /api/users` (DS) | **Không khớp**: `POST /api/users` chỉ **ADMIN** (xem `user.route.js`). Sinh viên thường dùng thông tin user trả về khi **login**; chưa có endpoint “profile” riêng trong danh sách này |
| — | Thông báo (hỗ trợ UI) | (không liệt kê riêng trong DS §3) | **Đủ** cho SV — `POST /api/notification/list` (mục §5) |
| — | Chọn học kỳ khi nộp academic (`term_id`) | — | **Hỗ trợ thực tế**: mọi user đã login gọi được `GET /api/master-data/terms/active` và/hoặc `POST /api/master-data/terms/list` (`masterData.route.js`) — **nên gọi từ FE** khi làm form PB04; chi tiết có thể thêm vào tài liệu master-data |

**Kết luận ngắn:** Với **luồng sinh viên cốt lõi** (dashboard, nộp học thuật, gửi feedback, xem thông báo), API backend **đã đủ** để tương ứng PB04–PB06 nếu FE dùng đúng **POST** và payload như validator. **Thiếu** so với DS: **PB07 (chatbot)**, **PB03** nếu cần API profile/update riêng (chưa có như DS mô tả), và cần **bổ sung FE** gọi **master-data terms** khi build form academic. **PB23 (Recommendation)** trong DS là internal — không bắt buộc endpoint public cho SV trong bảng API §3.
