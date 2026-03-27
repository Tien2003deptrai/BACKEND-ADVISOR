# Admin Provisioning Flow (Step-by-step)

Tai lieu nay mo ta luong thao tac cho `ADMIN` de setup du lieu nen:

1. `departments`
2. `majors`
3. `terms`
4. `users` (advisor)
5. `advisor_classes`
6. `users` (student)
7. `class_members`

## 0) Dang nhap ADMIN

- Endpoint: `POST /api/auth/login`
- Body:

```json
{
  "email": "admin@advisor.local",
  "password": "Admin@123456"
}
```

Lay `access_token` tu response va dung cho cac API ben duoi:

- Header: `Authorization: Bearer <access_token>`

## 1) Tao Department

- Endpoint: `POST /api/master-data/departments`
- Role: `ADMIN`
- Body:

```json
{
  "department_code": "CNTT",
  "department_name": "Cong nghe thong tin"
}
```

Luu lai `data._id` -> `department_id`.

## 2) Tao Major

- Endpoint: `POST /api/master-data/majors`
- Role: `ADMIN`
- Body:

```json
{
  "major_code": "KTPM",
  "major_name": "Ky thuat phan mem",
  "department_id": "OBJECT_ID_DEPARTMENT"
}
```

Luu lai `data._id` -> `major_id`.

## 3) Tao Term

- Endpoint: `POST /api/master-data/terms`
- Role: `ADMIN`
- Body:

```json
{
  "term_code": "2026-1",
  "academic_year": "2026-2027",
  "term_name": "Hoc ky 1",
  "start_date": "2026-08-15T00:00:00.000Z",
  "end_date": "2026-12-31T23:59:59.000Z",
  "status": "ACTIVE"
}
```

Note:
- Co the tao nhieu term.
- Tai mot thoi diem chi 1 term co `status=ACTIVE`.

## 4) Tao User Advisor

- Endpoint: `POST /api/users/create`
- Role: `ADMIN`
- Body:

```json
{
  "profile": {
    "full_name": "Nguyen Thi Lan"
  },
  "username": "lan.nt",
  "email": "lan.nt@duytan.edu.vn",
  "password": "123456",
  "role": "ADVISOR",
  "org": {
    "department_id": "OBJECT_ID_DEPARTMENT",
    "major_id": "OBJECT_ID_MAJOR"
  },
  "advisor_info": {
    "staff_code": "GV101",
    "title": "ThS"
  }
}
```

Luu lai `data._id` -> `advisor_user_id`.

## 5) Tao Advisor Class

- Endpoint: `POST /api/advisor-classes/`
- Role: `ADMIN`
- Body:

```json
{
  "advisor_user_id": "OBJECT_ID_ADVISOR_USER",
  "class_code": "KTPM-K18-A",
  "class_name": "Lop KTPM K18 A",
  "department_id": "OBJECT_ID_DEPARTMENT",
  "major_id": "OBJECT_ID_MAJOR",
  "cohort_year": 2026,
  "status": "ACTIVE"
}
```

Rules:
- `advisor_user_id` phai la role `ADVISOR`.
- Advisor phai cung `department_id` voi class.
- `major_id` la optional.
- Neu co `major_id` thi major phai thuoc `department_id`.

Luu lai `data._id` -> `class_id`.

## 6) Tao User Student

- Endpoint: `POST /api/users/create`
- Role: `ADMIN`
- Body:

```json
{
  "profile": {
    "full_name": "Tran Van Minh"
  },
  "username": "minh.tv",
  "email": "minh.tv@duytan.edu.vn",
  "password": "123456",
  "role": "STUDENT",
  "org": {
    "department_id": "OBJECT_ID_DEPARTMENT",
    "major_id": "OBJECT_ID_MAJOR"
  },
  "student_info": {
    "student_code": "SV220001"
  }
}
```

Luu lai `data._id` -> `student_user_id`.

## 7) Add Student vao Class

- Endpoint: `POST /api/class-members/add`
- Role: `ADMIN` hoac `ADVISOR`
- Body:

```json
{
  "class_id": "OBJECT_ID_CLASS",
  "student_user_ids": [
    "OBJECT_ID_STUDENT_1",
    "OBJECT_ID_STUDENT_2"
  ]
}
```

Rules:
- Student phai role `STUDENT`.
- Student phai cung `department_id` voi class.
- Neu class co `major_id` thi student phai cung `major_id`.
- Moi student chi thuoc 1 class tai mot thoi diem.

## Checklist nhanh cho ADMIN

- Da tao it nhat 1 department.
- Da tao it nhat 1 major thuoc department do.
- Da tao term ACTIVE hien tai.
- Da tao advisor user va class cho advisor.
- Da tao student user va add vao class.
- Da login bang tai khoan advisor/student de test luong tiep theo.
