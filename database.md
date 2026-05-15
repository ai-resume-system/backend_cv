# 🗄 DATABASE DESIGN — Recruitment & AI CV System

# Rule quy định ghi file database.md

- Hiển thị theo thứ tự
- Hiển thị các Indexes, Redis, Follow luồng đi của dữ liệu
- Hiển thị dạng bảng gồm các cột: STT, Column, Type, Constraint, Description

---

## 👤 users - Bảng người dùng

| STT | Column     | Type         | Constraint           | Description                        |
| --- | ---------- | ------------ | -------------------- | ---------------------------------- |
| 1   | id         | UUID         | PK                   | ID người dùng                      |
| 2   | email      | VARCHAR(255) | UNIQUE, NOT NULL     | Email đăng nhập                    |
| 3   | phone      | VARCHAR(20)  | NULL, INDEX          | Số điện thoại                      |
| 4   | password   | VARCHAR(255) | NOT NULL             | Mật khẩu hash (bcrypt)             |
| 5   | status     | ENUM         | DEFAULT 'ACTIVE'     | Trạng thái: ACTIVE, LOCKED         |
| 6   | role       | ENUM         | DEFAULT 'JOB_SEEKER' | Role: JOB_SEEKER, RECRUITER, ADMIN |
| 7   | created_at | TIMESTAMP    | NOT NULL             | Thời gian tạo                      |
| 8   | updated_at | TIMESTAMP    | NOT NULL             | Thời gian cập nhật                 |
| 9   | deleted_at | TIMESTAMP    | NULL                 | Soft delete                        |

### Indexes

| STT | Index                     | Columns                   | Unique | Description         |
| --- | ------------------------- | ------------------------- | ------ | ------------------- |
| 1   | idx_users_status          | status                    | false  | Index theo status   |
| 2   | idx_users_role            | role                      | false  | Index theo role     |
| 3   | idx_users_created_at      | createdAt                 | false  | Index theo ngày tạo |
| 4   | idx_users_email           | email                     | true   | unique email        |
| 5   | idx_users_phone           | phone                     | false  | Index theo phone    |
| 6   | idx_users_del_status_role | (deletedAt, status, role) | false  | Composite index     |

---

## 🏢 companies - Bảng công ty ( recruiter )

| STT | Column               | Type         | Constraint | Description             |
| --- | -------------------- | ------------ | ---------- | ----------------------- |
| 1   | id                   | UUID         | PK         | ID công ty              |
| 2   | user_id              | UUID         | UNIQUE     | FK -> users(id)         |
| 3   | career_categories_id | UUID         | NULL       | FK -> career_categories |
| 4   | company_name         | VARCHAR(255) | NULL       | Tên công ty             |
| 5   | logo_url             | TEXT         | NULL       | URL logo                |
| 6   | location             | TEXT         | NULL       | Địa chỉ                 |
| 7   | description          | TEXT         | NULL       | Mô tả                   |
| 8   | tax_code             | VARCHAR(20)  | NULL       | Mã số thuế              |
| 9   | website_url          | VARCHAR(255) | NULL       | Website                 |
| 10  | created_at           | TIMESTAMP    | NOT NULL   | Thời gian tạo           |
| 11  | updated_at           | TIMESTAMP    | NOT NULL   | Thời gian cập nhật      |
| 12  | deleted_at           | TIMESTAMP    | NULL       | Soft delete             |

### Indexes

| STT | Index                 | Columns | Unique | Description |
| --- | --------------------- | ------- | ------ | ----------- |
| 1   | idx_companies_user_id | user_id | true   | unique user |

---

## 👤 user_profiles - Bảng profile người dùng ( job seeker )

| STT | Column     | Type         | Constraint | Description        |
| --- | ---------- | ------------ | ---------- | ------------------ |
| 1   | id         | UUID         | PK         | ID profile         |
| 2   | user_id    | UUID         | UNIQUE     | FK -> users(id)    |
| 3   | full_name  | VARCHAR(255) | NULL       | Họ tên             |
| 4   | avatar_url | TEXT         | NULL       | URL avatar         |
| 5   | bio        | TEXT         | NULL       | Giới thiệu         |
| 6   | created_at | TIMESTAMP    | NOT NULL   | Thời gian tạo      |
| 7   | updated_at | TIMESTAMP    | NOT NULL   | Thời gian cập nhật |
| 8   | deleted_at | TIMESTAMP    | NULL       | Soft delete        |

### Indexes

| STT | Index                     | Columns | Unique | Description |
| --- | ------------------------- | ------- | ------ | ----------- |
| 1   | idx_user_profiles_user_id | user_id | true   | unique user |

---

## 💼 jobs - Bảng tin tuyển dụng

| STT | Column             | Type         | Constraint          | Description                                      |
| --- | ------------------ | ------------ | ------------------- | ------------------------------------------------ |
| 1   | id                 | UUID         | PK                  | ID job                                           |
| 2   | company_id         | UUID         | NOT NULL            | FK -> companies(id)                              |
| 3   | career_category_id | UUID         | NULL                | FK -> career_categories                          |
| 4   | title              | VARCHAR(255) | NOT NULL            | Tiêu đề                                          |
| 5   | description        | TEXT         | NULL                | Mô tả chi tiết                                   |
| 6   | short_description  | TEXT         | NULL                | Mô tả ngắn                                       |
| 7   | location           | VARCHAR(255) | NULL                | Địa điểm làm việc                                |
| 8   | salary_min         | INT          | NULL                | Lương tối thiểu                                  |
| 9   | salary_max         | INT          | NULL                | Lương tối đa                                     |
| 10  | experience_years   | INT          | NULL                | Số năm kinh nghiệm                               |
| 11  | job_type           | ENUM         | DEFAULT 'FULL_TIME' | Loại: FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT |
| 12  | expired_at         | TIMESTAMPTZ  | NULL                | Ngày hết hạn                                     |
| 13  | reject_reason      | TEXT         | NULL                | Lý do từ chối                                    |
| 14  | status             | ENUM         | DEFAULT 'PENDING'   | PENDING, OPEN, CLOSED, REJECTED                  |
| 15  | created_at         | TIMESTAMP    | NOT NULL            | Thời gian tạo                                    |
| 16  | updated_at         | TIMESTAMP    | NOT NULL            | Thời gian cập nhật                               |
| 17  | deleted_at         | TIMESTAMP    | NULL                | Soft delete                                      |

### Indexes

| STT | Index                     | Columns             | Unique | Description                  |
| --- | ------------------------- | ------------------- | ------ | ---------------------------- |
| 1   | idx_jobs_deleted_status   | (deletedAt, status) | false  | Composite index              |
| 2   | idx_jobs_title_trgm       | title               | false  | Full-text search (pg_trgm)   |
| 3   | idx_jobs_location_trgm    | location            | false  | Full-text search location    |
| 4   | idx_jobs_description_trgm | description         | false  | Full-text search description |
| 5   | idx_jobs_active_created   | (createdAt, id)     | false  | Active job sorting           |
| 6   | idx_jobs_company_status   | (companyId, status) | false  | Company jobs                 |
| 7   | idx_jobs_career_category  | careerCategoryId    | false  | Career category filter       |
| 8   | idx_jobs_expired_at       | expiredAt           | false  | Expired jobs filter          |

---

## 📄 cvs - Bảng CV ứng viên

| STT | Column            | Type         | Constraint        | Description                            |
| --- | ----------------- | ------------ | ----------------- | -------------------------------------- |
| 1   | id                | UUID         | PK                | ID CV                                  |
| 2   | user_id           | UUID         | NOT NULL          | FK -> users(id)                        |
| 3   | title             | VARCHAR(255) | NULL              | Tiêu đề CV                             |
| 4   | file_url          | TEXT         | NULL              | URL file S3                            |
| 5   | file_extension    | VARCHAR(20)  | NULL              | Đuôi file: pdf, docx                   |
| 6   | processing_status | ENUM         | DEFAULT 'PENDING' | PENDING, PROCESSING, COMPLETED, FAILED |
| 7   | is_default        | BOOLEAN      | DEFAULT false     | CV mặc định                            |
| 8   | summary           | TEXT         | NULL              | Tóm tắt AI trích xuất                  |
| 9   | status            | ENUM         | DEFAULT 'ACTIVE'  | ACTIVE, INACTIVE                       |
| 10  | created_at        | TIMESTAMP    | NOT NULL          | Thời gian tạo                          |
| 11  | updated_at        | TIMESTAMP    | NOT NULL          | Thời gian cập nhật                     |
| 12  | deleted_at        | TIMESTAMP    | NULL              | Soft delete                            |

### Indexes

| STT | Index                     | Columns             | Unique | Description       |
| --- | ------------------------- | ------------------- | ------ | ----------------- |
| 1   | idx_cvs_deleted_status    | (deletedAt, status) | false  | Composite index   |
| 2   | idx_cvs_user_default      | (userId, isDefault) | false  | Default CV lookup |
| 3   | idx_cvs_user_created      | (userId, createdAt) | false  | User CV sorting   |
| 4   | idx_cvs_user_status       | (userId, status)    | false  | User active CVs   |
| 5   | idx_cvs_processing_status | processingStatus    | false  | Processing status |

---

## 🏢 job_applications - Bảng lưu trữ đơn ứng tuyển công việc

| STT | Column            | Type         | Constraint        | Description                 |
| --- | ----------------- | ------------ | ----------------- | --------------------------- |
| 1   | id                | UUID         | PK                | ID đơn ứng tuyển            |
| 2   | cv_id             | UUID         | FK -> cvs(id)     | ID CV                       |
| 3   | user_id           | UUID         | FK -> users(id)   | ID ứng viên                 |
| 4   | job_id            | UUID         | FK -> jobs(id)    | ID công việc                |
| 5   | matching_score    | DECIMAL(5,2) | NULL              | Điểm tương thích AI (0-100) |
| 6   | notes             | TEXT         | NULL              | Ghi chú của ứng viên        |
| 7   | status            | VARCHAR(20)  | DEFAULT 'APPLIED' | Trạng thái đơn              |
| 8   | schedule_time     | TIMESTAMPTZ  | NULL              | Thời gian phỏng vấn         |
| 9   | schedule_location | VARCHAR(500) | NULL              | Địa điểm phỏng vấn          |
| 10  | schedule_link     | TEXT         | NULL              | Link phỏng vấn online       |
| 11  | created_at        | TIMESTAMP    | NOT NULL          | Thời gian tạo               |
| 12  | updated_at        | TIMESTAMP    | NOT NULL          | Thời gian cập nhật          |
| 13  | deleted_at        | TIMESTAMP    | NULL              | Soft delete                 |

### Indexes

| STT | Index                     | Columns           | Unique | Description                       |
| --- | ------------------------- | ----------------- | ------ | --------------------------------- |
| 1   | idx_job_applications_user_id  | user_id           | false  | Index theo user                   |
| 2   | idx_job_applications_cv_id    | cv_id             | false  | Index theo CV                     |
| 3   | idx_job_applications_job_id   | job_id            | false  | Index theo job                    |
| 4   | idx_job_applications_status   | status            | false  | Index theo status                 |
| 5   | idx_job_applications_user_job | (user_id, job_id) | true   | Chỉ 1 đơn/user/job (khi chưa xóa) |

---

## 📂 career_categories - Bảng danh mục nghề nghiệp

| STT | Column      | Type         | Constraint       | Description        |
| --- | ----------- | ------------ | ---------------- | ------------------ |
| 1   | id          | UUID         | PK               | ID danh mục        |
| 2   | name        | VARCHAR(255) | NOT NULL         | Tên danh mục       |
| 3   | slug        | VARCHAR(255) | UNIQUE           | Slug URL           |
| 4   | description | TEXT         | NULL             | Mô tả              |
| 5   | status      | ENUM         | DEFAULT 'ACTIVE' | ACTIVE, INACTIVE   |
| 6   | created_at  | TIMESTAMP    | NOT NULL         | Thời gian tạo      |
| 7   | updated_at  | TIMESTAMP    | NOT NULL         | Thời gian cập nhật |
| 8   | deleted_at  | TIMESTAMP    | NULL             | Soft delete        |

### Indexes

| STT | Index                        | Columns | Unique | Description  |
| --- | ---------------------------- | ------- | ------ | ------------ |
| 1   | idx_career_categories_status | status  | false  | Index status |
| 2   | idx_career_categories_name   | name    | false  | Index name   |
| 3   | idx_career_categories_slug   | slug    | true   | unique slug  |

---

## 🔐 refresh_tokens - Bảng lưu refresh token

| STT | Column      | Type         | Constraint | Description         |
| --- | ----------- | ------------ | ---------- | ------------------- |
| 1   | id          | UUID         | PK         | ID token            |
| 2   | user_id     | UUID         | NOT NULL   | FK -> users(id)     |
| 3   | token_hash  | VARCHAR(255) | NOT NULL   | Hash token (sha256) |
| 4   | expires_at  | TIMESTAMP    | NOT NULL   | Hết hạn             |
| 5   | device_info | VARCHAR(500) | NULL       | Device info         |
| 6   | created_at  | TIMESTAMP    | NOT NULL   | Thời gian tạo       |

### Indexes

| STT | Index                   | Columns    | Unique | Description  |
| --- | ----------------------- | ---------- | ------ | ------------ |
| 1   | idx_refresh_tokens_user | user_id    | false  | User tokens  |
| 2   | idx_refresh_tokens_hash | token_hash | true   | unique token |

---

## 🔢 otp_codes - Bảng lưu mã OTP

| STT | Column     | Type         | Constraint | Description               |
| --- | ---------- | ------------ | ---------- | ------------------------- |
| 1   | id         | UUID         | PK         | ID OTP                    |
| 2   | email      | VARCHAR(255) | NOT NULL   | Email                     |
| 3   | code       | VARCHAR(10)  | NOT NULL   | Mã OTP                    |
| 4   | type       | ENUM         | NOT NULL   | REGISTER, FORGOT_PASSWORD |
| 5   | expires_at | TIMESTAMP    | NOT NULL   | Hết hạn                   |
| 6   | attempts   | INT          | DEFAULT 0  | Số lần thử                |
| 7   | created_at | TIMESTAMP    | NOT NULL   | Thời gian tạo             |

### Indexes

| STT | Index               | Columns | Unique | Description  |
| --- | ------------------- | ------- | ------ | ------------ |
| 1   | idx_otp_codes_email | email   | false  | Lookup email |

---

## 🔑 password_reset_tokens - Bảng lưu token quên mật khẩu

| STT | Column     | Type         | Constraint | Description        |
| --- | ---------- | ------------ | ---------- | ------------------ |
| 1   | id         | UUID         | PK         | ID token           |
| 2   | user_id    | UUID         | NOT NULL   | FK -> users(id)    |
| 3   | sign_key   | VARCHAR(255) | NOT NULL   | Sign key (encrypt) |
| 4   | expires_at | TIMESTAMP    | NOT NULL   | Hết hạn            |
| 5   | used_at    | TIMESTAMP    | NULL       | Đã dùng            |
| 6   | created_at | TIMESTAMP    | NOT NULL   | Thời gian tạo      |

### Indexes

| STT | Index                          | Columns | Unique | Description |
| --- | ------------------------------ | ------- | ------ | ----------- |
| 1   | idx_password_reset_tokens_user | user_id | false  | User tokens |

---

## 📝 registration_sessions - Bảng lưu session đăng ký tạm

| STT | Column     | Type         | Constraint | Description           |
| --- | ---------- | ------------ | ---------- | --------------------- |
| 1   | id         | UUID         | PK         | ID session            |
| 2   | email      | VARCHAR(255) | NOT NULL   | Email                 |
| 3   | password   | VARCHAR(255) | NOT NULL   | Password (hash)       |
| 4   | role       | ENUM         | NOT NULL   | JOB_SEEKER, RECRUITER |
| 5   | sign_key   | VARCHAR(255) | NOT NULL   | Sign key (encrypt)    |
| 6   | expires_at | TIMESTAMP    | NOT NULL   | Hết hạn               |
| 7   | created_at | TIMESTAMP    | NOT NULL   | Thời gian tạo         |

### Indexes

| STT | Index                           | Columns | Unique | Description  |
| --- | ------------------------------- | ------- | ------ | ------------ |
| 1   | idx_registration_sessions_email | email   | false  | Lookup email |

---

## 📦 outbox_events - Bảng outbox cho event-driven

| STT | Column       | Type         | Constraint        | Description                |
| --- | ------------ | ------------ | ----------------- | -------------------------- |
| 1   | id           | UUID         | PK                | ID event                   |
| 2   | type         | VARCHAR(100) | NOT NULL          | Event type                 |
| 3   | payload      | JSONB        | NOT NULL          | Event payload              |
| 4   | status       | ENUM         | DEFAULT 'PENDING' | PENDING, PROCESSED, FAILED |
| 5   | retry_count  | INT          | DEFAULT 0         | Số lần retry               |
| 6   | created_at   | TIMESTAMP    | NOT NULL          | Thời gian tạo              |
| 7   | processed_at | TIMESTAMP    | NULL              | Đã xử lý                   |

### Indexes

| STT | Index                    | Columns | Unique | Description    |
| --- | ------------------------ | ------- | ------ | -------------- |
| 1   | idx_outbox_events_type   | type    | false  | Type lookup    |
| 2   | idx_outbox_events_status | status  | false  | Pending events |

---

## 🔄 Redis Keys Structure

| STT | Key Pattern              | Type   | TTL    | Description         |
| --- | ------------------------ | ------ | ------ | ------------------- |
| 1   | job:list:{filter}        | JSON   | 5-10m  | Job list cache      |
| 2   | job:detail:{id}          | JSON   | 10-30m | Job detail cache    |
| 3   | cv:preview:{id}          | JSON   | 30m    | CV metadata cache   |
| 4   | rt:cache:{token_hash}    | JSON   | 7d     | Refresh token cache |
| 5   | otp:cache:{email}:{type} | JSON   | 5m     | OTP cache           |
| 6   | lock:account:{userId}    | STRING | 15m    | Account lock        |
| 7   | rate:otp:{email}         | INT    | 1h     | OTP rate limit      |
| 8   | rate:login:{ip}          | INT    | 15m    | Login rate limit    |

---

## Media schema update - pending generated migration

### companies

| STT | Column     | Type | Constraint | Description |
| --- | ---------- | ---- | ---------- | ----------- |
| 1   | logo_key   | TEXT | NULL       | Object key logo public trong MinIO |
| 2   | banner_key | TEXT | NULL       | Object key banner public trong MinIO |

### user_profiles

| STT | Column     | Type | Constraint | Description |
| --- | ---------- | ---- | ---------- | ----------- |
| 1   | avatar_key | TEXT | NULL       | Object key avatar public trong MinIO |

### Migration note

- Chua tao migration thu cong.
- Sau khi review entity, chay lenh generate migration de them cac cot tren.
- Cac cot `logo_url` va `avatar_url` cu van duoc giu de fallback du lieu cu.

---

## Private upload storage convention - no schema migration

### Reused columns

| STT | Table         | Column     | Type | Constraint | Description |
| --- | ------------- | ---------- | ---- | ---------- | ----------- |
| 1   | cvs           | file_url   | TEXT | NULL       | Object key CV trong bucket `MINIO_S3_BUCKET_CV` |
| 2   | user_profiles | avatar_url | TEXT | NULL       | Object key avatar trong bucket `MINIO_S3_BUCKET_AVATAR`; URL external cu van fallback |
| 3   | companies     | logo_url   | TEXT | NULL       | Object key logo trong bucket `MINIO_S3_BUCKET_LOGO`; URL external cu van fallback |
| 4   | companies     | banner_url | TEXT | NULL       | Object key banner trong bucket `MINIO_S3_BUCKET_BANNER`; URL external cu van fallback |

### Redis keys

| STT | Key Pattern                  | Type | TTL | Description |
| --- | ---------------------------- | ---- | --- | ----------- |
| 1   | rate:upload:{type}:{userId}  | INT  | 60s | Rate limit upload 5 lan/phut theo user va type |

### Cleanup flow

- Cron chay moi ngay luc nua dem bang `@nestjs/schedule`.
- Scan 4 bucket private: CV, avatar, logo, banner.
- Xoa object neu `lastModified` cu hon 24h va khong duoc reference trong cac cot reused columns ben tren.
- Khong co thay doi schema nen khong tao migration.
