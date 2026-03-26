# Dashboard Flow (AI-01 + AI-02)

## 1) Scope
Tai lieu mo ta luong dashboard hien tai:
- `STUDENT`: chi xem dashboard cua chinh minh
- `ADVISOR`: chi xem dashboard cua chinh advisor do
- Chi hien thi du lieu lien quan `risk` va `sentiment` (anomaly tam an)

## 2) Student Dashboard Sequence
```mermaid
sequenceDiagram
    participant S as Student
    participant API as Backend API
    participant DB as MongoDB

    S->>API: GET /api/dashboard/student (JWT STUDENT)
    API->>API: Lay student_user_id tu token
    API->>DB: Query risk_predictions (latest theo student)
    API->>DB: Query academic_records (history theo student)
    API->>DB: Aggregate feedbacks -> sentiment_trend theo thang
    DB-->>API: risk + academic_trend + sentiment_trend
    API-->>S: 200 { risk_score, risk_label, academic_trend, sentiment_trend }
```

## 3) Advisor Dashboard Sequence
```mermaid
sequenceDiagram
    participant A as Advisor
    participant API as Backend API
    participant DB as MongoDB

    A->>API: GET /api/dashboard/advisor (JWT ADVISOR)
    API->>API: Lay advisor_user_id tu token
    API->>API: generateAlerts (risk + sentiment)
    API->>DB: Tim advisor_classes theo advisor_user_id
    API->>DB: Tim class_members ACTIVE theo class_id
    API->>DB: Query users (student profile)
    API->>DB: Query latest risk_predictions theo student
    API->>DB: Aggregate feedbacks NEGATIVE 30 ngay
    API->>DB: Query notifications type in [RISK_ALERT, SENTIMENT_ALERT]
    DB-->>API: student_table + recent_alerts
    API-->>A: 200 { student_table, recent_alerts, pagination }
```

## 4) Payload chinh
### 4.1 Student dashboard
- `risk_score`
- `risk_label`
- `academic_trend`
- `sentiment_trend`

### 4.2 Advisor dashboard
- `student_table[]`
  - `student_user_id`, `student_code`, `full_name`, `email`
  - `risk_score`, `risk_label`
  - `alerts.negative_sentiment_30d`
  - `alerts.high_risk`
  - `alert_count` = `negative_sentiment_30d + high_risk`
- `recent_alerts` (chi `RISK_ALERT`, `SENTIMENT_ALERT`)
- `pagination`

## 5) Rule quyen truy cap
- `/api/dashboard/student`: chi role `STUDENT`
- `/api/dashboard/advisor`: chi role `ADVISOR`
- Khong cho override `student_user_id` hoac `advisor_user_id` qua body

