# AGENTS HISTORY — Recruitment & AI CV System

# Rule quy định ghi file AGENTS_HISTORY.md

- Hiển thị theo thứ tự ngày cái gì thực hiện gần nhất ghi ở trên
- Hiển thị phân theo module thay đổi những gì, sau khi thay đổi thì đẫ sửa được lỗi hay fix gì
- Danh sách các list API tác động

# 2026-05-12 - Upload Chung Private Cho CV Avatar Logo Banner

## Upload Module

- Tao API `POST /uploads` de upload chung CV, avatar, logo, banner vao cac bucket private MinIO.
- `type=CV` upload file va tao record CV ngay, title lay tu ten file, `fileExtension` lay tu validate file.
- `type=AVATAR|LOGO|BANNER` upload anh va tra `objectKey`, `previewUrl` presigned de FE preview truoc khi luu account.
- Validate file: CV chi chap nhan pdf/doc/docx, anh chi chap nhan jpg/jpeg/png/webp, gioi han 5MB.
- Rate limit upload theo user va type: 5 lan/phut qua Redis key `rate:upload:{type}:{userId}`.

## CV Module

- Go endpoint upload CV cu `POST /cvs`; CV moi duoc tao qua `POST /uploads` voi `type=CV`.
- `PATCH /cvs/:id` chi cap nhat metadata title/status, khong thay file.
- Download CV tiep tuc dung presigned URL va filename lay theo title moi nhat.

## Account Module

- Profile/company co the luu object key vao `avatarUrl`, `logoUrl`, `bannerUrl`.
- API get/update account convert object key thanh presigned URL de hien thi duoc file trong bucket private.
- URL external cu van duoc fallback tra nguyen, khong ep presign.

## Infrastructure

- Mo rong S3 storage list object va presigned preview cho 4 bucket.
- Them cleanup cron moi ngay de xoa object cu hon 24h khong duoc reference trong DB.
- Khong thay doi schema DB, khong tao migration.

### API Endpoints

| Method | Path     | Auth       | Mo ta                        |
| ------ | -------- | ---------- | ---------------------------- |
| POST   | /uploads | USER       | Upload CV/avatar/logo/banner |
| PATCH  | /cvs/:id | JOB_SEEKER | Cap nhat metadata CV         |

# 2026-05-11 - Filter Jobs By Career Category Slug

## Jobs Module

- Them query param `careerCategorySlug` cho API lay danh sach jobs.
- `GetJobsQuery` resolve slug qua `ICareerCategoryRepository.findBySlug()` de lay UUID category truoc khi filter jobs.
- Cache key danh sach jobs duoc normalize theo `careerCategoryId` da resolve, khong phu thuoc slug raw.
- Khong tao endpoint moi, khong thay doi schema DB.

### API Endpoints

| Method | Path  | Auth   | Mo ta                                       |
| ------ | ----- | ------ | ------------------------------------------- |
| GET    | /jobs | PUBLIC | Loc jobs bang `careerCategorySlug` optional |

# 2026-05-09 - Media Upload Avatar Logo Banner

## Media Module

- Tao API upload media public rieng cho `AVATAR`, `LOGO`, `BANNER`.
- Upload yeu cau JWT, validate anh va gioi han 5MB.
- Upload tra ve `key`, `url`, `type`; DB luu key, URL chi dung de preview/response.

## Account Module

- Them field `avatarKey` cho profile.
- Them field `logoKey`, `bannerKey` cho company.
- Response build `avatarUrl`, `logoUrl`, `bannerUrl` tu key moi va fallback URL cu neu chua co key.

## Infrastructure

- Them bucket type `BANNER` vao `S3StorageService`.
- Them entity column source `avatar_key`, `logo_key`, `banner_key`.
- Khong tao migration; migration se duoc generate bang lenh rieng.

### API Endpoints

| Method | Path                | Auth       | Mo ta                            |
| ------ | ------------------- | ---------- | -------------------------------- |
| POST   | /media/upload       | USER       | Upload avatar/logo/banner        |
| PATCH  | /account/me/profile | JOB_SEEKER | Cap nhat profile bang avatarKey  |
| PATCH  | /account/me/company | RECRUITER  | Cap nhat company bang media keys |

# 2026-05-09 - Rename Module Job Application

## Refactor

- Doi ten toan bo feature ung tuyen tu `application` sang `job-application`.
- Doi domain entity/repository, application DTO/use-case/query, presentation module/controller/DTO, TypeORM entity/repository va enum sang `JobApplication`.
- Doi bang tao moi trong migration hien co tu `applications` sang `job_applications`.
- Khong tao migration rename moi va khong chay migration.

### API Endpoints

| Method | Path                                          | Auth       | Mo ta               |
| ------ | --------------------------------------------- | ---------- | ------------------- |
| POST   | /job-application                              | JOB_SEEKER | Ung tuyen           |
| GET    | /job-application/me                           | JOB_SEEKER | Lich su ung tuyen   |
| GET    | /job-application/:id                          | USER       | Chi tiet don        |
| DELETE | /job-application/:id                          | JOB_SEEKER | Rut don             |
| GET    | /job-application/job-application/jobs/:jobId/job-application  | RECRUITER  | Danh sach ung vien  |
| PATCH  | /job-application/:id/status                   | RECRUITER  | Cap nhat trang thai |

# 2026-05-05 - Module Job Application (Ứng tuyển công việc)

## Tạo mới

### Entity Layer

- **File mới:** `src/domain/entities/job-application.entity.ts` - Cập nhật interface với schedule fields
- **File mới:** `src/infrastructure/database/entities/job-application.orm-entity.ts` - ORM Entity với relationships

### Repository Layer

- **File mới:** `src/domain/repositories/job-application.repository.interface.ts` - Cập nhật interface thêm findActiveByCvId, updateStatus
- **File mới:** `src/infrastructure/database/repositories/job-application.typeorm-repository.ts` - Repository implementation

### Application Layer (DTOs)

- **File mới:** `src/application/dtos/job-application/res.job-application.dto.ts` - Interface DTOs

### Use Cases

- **File mới:** `src/application/use-cases/job-application/create-job-application.usecase.ts` - Tạo đơn ứng tuyển
- **File mới:** `src/application/use-cases/job-application/withdraw-job-application.usecase.ts` - Rút đơn
- **File mới:** `src/application/use-cases/job-application/update-job-application-status.usecase.ts` - Cập nhật trạng thái

### Query Layer

- **File mới:** `src/application/queries/job-application/get-my-job-applications.query.ts` - Query lịch sử ứng tuyển
- **File mới:** `src/application/queries/job-application/get-job-applications-by-job.query.ts` - Query ds ứng viên

### Presentation Layer

- **File mới:** `src/presentation/job-application/controller/job-application.controller.ts` - Controller
- **File mới:** `src/presentation/job-application/dtos/req.job-application.dto.ts` - Request DTOs + class-validator
- **File mới:** `src/presentation/job-application/dtos/res.job-application.dto.ts` - Response DTOs + Swagger

### Error Codes

- **File mới:** `src/common/constants/error-codes.constants.ts` - Thêm error codes 2400-2410

### Migration

- **File mới:** `src/infrastructure/database/migrations/1700000000000-CreateJobApplicationsTable.sql`

### API Endpoints

| Method | Path                      | Auth       | Mô tả               |
| ------ | ------------------------- | ---------- | ------------------- |
| POST   | /job-application             | JOB_SEEKER | Ứng tuyển           |
| GET    | /job-application/me          | JOB_SEEKER | Lịch sử ứng tuyển   |
| GET    | /job-application/:id         | USER       | Chi tiết đơn        |
| DELETE | /job-application/:id         | JOB_SEEKER | Rút đơn             |
| GET    | /job-application/jobs/:jobId/job-application | RECRUITER  | Danh sách ứng viên  |
| PATCH  | /job-application/:id/status  | RECRUITER  | Cập nhật trạng thái |
