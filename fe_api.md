# Frontend API Documentation — Recruitment & AI CV System

# Rule quy định ghi file fe_api.md để fe có thể lấy và nối trực tiếp vào view

- Hiển thị các api theo module
- Hiên thi list các enum trước tiên
- Hiển thị các api theo dạng bảng gồm: STT, Chức năng api, Method, Path, Auth(người được tác động), Request DTO, Response DTO
- Khi có API mới thì kiểm tra nó thuộc module nào nếu chưa có thì tạo
- Hiển thị đầy đủ dto request đầu vào, kết quả response các trường trả ra, thông báo khi thành công hoặc khi có lỗi

---

# Danh sách các api

## 🔐 Auth Module - Xác thực

### Enums

| STT | Enum        | Giá trị    | Mô tả          |
| --- | ----------- | ---------- | -------------- |
| 1   | EUserRole   | admin      | Quản trị viên  |
| 2   | EUserRole   | job_seeker | Ứng viên       |
| 3   | EUserRole   | recruiter  | Nhà tuyển dụng |
| 4   | EUserStatus | active     | Hoạt động      |
| 5   | EUserStatus | unverified | Chưa xác thực  |
| 6   | EUserStatus | locked     | Bị khóa        |

### APIs

| STT | Chức năng              | Method | Path                      | Auth   | Request DTO                     | Response DTO                        |
| --- | ---------------------- | ------ | ------------------------- | ------ | ------------------------------- | ----------------------------------- |
| 1   | Đăng ký ứng viên       | POST   | /auth/register/job-seeker | PUBLIC | { email, password, phone? }     | { message: string }                 |
| 2   | Đăng ký nhà tuyển dụng | POST   | /auth/register/recruiter  | PUBLIC | { email, password, phone? }     | { message: string }                 |
| 3   | Gửi OTP                | POST   | /auth/send-otp            | PUBLIC | { email, type }                 | { message: string }                 |
| 4   | Xác thực OTP           | POST   | /auth/verify-otp          | PUBLIC | { email, code, signKey? }       | { signKey?: string, message }       |
| 5   | Đăng nhập              | POST   | /auth/login               | PUBLIC | { email, password }             | { accessToken, refreshToken, user } |
| 6   | Làm mới token          | POST   | /auth/refresh-token       | PUBLIC | { refreshToken }                | { accessToken, refreshToken }       |
| 7   | Quên mật khẩu          | POST   | /auth/forgot-password     | PUBLIC | { email, newPassword, signKey } | { message: string }                 |
| 8   | Đăng xuất              | POST   | /auth/logout              | AUTH   | -                               | { message: string }                 |

### Request/Response DTOs

#### POST /api/v1/auth/register/job-seeker

**Request:**

```json
{
  "email": "user@example.com",
  "password": "123456",
  "phone": "0123456789"
}
```

**Response (201):**

```json
{
  "message": "Đăng ký thành công. Vui lòng xác thực OTP."
}
```

#### POST /api/v1/auth/register/recruiter

**Request:**

```json
{
  "email": "recruiter@example.com",
  "password": "123456",
  "phone": "0123456789"
}
```

**Response (201):**

```json
{
  "message": "Đăng ký thành công. Vui lòng xác thực OTP."
}
```

#### POST /api/v1/auth/send-otp

**Request:**

```json
{
  "email": "user@example.com",
  "type": "register" // hoặc "forgot_password"
}
```

**Response (200):**

```json
{
  "message": "OTP đã được gửi đến email của bạn."
}
```

#### POST /api/v1/auth/verify-otp

**Request:**

```json
{
  "email": "user@example.com",
  "code": "123456",
  "signKey": "string (optional)" // dùng khi verify forgot_password
}
```

**Response (200):**

```json
{
  "signKey": "encrypted_key_here",
  "message": "Xác thực thành công."
}
```

#### POST /api/v1/auth/login

**Request:**

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "job_seeker",
    "status": "active"
  }
}
```

#### POST /api/v1/auth/refresh-token

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/v1/auth/forgot-password

**Request:**

```json
{
  "email": "user@example.com",
  "newPassword": "new123456",
  "signKey": "encrypted_key_from_verify_otp"
}
```

**Response (201):**

```json
{
  "message": "Mật khẩu đã được đặt lại."
}
```

#### POST /api/v1/auth/logout

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**

```json
{
  "message": "Đăng xuất thành công."
}
```

### Error Codes

| STT | Code | Message                                                 |
| --- | ---- | ------------------------------------------------------- |
| 1   | 1001 | Email đã tồn tại trên hệ thống.                         |
| 2   | 1002 | Email chưa được xác thực.                               |
| 3   | 1003 | Mật khẩu không đúng.                                    |
| 4   | 1004 | Tài khoản bị khóa. Liên hệ admin để biết thêm chi tiết. |
| 5   | 1005 | Mã OTP không hợp lệ hoặc đã hết hạn.                    |
| 6   | 1006 | Quá nhiều yêu cầu. Thử lại sau.                         |
| 7   | 1007 | Refresh token không hợp lệ hoặc đã hết hạn.             |

---

## 👤 Users Module - Quản lý người dùng (Admin)

### APIs

| STT | Chức năng           | Method | Path              | Auth  | Request DTO                       | Response DTO                 |
| --- | ------------------- | ------ | ----------------- | ----- | --------------------------------- | ---------------------------- |
| 1   | Lấy danh sách user  | GET    | /users            | ADMIN | { page?, limit?, role?, status? } | { data: User[], pagination } |
| 2   | Lấy user theo ID    | GET    | /users/:id        | ADMIN | -                                 | { data: User }               |
| 3   | Cập nhật trạng thái | PATCH  | /users/:id/status | ADMIN | { status }                        | { data: User }               |

### Request/Response DTOs

#### GET /api/v1/users

**Query Params:**

```ts
{
  page?: number,      // mặc định: 1
  limit?: number,    // mặc định: 10
  role?: 'admin' | 'job_seeker' | 'recruiter',
  status?: 'active' | 'unverified' | 'locked'
}
```

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "phone": "0123456789",
      "role": "job_seeker",
      "status": "active",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /api/v1/users/:id

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "0123456789",
    "role": "job_seeker",
    "status": "active",
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

#### PATCH /api/v1/users/:id/status

**Request:**

```json
{
  "status": "locked" // hoặc "active"
}
```

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "0123456789",
    "role": "job_seeker",
    "status": "locked",
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

---

## 👤 Account Module - Tài khoản cá nhân

### APIs

| STT | Chức năng           | Method | Path                        | Auth       | Request DTO                                                                | Response DTO        |
| --- | ------------------- | ------ | --------------------------- | ---------- | -------------------------------------------------------------------------- | ------------------- |
| 1   | Lấy profile của tôi | GET    | /account/me                 | AUTH       | -                                                                          | { data: Profile }   |
| 2   | Cập nhật profile    | PATCH  | /account/me/profile         | JOB_SEEKER | { fullName?, bio?, avatarUrl? }                                            | { data: Profile }   |
| 3   | Cập nhật công ty    | PATCH  | /account/me/company         | RECRUITER  | { companyName?, logoUrl?, location?, description?, taxCode?, websiteUrl? } | { data: Company }   |
| 4   | Đổi mật khẩu        | PATCH  | /account/me/change-password | AUTH       | { currentPassword, newPassword }                                           | { message: string } |

### Request/Response DTOs

#### GET /api/v1/account/me

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "0123456789",
    "role": "job_seeker",
    "status": "active",
    "profile": {
      "id": "uuid",
      "userId": "uuid",
      "fullName": "Nguyen Van A",
      "avatarUrl": "https://...",
      "bio": "Hello"
    },
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

#### PATCH /api/v1/account/me/profile

**Request:**

```json
{
  "fullName": "Nguyen Van A",
  "bio": "Developer with 3 years experience",
  "avatarUrl": "https://s3 bucket url"
}
```

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "Nguyen Van A",
    "avatarUrl": "https://...",
    "bio": "Developer with 3 years experience"
  }
}
```

#### PATCH /api/v1/account/me/company

**Request:**

```json
{
  "companyName": "Tech Company",
  "logoUrl": "https://...",
  "location": "Ho Chi Minh City",
  "description": "We are a tech company",
  "taxCode": "0123456789",
  "websiteUrl": "https://techcompany.com"
}
```

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "companyName": "Tech Company",
    "logoUrl": "https://...",
    "location": "Ho Chi Minh City",
    "description": "We are a tech company",
    "taxCode": "0123456789",
    "websiteUrl": "https://techcompany.com"
  }
}
```

#### PATCH /api/v1/account/me/change-password

**Request:**

```json
{
  "currentPassword": "123456",
  "newPassword": "new123456"
}
```

**Response (200):**

```json
{
  "message": "Mật khẩu đã được đổi."
}
```

---

## 💼 Jobs Module - Tin tuyển dụng

### Enums

| STT | Enum       | Giá trị    | Mô tả               |
| --- | ---------- | ---------- | ------------------- |
| 1   | EJobStatus | pending    | Chờ duyệt           |
| 2   | EJobStatus | open       | Đã duyệt (đăng bài) |
| 3   | EJobStatus | closed     | Đã đóng             |
| 4   | EJobStatus | rejected   | Bị từ chối          |
| 5   | EJobStatus | expired    | Hết hạn             |
| 6   | EJobType   | full_time  | Toàn thời gian      |
| 7   | EJobType   | part_time  | Bán thời gian       |
| 8   | EJobType   | internship | Thực tập            |
| 9   | EJobType   | contract   | Hợp đồng            |

### APIs

| STT | Chức năng                    | Method | Path              | Auth            | Request DTO                                                                                                                              | Response DTO                                    |
| --- | ---------------------------- | ------ | ----------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | Tìm tin tuyển dụng công khai | GET    | /jobs             | PUBLIC          | { page?, limit?, careerCategoryId?, careerCategorySlug?, location?, jobType?, salaryMin?, salaryMax?, search? }                                               | { data: Job[], pagination }                     |
| 2   | Tin tuyển dụng của tôi       | GET    | /jobs/my          | RECRUITER       | { page?, limit?, status? }                                                                                                               | { data: Job[], pagination }                     |
| 3   | Tất cả tin (Admin)           | GET    | /jobs/admin       | ADMIN           | { page?, limit?, status? }                                                                                                               | { data: Job[], pagination }                     |
| 4   | Chi tiết tin tuyển dụng      | GET    | /jobs/:id         | PUBLIC          | -                                                                                                                                        | { data: Job }                                   |
| 5   | Tạo tin tuyển dụng           | POST   | /jobs             | RECRUITER       | { title, description?, shortDescription?, location?, salaryMin?, salaryMax?, experienceYears?, jobType?, careerCategoryId?, expiredAt? } | { data: Job }                                   |
| 6   | Cập nhật tin tuyển dụng      | PATCH  | /jobs/:id         | RECRUITER       | { title, description?, shortDescription?, location?, salaryMin?, salaryMax?, experienceYears?, jobType?, careerCategoryId?, expiredAt? } | { data: Job }                                   |
| 7   | Xóa tin tuyển dụng           | DELETE | /jobs/:id         | RECRUITER       | -                                                                                                                                        | { data: { success: boolean, message: string } } |
| 8   | Duyệt tin                    | PATCH  | /jobs/:id/approve | ADMIN           | -                                                                                                                                        | { data: Job }                                   |
| 9   | Từ chối tin                  | PATCH  | /jobs/:id/reject  | ADMIN           | { reason }                                                                                                                               | { data: Job }                                   |
| 10  | Đóng tin                     | PATCH  | /jobs/:id/close   | ADMIN/RECRUITER | -                                                                                                                                        | { data: Job }                                   |

### Request/Response DTOs

#### GET /api/v1/jobs

**Query Params:**

```ts
{
  page?: number,           // mặc định: 1
  limit?: number,         // mặc định: 10
  careerCategoryId?: uuid,
  careerCategorySlug?: string, // vi du: "y-te"
  location?: string,
  jobType?: 'full_time' | 'part_time' | 'internship' | 'contract',
  salaryMin?: number,
  salaryMax?: number,
  search?: string
}
```

**Filter by career category slug:**

```http
GET /api/v1/jobs?careerCategorySlug=y-te&page=1&limit=10
```

**Error:**

- `CAREER_CATEGORY_NOT_FOUND` neu `careerCategorySlug` khong ton tai.

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "title": "Frontend Developer",
      "shortDescription": "We are hiring",
      "description": "Full job description",
      "location": "Ho Chi Minh City",
      "salaryMin": 1000,
      "salaryMax": 2000,
      "experienceYears": 2,
      "jobType": "full_time",
      "status": "open",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### GET /api/v1/jobs/:id

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "companyId": "uuid",
    "title": "Frontend Developer",
    "shortDescription": "We are hiring",
    "description": "Full job description",
    "location": "Ho Chi Minh City",
    "salaryMin": 1000,
    "salaryMax": 2000,
    "experienceYears": 2,
    "jobType": "full_time",
    "status": "open",
    "expiredAt": "2026-06-01T00:00:00Z",
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

#### POST /api/v1/jobs

**Request:**

```json
{
  "title": "Frontend Developer",
  "shortDescription": "We are hiring a frontend developer",
  "description": "Full job description...",
  "location": "Ho Chi Minh City",
  "salaryMin": 1000,
  "salaryMax": 2000,
  "experienceYears": 2,
  "jobType": "full_time",
  "careerCategoryId": "uuid (optional)",
  "expiredAt": "2026-06-01T00:00:00Z"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "uuid",
    "companyId": "uuid",
    "title": "Frontend Developer",
    "status": "pending",
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

#### PATCH /api/v1/jobs/:id/approve

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "status": "open"
  }
}
```

#### PATCH /api/v1/jobs/:id/reject

**Request:**

```json
{
  "reason": "Job description is too short"
}
```

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "status": "rejected",
    "rejectReason": "Job description is too short"
  }
}
```

---

## 📄 CVs Module - Quản lý CV

### Enums

| STT | Enum              | Giá trị    | Mô tả           |
| --- | ----------------- | ---------- | --------------- |
| 1   | ECVStatus         | active     | Hoạt động       |
| 2   | ECVStatus         | inactive   | Không hoạt động |
| 3   | EProcessingStatus | pending    | Chờ xử lý       |
| 4   | EProcessingStatus | processing | Đang xử lý      |
| 5   | EProcessingStatus | completed  | Hoàn thành      |
| 6   | EProcessingStatus | failed     | Thất bại        |

### APIs

| STT | Chức năng                | Method | Path              | Auth       | Request DTO                  | Response DTO                                    |
| --- | ------------------------ | ------ | ----------------- | ---------- | ---------------------------- | ----------------------------------------------- |
| 1   | Lấy danh sách CV của tôi | GET    | /cvs              | JOB_SEEKER | { page?, limit? }            | { data: CV[], pagination }                      |
| 2   | Lấy URL tải CV           | GET    | /cvs/:id/download | JOB_SEEKER | -                            | { downloadUrl: string }                         |
| 3   | Lấy metadata CV          | GET    | /cvs/:id/preview  | JOB_SEEKER | -                            | { data: CV }                                    |
| 4   | Upload CV                | POST   | /cvs              | JOB_SEKER  | multipart: { file, title? }  | { data: CV }                                    |
| 5   | Cập nhật CV/file         | PATCH  | /cvs/:id          | JOB_SEEKER | multipart: { file?, title? } | { data: CV }                                    |
| 6   | Xóa CV                   | DELETE | /cvs/:id          | JOB_SEEKER | -                            | { data: { success: boolean, message: string } } |
| 7   | Đặt CV mặc định          | PATCH  | /cvs/:id/default  | JOB_SEEKER | -                            | { data: CV }                                    |

### Request/Response DTOs

#### GET /api/v1/cvs

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Frontend Developer CV",
      "fileUrl": "https://...",
      "fileExtension": "pdf",
      "processingStatus": "completed",
      "isDefault": true,
      "summary": "AI extracted summary...",
      "status": "active",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

#### GET /api/v1/cvs/:id/download

**Response (200):**

```json
{
  "downloadUrl": "https://s3signedurl..."
}
```

#### GET /api/v1/cvs/:id/preview

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "title": "Frontend Developer CV",
    "fileExtension": "pdf",
    "processingStatus": "completed",
    "isDefault": true,
    "summary": "AI extracted summary...",
    "status": "active",
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

#### POST /api/v1/cvs

**Content-Type:** multipart/form-data

**Body:**

```
file: <file pdf/docx>
title: "Frontend Developer CV" (optional)
```

**Response (201):**

```json
{
  "data": {
    "id": "uuid",
    "title": "Frontend Developer CV",
    "fileUrl": "https://s3...",
    "fileExtension": "pdf",
    "processingStatus": "pending",
    "isDefault": false,
    "status": "active",
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

#### PATCH /api/v1/cvs/:id/default

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "isDefault": true
  }
}
```

---

## 🏢 Job Application Module - Ứng tuyển công việc

### Enums

| STT | Enum                  | Giá trị   | Mô tả                 |
| --- | --------------------- | --------- | --------------------- |
| 1   | EJobApplicationStatus | APPLIED   | Mới ứng tuyển         |
| 2   | EJobApplicationStatus | REVIEWING | HR đang xem           |
| 3   | EJobApplicationStatus | INTERVIEW | Đã lên lịch phỏng vấn |
| 4   | EJobApplicationStatus | REJECTED  | Bị từ chối            |
| 5   | EJobApplicationStatus | OFFERED   | HR gửi offer          |
| 6   | EJobApplicationStatus | ACCEPTED  | Ứng viên nhận việc    |
| 7   | EJobApplicationStatus | WITHDRAWN | Ứng viên rút CV       |

### APIs

| STT | Chức năng                       | Method | Path                                         | Auth       | Request DTO                                                 | Response DTO                           |
| --- | ------------------------------- | ------ | -------------------------------------------- | ---------- | ----------------------------------------------------------- | -------------------------------------- |
| 1   | Ứng tuyển công việc             | POST   | /job-application                             | JOB_SEEKER | { cvId, jobId, notes? }                                     | { data: JobApplication }               |
| 2   | Xem lịch sử ứng tuyển           | GET    | /job-application/me                          | JOB_SEEKER | { page?, limit? }                                           | { data: JobApplication[], pagination } |
| 3   | Xem chi tiết đơn                | GET    | /job-application/:id                         | USER       | -                                                           | { data: JobApplication }               |
| 4   | Rút đơn ứng tuyển               | DELETE | /job-application/:id                         | JOB_SEEKER | -                                                           | { data: JobApplication }               |
| 5   | Xem ds ứng viên (Recruiter)     | GET    | /job-application/jobs/:jobId/job-application | RECRUITER  | { page?, limit? }                                           | { data: JobApplication[], pagination } |
| 6   | Cập nhật trạng thái (Recruiter) | PATCH  | /job-application/:id/status                  | RECRUITER  | { status, scheduleTime?, scheduleLocation?, scheduleLink? } | { data: JobApplication }               |

### Request/Response DTOs

#### POST /api/v1/job-application

**Request:**

```json
{
  "cvId": "uuid",
  "jobId": "uuid",
  "notes": "string (optional)"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "uuid",
    "cvId": "uuid",
    "userId": "uuid",
    "jobId": "uuid",
    "matchingScore": 85.5,
    "notes": "string",
    "status": "APPLIED",
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

#### GET /api/v1/job-application/me

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "cvId": "uuid",
      "jobId": "uuid",
      "status": "APPLIED",
      "createdAt": "2026-05-05T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

#### PATCH /api/v1/job-application/:id/status

**Request:**

```json
{
  "status": "REVIEWING" // hoặc "INTERVIEW", "REJECTED", "OFFERED", "ACCEPTED"
}
```

**Request (với lịch phỏng vấn):**

```json
{
  "status": "INTERVIEW",
  "scheduleTime": "2026-05-10T09:00:00Z",
  "scheduleLocation": "123 ABC Street, District 1",
  "scheduleLink": "https://meet.google.com/..."
}
```

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "status": "INTERVIEW",
    "scheduleTime": "2026-05-10T09:00:00Z",
    "scheduleLocation": "123 ABC Street, District 1",
    "scheduleLink": "https://meet.google.com/..."
  }
}
```

### Error Codes

| STT | Code | Message                                           |
| --- | ---- | ------------------------------------------------- |
| 1   | 2401 | Không tìm thấy đơn ứng tuyển.                     |
| 2   | 2402 | Bạn đã ứng tuyển công việc này rồi.               |
| 3   | 2403 | Ứng tuyển thất bại.                               |
| 4   | 2406 | Công việc này không còn nhận ứng viên.            |
| 5   | 2407 | Công việc này đã hết hạn ứng tuyển.               |
| 6   | 2409 | Không thể rút đơn. Đơn đã được chuyển trạng thái. |

---

## 📂 Career Categories Module - Danh mục nghề nghiệp

### Enums

| STT | Enum                    | Giá trị  | Mô tả           |
| --- | ----------------------- | -------- | --------------- |
| 1   | ECareerCategoriesStatus | active   | Hoạt động       |
| 2   | ECareerCategoriesStatus | inactive | Không hoạt động |

### APIs

| STT | Chức năng              | Method | Path                   | Auth   | Request DTO                    | Response DTO                     |
| --- | ---------------------- | ------ | ---------------------- | ------ | ------------------------------ | -------------------------------- |
| 1   | Lấy danh sách danh mục | GET    | /career-categories     | PUBLIC | { page?, limit?, status? }     | { data: Category[], pagination } |
| 2   | Lấy danh mục theo ID   | GET    | /career-categories/:id | PUBLIC | -                              | { data: Category }               |
| 3   | Tạo danh mục           | POST   | /career-categories     | ADMIN  | { name, slug, description? }   | { data: Category }               |
| 4   | Cập nhật danh mục      | PATCH  | /career-categories/:id | ADMIN  | { name?, slug?, description? } | { data: Category }               |
| 5   | Xóa danh mục           | DELETE | /career-categories/:id | ADMIN  | -                              | { message: string }              |

### Request/Response DTOs

#### GET /api/v1/career-categories

**Query Params:**

```ts
{
  page?: number,
  limit?: number,
  status?: 'active' | 'inactive'
}
```

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Frontend Developer",
      "slug": "frontend-developer",
      "description": "Frontend job category",
      "status": "active",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

#### GET /api/v1/career-categories/:id

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "name": "Frontend Developer",
    "slug": "frontend-developer",
    "description": "Frontend job category",
    "status": "active"
  }
}
```

#### POST /api/v1/career-categories

**Request:**

```json
{
  "name": "Backend Developer",
  "slug": "backend-developer",
  "description": "Backend developer job category"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "uuid",
    "name": "Backend Developer",
    "slug": "backend-developer",
    "description": "Backend developer job category",
    "status": "active"
  }
}
```

#### PATCH /api/v1/career-categories/:id

**Request:**

```json
{
  "name": "Senior Backend Developer",
  "description": "Updated description"
}
```

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "name": "Senior Backend Developer",
    "description": "Updated description"
  }
}
```

#### DELETE /api/v1/career-categories/:id

**Response (200):**

```json
{
  "message": "Danh mục đã được xóa."
}
```

---

## 📊 Error Code Reference

| STT | Module            | Code Range | Description                    |
| --- | ----------------- | ---------- | ------------------------------ |
| 1   | Auth              | 1000-1999  | Authentication & Authorization |
| 2   | Users             | 2000-2099  | User management                |
| 3   | Jobs              | 2100-2199  | Job management                 |
| 4   | CVs               | 2200-2299  | CV management                  |
| 5   | Job Application   | 2300-2399  | Job Application                |
| 6   | Career Categories | 2400-2499  | Career categories              |
| 7   | Common            | 2500-2599  | Common errors                  |

---

## Upload Module - Upload file private chung

### Enums

| STT | Enum        | Gia tri | Mo ta                                |
| --- | ----------- | ------- | ------------------------------------ |
| 1   | EUploadType | CV      | Tai file CV va tao record CV         |
| 2   | EUploadType | AVATAR  | Anh dai dien ung vien                |
| 3   | EUploadType | LOGO    | Logo cong ty                         |
| 4   | EUploadType | BANNER  | Banner cong ty                       |

### APIs

| STT | Chuc nang api                  | Method | Path     | Auth | Request DTO               | Response DTO                          |
| --- | ------------------------------ | ------ | -------- | ---- | ------------------------- | ------------------------------------- |
| 1   | Upload CV/avatar/logo/banner   | POST   | /uploads | AUTH | multipart: { file, type } | Anh: { data: UploadFile }, CV: { data: CV } |

### Request/Response DTOs

#### POST /api/v1/uploads

**Content-Type:** multipart/form-data

**Request:**

```ts
{
  file: File, // CV: pdf/doc/docx, image: jpg/jpeg/png/webp, max 5MB
  type: 'CV' | 'AVATAR' | 'LOGO' | 'BANNER'
}
```

**Response anh (201):**

```json
{
  "data": {
    "type": "AVATAR",
    "bucketType": "avatar",
    "objectKey": "userId/uuid.webp",
    "previewUrl": "https://presigned-url",
    "expiresIn": 900,
    "originalName": "avatar.webp",
    "fileExtension": "webp",
    "mimeType": "image/webp",
    "size": 12345
  }
}
```

**Response CV (201):**

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "Nguyen Van A",
    "fileUrl": "userId/uuid.pdf",
    "fileExtension": "pdf",
    "processingStatus": "pending",
    "isDefault": false,
    "status": "active",
    "createdAt": "2026-05-12T10:00:00Z",
    "updatedAt": "2026-05-12T10:00:00Z"
  }
}
```

**Errors:** 401 unauthorized, 2206 CV file too large, 2207 invalid CV type, 2209 rate limit, 2501 file required, 2502 file too large, 2503 invalid image type, 2504 invalid media type.

---

## Account Module - Media fields update

| STT | Chuc nang api    | Method | Path                | Auth       | Request DTO                                                                            | Response DTO                                          |
| --- | ---------------- | ------ | ------------------- | ---------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Cap nhat profile | PATCH  | /account/me/profile | JOB_SEEKER | { fullName?, bio?, avatarUrl? }                                                        | { fullName?, avatarUrl?, bio? }                       |
| 2   | Cap nhat company | PATCH  | /account/me/company | RECRUITER  | { companyName?, logoUrl?, bannerUrl?, location?, description?, taxCode?, websiteUrl? } | { companyName?, logoUrl?, bannerUrl?, ... }           |

**Quy uoc:** `avatarUrl`, `logoUrl`, `bannerUrl` voi file moi se nhan `objectKey` tu `POST /uploads`. API get/update account se tra ve presigned URL de FE hien thi anh private. URL external cu van duoc tra nguyen.

---

## CVs Module - Upload flow update

| STT | Chuc nang api          | Method | Path              | Auth       | Request DTO            | Response DTO                                    |
| --- | ---------------------- | ------ | ----------------- | ---------- | ---------------------- | ----------------------------------------------- |
| 1   | Tao CV moi             | POST   | /uploads          | JOB_SEEKER | multipart { type: CV, file } | { data: CV }                              |
| 2   | Cap nhat metadata CV   | PATCH  | /cvs/:id          | JOB_SEEKER | { title?, status? }    | { data: CV }                                    |
| 3   | Xoa CV                 | DELETE | /cvs/:id          | JOB_SEEKER | -                      | { data: { success: boolean, message: string } } |

**Ghi chu:** `POST /cvs` multipart upload cu khong con dung. Download CV van dung `GET /cvs/:id/download` va ten file tai ve lay theo title moi nhat.
