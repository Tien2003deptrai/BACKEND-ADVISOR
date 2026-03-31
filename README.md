# BACKEND-ADVISOR

Backend API cho hệ thống Advisor, xây dựng bằng Node.js + Express + MongoDB.

## Mo ta ngan

Du an cung cap cac API chinh:
- Xac thuc nguoi dung (auth, JWT)
- Quan ly user, student
- Hoc tap/diem so (academic)
- Feedback, meeting, notification
- Dashboard tong hop

## Cong nghe

- Node.js
- Express
- MongoDB (Mongoose)
- JWT, bcryptjs

## Chuan bi truoc khi chay

1. Cai Node.js (khuyen nghi ban LTS).
2. Tao file `.env` tai thu muc goc (co the copy tu `.env.example`).
3. Dien cac bien toi thieu:

```env
PORT=3000
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_secret>
JWT_EXPIRES_IN=7d
```


## Lưu ý khi chạy dự án

**Bạn cần khởi động AI server (FastAPI AI) trước khi chạy backend nếu muốn sử dụng các chức năng phân tích AI (sentiment, risk, ...).**

- Xem hướng dẫn chi tiết tại: `ai-services/fastapi-ai/README.md`
- Hoặc chạy nhanh:

```bash
cd ai-services/fastapi-ai
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Sau khi AI server đã chạy (thường ở http://localhost:8001), bạn mới chạy backend như hướng dẫn bên dưới.

---

## Cach chay du an

```bash
npm i
npm run dev
```

Neu chay thanh cong, terminal se hien thi:
- `MongoDB connected`
- `Server running on port 3000`
