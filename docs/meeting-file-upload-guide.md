# Meeting File Upload Guide

## 1) Mục tiêu
Tài liệu này hướng dẫn cách upload file đính kèm cho meeting, xem file trên Cloudinary, và tạo link tải xuống từ backend.

## 2) Endpoint upload
- Method: `POST`
- URL: `/api/meeting`
- Auth: `Bearer token` (role `ADVISOR`)
- Content-Type: `multipart/form-data`
- File field name: `file`

Lưu ý:
- `student_user_ids` khi gửi form-data nên truyền dạng JSON string.
- File hợp lệ: `doc`, `docx`, `pdf`.
- Dung lượng tối đa: `5 MB`.

## 3) Ví dụ request (multipart/form-data)
```bash
curl --location 'http://localhost:3000/api/meeting' \
--header 'Authorization: Bearer <TOKEN>' \
--form 'class_id="65f000000000000000000111"' \
--form 'student_user_ids="[\"65f000000000000000000201\",\"65f000000000000000000202\"]"' \
--form 'meeting_time="2026-04-03T08:00:00.000Z"' \
--form 'meeting_end_time="2026-04-03T09:00:00.000Z"' \
--form 'notes_raw="Nội dung sinh hoạt cố vấn học tập đủ 30 ký tự trở lên..."' \
--form 'file=@"/path/to/meeting-notes.docx"'
```

## 4) Cấu trúc file object trong response
Sau khi tạo meeting thành công, `data.file` có dạng:
```json
{
  "url": "https://res.cloudinary.com/<cloud_name>/raw/upload/v<version>/meetings/files/<public_id>.<ext>",
  "public_id": "meetings/files/file_tuhwza",
  "file_size": 0.36,
  "format": "docx"
}
```

Ý nghĩa:
- `url`: link delivery để mở file.
- `public_id`: định danh file trên Cloudinary.
- `file_size`: kích thước file theo MB (làm tròn 2 chữ số thập phân).
- `format`: định dạng file (`doc`, `docx`, `pdf`).

## 5) Xem file trên Cloudinary
1. Đăng nhập Cloudinary Console.
2. Vào `Media Library`.
3. Mở folder `meetings/files`.
4. Chọn file theo `public_id`.
5. Dùng `Open` để xem link delivery, hoặc `Download` để tải.

## 6) Hành vi mở file theo định dạng
- `pdf`: thường mở trực tiếp trên browser.
- `doc`/`docx`: thường browser sẽ tải xuống.

## 7) Tạo link bắt buộc tải xuống (attachment)
Nếu muốn frontend luôn tải file, backend có thể tạo thêm `download_url`:
```js
const downloadUrl = cloudinary.url(file.public_id, {
  resource_type: "raw",
  type: "upload",
  secure: true,
  flags: "attachment",
  format: file.format,
});
```

Frontend có thể:
- Nút `Xem file`: mở `file.url`.
- Nút `Tải xuống`: mở `download_url`.

## 8) Ghi chú migration dữ liệu cũ
Hiện tại `file_size` lưu theo MB.
Nếu dữ liệu cũ đã lưu theo bytes, cần viết script migration để đồng nhất (bytes / 1024 / 1024).
