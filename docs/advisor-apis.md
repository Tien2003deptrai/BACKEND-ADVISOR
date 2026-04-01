# API ADVISOR - Chức năng và mục đích sử dụng

Tài liệu này tập trung vào câu hỏi: API này làm gì đối với Cố vấn học tập (ADVISOR).

## Quy ước chung

- Tất cả endpoint bên dưới có prefix `/api`
- Các endpoint được bảo vệ cần header `Authorization: Bearer <access_token>`

## 1. Các API ADVISOR sử dụng trực tiếp trong nghiệp vụ


| API                               | Chức năng đối với ADVISOR                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `POST /api/dashboard/advisor`     | Xem dashboard tổng quan danh sách sinh viên theo mức độ rủi ro, hỗ trợ ưu tiên can thiệp.    |
| `POST /api/meeting/`              | Tạo lịch họp tư vấn với sinh viên (1-n), lưu thời gian và nội dung buổi họp.                 |
| `POST /api/advisor-classes/my`    | Lấy lớp cố vấn ADVISOR đang phụ trách, xác định phạm vi quản lý.                             |
| `POST /api/class-members/add`     | Thêm sinh viên vào lớp cố vấn để quản lý đúng danh sách.                                     |
| `POST /api/class-members/list`    | Xem danh sách thành viên lớp cố vấn (có phân trang/lọc, tìm kiếm).                           |
| `POST /api/students/:id`          | Xem chi tiết 1 sinh viên cụ thể.                                                             |
| `POST /api/feedback/list`         | Xem feedback sau họp để đánh giá tâm lý/cảm nhận của sinh viên.                              |
| `POST /api/notification/list`     | Xem các thông báo/cảnh báo liên quan đến ADVISOR và sinh viên trong phạm vi theo dõi.        |
| `POST /api/notification/generate` | Chủ động tạo/rerun cảnh báo rủi ro, cảm xúc tiêu cực để phát hiện trường hợp cần hỗ trợ sớm. |


## 2. Ý nghĩa theo luồng công việc ADVISOR

1. Bắt đầu bằng `dashboard/advisor` để nhìn nhanh mức độ rủi ro.
2. Dùng `students/:id`, `feedback/list` để đánh giá từng sinh viên.
3. Dùng `advisor-classes/my`, `class-members/list` để kiểm tra danh sách lớp.
4. Dùng `class-members/add` khi cần bổ sung sinh viên vào lớp.
5. Dùng `meeting/` để tạo lịch họp và ghi nhận nội dung tư vấn.
6. Dùng `notification/list` + `notification/generate` để theo dõi và kích hoạt cảnh báo chủ động.

## 3. API xác thực ADVISOR cần dùng


| API                      | Mục đích                      |
| ------------------------ | ----------------------------- |
| `POST /api/auth/login`   | Đăng nhập lấy access token    |
| `POST /api/auth/refresh` | Làm mới token khi gần hết hạn |
| `POST /api/auth/logout`  | Đăng xuất                     |


## 4. API dữ liệu nền ADVISOR có thể gọi

Những API này không khóa role cụ thể (chỉ cần đã đăng nhập), ADVISOR có thể dùng để load dữ liệu bộ lọc/form:

- `POST /api/master-data/departments/list`
- `POST /api/master-data/majors/list`
- `POST /api/master-data/terms/list`
- `GET /api/master-data/terms/active`

## 5. Nguồn đối chiếu

- `src/app.js`
- `src/routes/*.route.js`
- `src/validations/*.validator.js`

