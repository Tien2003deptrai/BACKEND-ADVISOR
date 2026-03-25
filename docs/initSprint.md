# initSprint.md - Ke hoach trien khai API theo Sprint cho AI-ADVISOR

## 1) Muc tieu
Tai lieu nay dung de:
- Chot pham vi code theo tung sprint.
- Review truoc khi code.
- Kiem tra da hoan thanh hay chua bang checklist acceptance.

Can cu theo:
- `docs/DS Chuc Nang.md`
- `docs/database.md` (MongoDB, V5)

## 2) Hien trang codebase
Da co:
- MongoDB connection
- Auth middleware / authorize middleware
- Auth API co ban: register, login
- Cac model da tao theo database.md

Chua co:
- Services/controllers/routes cho student, academic, feedback, meeting, dashboard, chatbot, notification
- API logout
- API users list/manage
- Validation cho cac module tren

## 3) Nguyen tac trien khai
- Lam theo chieu: `model -> validation -> service -> controller -> route -> app wiring`.
- Moi endpoint phai co:
  - auth/authorize dung role
  - validate input
  - response format thong nhat `{ message, data }`
  - xu ly loi qua `next(error)`
- Uu tien endpoint trong DS API va PBI priority cao truoc.

## 4) Ke hoach Sprint

## Sprint 1 - Backend core + API core (uu tien cao)
Muc tieu: dung duoc cac luong chinh cho auth, student data, feedback, meeting, dashboard co ban.

### 4.1 API scope Sprint 1
- `POST /api/auth/login` (da co, can chuan hoa role)
- `POST /api/auth/logout` (them moi, ban dau la stateless logout)
- `GET /api/users` (admin xem danh sach user)
- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/academic/submit`
- `POST /api/feedback`
- `GET /api/feedback/list`
- `POST /api/meeting`

### 4.2 Files du kien tao/sua
- `src/services/user.service.js`
- `src/services/student.service.js`
- `src/services/academic.service.js`
- `src/services/feedback.service.js`
- `src/services/meeting.service.js`
- `src/controllers/user.controller.js`
- `src/controllers/student.controller.js`
- `src/controllers/academic.controller.js`
- `src/controllers/feedback.controller.js`
- `src/controllers/meeting.controller.js`
- `src/routes/user.route.js`
- `src/routes/student.route.js`
- `src/routes/academic.route.js`
- `src/routes/feedback.route.js`
- `src/routes/meeting.route.js`
- `src/validations/*.js` cho cac module
- `src/app.js` de mount route
- cap nhat `src/controllers/auth.controller.js`, `src/services/auth.service.js`, `src/routes/auth.route.js` cho logout

### 4.3 Acceptance checklist Sprint 1
- [ ] Tat ca API tren tra dung ma status (200/201/400/401/403/404)
- [ ] Role control:
  - [ ] student duoc submit academic/feedback
  - [ ] advisor duoc tao meeting
  - [ ] admin duoc xem users
- [ ] Du lieu ghi dung collection theo database.md
- [ ] `GET /api/students` va `GET /api/students/:id` tra dung thong tin sinh vien (role STUDENT)
- [ ] Co test thu cong bang Postman collection cho toan bo API Sprint 1

## Sprint 2 - Dashboard + Notifications + AI outputs
Muc tieu: hoan thien endpoint dashboard va canh bao.

### 4.4 API scope Sprint 2
- `GET /api/dashboard/student`
- `GET /api/dashboard/advisor`
- `GET /api/dashboard/faculty`
- (noi bo) API/logic tao notification tu risk/sentiment/anomaly

### 4.5 Files du kien tao/sua
- `src/services/dashboard.service.js`
- `src/services/notification.service.js`
- `src/controllers/dashboard.controller.js`
- `src/controllers/notification.controller.js` (neu can endpoint doc danh sach thong bao)
- `src/routes/dashboard.route.js`
- `src/routes/notification.route.js` (optional)
- `src/validations/dashboard.validator.js`
- `src/app.js`

### 4.6 Acceptance checklist Sprint 2
- [ ] Student dashboard co risk score + academic trend + sentiment trend
- [ ] Advisor dashboard co bang SV + risk + alerts
- [ ] Faculty dashboard co phan bo risk + KPI tong hop
- [ ] Notification tao duoc cho risk/sentiment/anomaly canh bao
- [ ] Query co index ho tro (khong scan lon bat thuong)

## Sprint 3 - Chatbot + hardening + completion review
Muc tieu: hoan tat chatbot API, dong bo tai lieu, va review done-to-spec.

### 4.7 API scope Sprint 3
- `POST /api/chatbot/query`
- (neu can) endpoint lich su chat

### 4.8 Files du kien tao/sua
- `src/services/chatbot.service.js`
- `src/controllers/chatbot.controller.js`
- `src/routes/chatbot.route.js`
- `src/validations/chatbot.validator.js`
- `src/app.js`

### 4.9 Acceptance checklist Sprint 3
- [ ] Chatbot query luu thread/messages dung `chat_threads`
- [ ] Du lieu response chatbot dung format thong nhat
- [ ] Hoan tat soat lai mapping API trong `DS Chuc Nang.md`
- [ ] Cap nhat README hoac docs su dung API
- [ ] Smoke test full flow: login -> submit academic -> feedback -> meeting -> dashboard -> chatbot

## 5) Thu tu code khuyen nghi
1. Sprint 1 (core CRUD + auth/logout)
2. Sprint 2 (dashboard aggregate + notifications)
3. Sprint 3 (chatbot + final integration)

## 6) Quy trinh review truoc khi code tung sprint
Moi sprint se theo gate:
1. Chot API contract (request/response/status + role)
2. Chot validation rules
3. Chot test cases thu cong
4. Bat dau code

---
Trang thai hien tai: **Dang cho review Sprint 1/2/3 plan truoc khi code.**
