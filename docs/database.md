# De xuat Database V5 - MongoDB (theo yeu cau tach model)

## 1) Muc tieu
- Bo `model_runs`.
- Tach `academic`, `anomaly`, `recommendations` ra khoi `student_terms`.
- Tach `meeting` va `feedback` thanh collection rieng.
- Van bam chuc nang trong `DS Chuc Nang.md` va Dataset 1, 2.

## 2) Collection de xuat (11 collection)

### 2.1 `users`
Gop auth + role + profile + thong tin hoc vu co ban.

```json
{
  "_id": "ObjectId",
  "username": "sv220001",
  "email": "sv220001@uni.edu.vn",
  "password_hash": "...",
  "role": "STUDENT",
  "status": "ACTIVE",
  "profile": {
    "full_name": "Nguyen Van A",
    "phone": "...",
    "date_of_birth": "2005-01-01",
    "gender": "MALE",
    "address": "...",
    "avatar_url": "..."
  },
  "org": {
    "faculty_code": "CNTT",
    "faculty_name": "Cong nghe thong tin",
    "program_code": "KTPM",
    "program_name": "Ky thuat phan mem"
  },
  "student_info": {
    "student_code": "SV220001",
    "cohort_year": 2022,
    "advisor_user_id": "ObjectId",
    "enrollment_status": "ENROLLED"
  },
  "advisor_info": null,
  "last_login_at": "ISODate",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 2.2 `academic_records` (Dataset 1)
Moi document = 1 sinh vien / 1 hoc ky.

```json
{
  "_id": "ObjectId",
  "student_user_id": "ObjectId",
  "term_code": "2026-1",
  "gpa_prev_sem": 2.75,
  "gpa_current": 2.40,
  "num_failed": 2,
  "attendance_rate": 78.5,
  "shcvht_participation": 3,
  "study_hours": 12.5,
  "motivation_score": 2,
  "stress_score": 4,
  "sentiment_score": 0.65,
  "recorded_at": "ISODate",
  "created_at": "timestamps",
  "updated_at": "timestamps"
}
```

### 2.3 `risk_predictions`
Moi document = ket qua AI-01 cho 1 sinh vien / 1 hoc ky.

```json
{
  "_id": "ObjectId",
  "student_user_id": "ObjectId",
  "term_code": "2026-1",
  "risk_score": 0.83,
  "risk_label": 1,
  "model_name": "XGBoost",
  "predicted_at": "ISODate",
  "is_latest": true,
  "created_at": "timestamps"
}
```

### 2.4 `anomaly_alerts`
Moi document = canh bao AI-04.

```json
{
  "_id": "ObjectId",
  "student_user_id": "ObjectId",
  "term_code": "2026-1",
  "alert_type": "GPA_DROP",
  "severity": "HIGH",
  "message": "GPA giam manh so voi ky truoc",
  "model_name": "IsolationForest",
  "detected_at": "ISODate",
  "status": "OPEN",
  "created_at": "timestamps",
  "updated_at": "timestamps"
}
```

### 2.5 `recommendations`
Moi document = 1 goi y cho sinh vien (AI-23).

```json
{
  "_id": "ObjectId",
  "student_user_id": "ObjectId",
  "term_code": "2026-1",
  "risk_prediction_id": "ObjectId",
  "title": "Tang thoi gian tu hoc",
  "content": "Hoc nhom 2 buoi/tuan",
  "priority": "MEDIUM",
  "created_at": "timestamps"
}
```

### 2.6 `advisor_classes`
Moi advisor chi co 1 lop co van.

```json
{
  "_id": "ObjectId",
  "class_code": "CVHT-KTPM-K22",
  "class_name": "Co van hoc tap KTPM K22",
  "advisor_user_id": "ObjectId",
  "faculty_code": "CNTT",
  "program_code": "KTPM",
  "cohort_year": 2022,
  "status": "ACTIVE",
  "created_at": "timestamps",
  "updated_at": "timestamps"
}
```

### 2.7 `class_members`
Moi sinh vien chi thuoc 1 lop co van.

```json
{
  "_id": "ObjectId",
  "class_id": "ObjectId",
  "student_user_id": "ObjectId",
  "joined_at": "ISODate",
  "status": "ACTIVE",
  "created_at": "timestamps",
  "updated_at": "timestamps"
}
```

### 2.8 `meetings`
Moi document = 1 buoi SHCVHT.

```json
{
  "_id": "ObjectId",
  "class_id": "ObjectId",
  "student_user_ids": ["ObjectId", "ObjectId"],
  "advisor_user_id": "ObjectId",
  "term_code": "2026-1",
  "meeting_time": "ISODate",
  "meeting_end_time": "ISODate",
  "notes_raw": "...",
  "notes_summary": "...",
  "summary_model": "T5",
  "created_at": "timestamps",
  "updated_at": "timestamps"
}
```

### 2.9 `feedbacks` (Dataset 2)
Moi document = 1 feedback sau 1 buoi meeting (meeting_id bat buoc), va gui trong vong 24 gio sau meeting_end_time.

```json
{
  "_id": "ObjectId",
  "class_id": "ObjectId",
  "student_user_id": "ObjectId",
  "advisor_user_id": "ObjectId",
  "meeting_id": "ObjectId",
  "feedback_text": "Em dang qua tai hoc phan nay...",
  "rating": 2,
  "submitted_at": "ISODate",
  "sentiment_label": "NEGATIVE", // POSITIVE
  "created_at": "timestamps",
  "updated_at": "timestamps"
}
```

### 2.10 `chat_threads`
Moi document = 1 thread chat cua sinh vien.
(note: bang nay chua co trong code hien tai)

```json
{
  "_id": "ObjectId",
  "student_user_id": "ObjectId",
  "started_at": "ISODate",
  "ended_at": null,
  "messages": [
    {
      "sender_type": "STUDENT",
      "message_text": "Em can tu van hoc vu",
      "created_at": "ISODate"
    },
    {
      "sender_type": "BOT",
      "message_text": "Ban dang gap van de gi?",
      "created_at": "ISODate"
    }
  ],
  "updated_at": "timestamps"
}
```

### 2.11 `notifications`
```json
{
  "_id": "ObjectId",
  "recipient_user_id": "ObjectId",
  "type": "RISK_ALERT",
  "title": "Canh bao sinh vien nguy co cao",
  "content": "SV220001 risk_score=0.83",
  "term_code": "2026-1",
  "ref": {
    "collection": "risk_predictions",
    "doc_id": "ObjectId"
  },
  "is_read": false,
  "sent_at": "ISODate",
  "read_at": null
}
```

## 3) Mapping API -> collection
- `/api/auth/login`, `/api/auth/logout`, `/api/users` -> `users`
- `/api/students`, `/api/students/{id}` -> `users` (filter `role=STUDENT`)
- `/api/advisor-classes` -> `advisor_classes`
- `/api/class-members` -> `class_members`
- `/api/academic/submit` -> `academic_records`
- `/api/feedback`, `/api/feedback/list` -> `feedbacks`
- `/api/meeting` -> `meetings`
- `/api/dashboard/student` -> `academic_records` + `risk_predictions` + `feedbacks.sentiment_label`
- `/api/dashboard/advisor` -> `advisor_classes` + `class_members` + `users` + `risk_predictions` + `feedbacks` + `anomaly_alerts` + `notifications`
- `/api/dashboard/faculty` -> aggregate `risk_predictions` + `anomaly_alerts`
- `/api/chatbot/query` -> `chat_threads`

## 4) Index de xuat
- `users`: unique `username`, unique `email`, unique sparse `student_info.student_code`, index `role`, index `student_info.advisor_user_id`.
- `academic_records`: unique `(student_user_id, term_code)`, index `(student_user_id, recorded_at -1)`.
- `risk_predictions`: unique partial `(student_user_id, term_code, is_latest)` where `is_latest=true`, index `(risk_label, predicted_at -1)`.
- `anomaly_alerts`: index `(student_user_id, detected_at -1)`, index `(status, severity)`.
- `recommendations`: index `(student_user_id, created_at -1)`, index `(term_code)`.
- `advisor_classes`: unique `advisor_user_id`, unique `class_code`, index `status`.
- `class_members`: unique `student_user_id`, unique `(class_id, student_user_id)`, index `(class_id, status)`.
- `meetings`: index `(class_id, meeting_time -1)`, `(student_user_ids, meeting_time -1)`, `(advisor_user_id, meeting_time -1)`.
- `feedbacks`: index `(class_id, submitted_at -1)`, `(student_user_id, submitted_at -1)`, `(advisor_user_id, submitted_at -1)`, `sentiment_label`, `meeting_id`.
  unique `(meeting_id, student_user_id)` de moi SV chi gui 1 feedback cho 1 meeting.
- `chat_threads`: index `student_user_id`, index `updated_at -1`.
- `notifications`: index `(recipient_user_id, is_read, sent_at -1)`.

## 5) MVP de code ngay
- `users`
- `academic_records`
- `risk_predictions`
- `advisor_classes`
- `class_members`
- `meetings`
- `feedbacks`
- `notifications`

Them o sprint sau:
- `chat_threads`
