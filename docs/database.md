# Database Spec - Current Codebase (MongoDB)

Tai lieu nay mo ta schema hien tai dang chay trong source.

## 1) Collections hien co (15)

1. `users`
2. `departments`
3. `majors`
4. `terms`
5. `advisor_classes`
6. `class_members`
7. `academic_records`
8. `risk_predictions`
9. `anomaly_alerts`
10. `recommendations`
11. `meetings`
12. `feedbacks`
13. `notifications`
14. `refresh_tokens`
15. `revoked_access_tokens`

## 2) Schema chinh

### 2.1 `users`

```json
{
  "_id": "ObjectId",
  "username": "sv220001",
  "email": "sv220001@uni.edu.vn",
  "password_hash": "...",
  "role": "STUDENT | ADVISOR | FACULTY | ADMIN",
  "status": "ACTIVE | INACTIVE | LOCKED",
  "profile": {
    "full_name": "Nguyen Van A",
    "phone": "...",
    "date_of_birth": "ISODate",
    "gender": "MALE | FEMALE | OTHER",
    "address": "...",
    "avatar_url": "..."
  },
  "org": {
    "department_id": "ObjectId",
    "major_id": "ObjectId"
  },
  "student_info": {
    "student_code": "SV220001",
    "cohort_year": 2022,
    "advisor_user_id": "ObjectId",
    "enrollment_status": "ENROLLED | ON_LEAVE | GRADUATED | DROPPED"
  },
  "advisor_info": {
    "staff_code": "GV001",
    "title": "ThS"
  },
  "last_login_at": "ISODate",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.2 `departments`

```json
{
  "_id": "ObjectId",
  "department_code": "CNTT",
  "department_name": "Cong nghe thong tin",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 2.3 `majors`

```json
{
  "_id": "ObjectId",
  "major_code": "KTPM",
  "major_name": "Ky thuat phan mem",
  "department_id": "ObjectId",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 2.4 `terms`

```json
{
  "_id": "ObjectId",
  "term_code": "2026-1",
  "academic_year": "2026-2027",
  "term_name": "Hoc ky 1",
  "start_date": "ISODate",
  "end_date": "ISODate",
  "status": "ACTIVE | INACTIVE",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

Note: chi 1 term `ACTIVE` tai 1 thoi diem.

### 2.5 `advisor_classes`

```json
{
  "_id": "ObjectId",
  "class_code": "KTPM-K18-A",
  "class_name": "Lop KTPM K18 A",
  "advisor_user_id": "ObjectId",
  "department_id": "ObjectId",
  "major_id": "ObjectId",
  "cohort_year": 2026,
  "status": "ACTIVE | INACTIVE",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.6 `class_members`

```json
{
  "_id": "ObjectId",
  "class_id": "ObjectId",
  "student_user_id": "ObjectId",
  "joined_at": "ISODate",
  "status": "ACTIVE | INACTIVE",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.7 `academic_records`

```json
{
  "_id": "ObjectId",
  "student_user_id": "ObjectId",
  "term_code": "2026-1",
  "gpa_prev_sem": 2.75,
  "gpa_current": 2.4,
  "num_failed": 2,
  "attendance_rate": 78.5,
  "shcvht_participation": 3,
  "study_hours": 12.5,
  "motivation_score": 2,
  "stress_score": 4,
  "sentiment_score": 0.65,
  "recorded_at": "ISODate",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.8 `risk_predictions`

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
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.9 `anomaly_alerts`

```json
{
  "_id": "ObjectId",
  "student_user_id": "ObjectId",
  "term_code": "2026-1",
  "alert_type": "GPA_DROP",
  "severity": "LOW | MEDIUM | HIGH",
  "message": "...",
  "model_name": "IsolationForest",
  "detected_at": "ISODate",
  "status": "OPEN | ACKED | RESOLVED",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.10 `recommendations`

```json
{
  "_id": "ObjectId",
  "student_user_id": "ObjectId",
  "term_code": "2026-1",
  "risk_prediction_id": "ObjectId",
  "title": "Tang thoi gian tu hoc",
  "content": "Hoc nhom 2 buoi/tuan",
  "priority": "LOW | MEDIUM | HIGH",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.11 `meetings`

```json
{
  "_id": "ObjectId",
  "class_id": "ObjectId",
  "student_user_ids": ["ObjectId", "ObjectId"],
  "advisor_user_id": "ObjectId",
  "term_id": "ObjectId",
  "meeting_time": "ISODate",
  "meeting_end_time": "ISODate",
  "notes_raw": "Noi dung bien ban can du mo ta, khong qua ngan",
  "notes_summary": "...",
  "summary_model": "T5",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.12 `feedbacks`

```json
{
  "_id": "ObjectId",
  "class_id": "ObjectId",
  "student_user_id": "ObjectId",
  "advisor_user_id": "ObjectId",
  "meeting_id": "ObjectId",
  "feedback_text": "...",
  "rating": 2,
  "submitted_at": "ISODate",
  "sentiment_label": "POSITIVE | NEUTRAL | NEGATIVE",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.13 `notifications`

```json
{
  "_id": "ObjectId",
  "recipient_user_id": "ObjectId",
  "type": "RISK_ALERT | SENTIMENT_ALERT | ANOMALY_ALERT | SYSTEM",
  "title": "...",
  "content": "...",
  "term_code": "2026-1",
  "ref": {
    "collection_name": "risk_predictions",
    "doc_id": "ObjectId"
  },
  "is_read": false,
  "sent_at": "ISODate",
  "read_at": "ISODate | null",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.14 `refresh_tokens`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "jti": "uuid",
  "expires_at": "ISODate",
  "revoked_at": "ISODate | null",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 2.15 `revoked_access_tokens`

```json
{
  "_id": "ObjectId",
  "jti": "uuid",
  "user_id": "ObjectId",
  "expires_at": "ISODate",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

## 3) Mapping API -> collection

- `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout` -> `users`, `refresh_tokens`, `revoked_access_tokens`
- `/api/users/create`, `/api/users` -> `users`
- `/api/master-data/departments*` -> `departments`
- `/api/master-data/majors*` -> `majors`
- `/api/master-data/terms*` -> `terms`
- `/api/students`, `/api/students/:id` -> `users` (filter `role=STUDENT`)
- `/api/advisor-classes/*` -> `advisor_classes`
- `/api/class-members/*` -> `class_members`
- `/api/academic/submit` -> `academic_records` (co validate `term_code` ton tai)
- `/api/feedback`, `/api/feedback/list` -> `feedbacks`
- `/api/meeting` -> `meetings` (co validate `term_id` ton tai neu gui)
- `/api/dashboard/student` -> `academic_records` + `risk_predictions` + `feedbacks`
- `/api/dashboard/advisor` -> `advisor_classes` + `class_members` + `users` + `risk_predictions` + `feedbacks` + `notifications`
- `/api/dashboard/faculty` -> `users` + `risk_predictions` + `anomaly_alerts`

## 4) Index quan trong

- `users`: unique `username`, unique `email`, unique sparse `student_info.student_code`, index `org.department_id`, `org.major_id`, `role`.
- `departments`: unique `department_code`, index `department_name`.
- `majors`: unique `(department_id, major_code)`, index `major_name`.
- `terms`: unique `term_code`, unique partial `status=ACTIVE`, index `(start_date, end_date)`.
- `advisor_classes`: unique `advisor_user_id`, unique `class_code`, index `status`, `department_id`, `major_id`.
- `class_members`: unique `student_user_id`, unique `(class_id, student_user_id)`, index `(class_id, status)`.
- `academic_records`: unique `(student_user_id, term_code)`, index `(student_user_id, recorded_at -1)`.
- `risk_predictions`: unique partial `(student_user_id, term_code, is_latest)` where `is_latest=true`, index `(risk_label, predicted_at -1)`.
- `anomaly_alerts`: index `(student_user_id, detected_at -1)`, index `(status, severity)`.
- `recommendations`: index `(student_user_id, createdAt -1)`, index `(term_code)`.
- `meetings`: index `(class_id, meeting_time -1)`, `(student_user_ids, meeting_time -1)`, `(advisor_user_id, meeting_time -1)`.
- `feedbacks`: index `(class_id, submitted_at -1)`, `(student_user_id, submitted_at -1)`, `(advisor_user_id, submitted_at -1)`, `sentiment_label`, unique `(meeting_id, student_user_id)`.
- `notifications`: index `(recipient_user_id, is_read, sent_at -1)`.
- `refresh_tokens`: unique `jti`, index `(user_id, revoked_at)`, TTL index `expires_at`.
- `revoked_access_tokens`: unique `jti`, TTL index `expires_at`.

## 5) Rule nghiep vu dang enforce trong service

- Tao user (`/api/users/create`) chi role `ADVISOR` hoac `STUDENT`.
- `org.department_id` va `org.major_id` di cung nhau khi tao user.
- Tao class: advisor phai cung `department_id` voi class.
- Add class members: student phai cung `department_id` voi class; neu class co `major_id` thi student phai cung `major_id`.
- Auth:
  - login tra `access_token` + `refresh_token`
  - refresh token theo co che rotate
  - logout revoke refresh token va blacklist access token hien tai.
