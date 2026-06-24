# Backend CV - AI Resume System

`backend_cv` là backend chính của hệ thống tuyển dụng và phân tích CV bằng AI. Source này cung cấp API cho frontend người tìm việc, frontend nhà tuyển dụng, trang quản trị CMS và kết nối với `ai_service` để phân tích nội dung CV.

## Liên Kết Source

Khi chạy hoặc kiểm tra từng phần của hệ thống, mở đúng source tương ứng:

- Backend API: [ai-resume-system/backend_cv](https://github.com/ai-resume-system/backend_cv)
- Frontend cho nhà tuyển dụng và người tìm việc: [ai-resume-system/frontend_cv](https://github.com/ai-resume-system/frontend_cv)
- Frontend quản trị admin: [ai-resume-system/cms_frontend_cv](https://github.com/ai-resume-system/cms_frontend_cv)

## Mục Tiêu

- Quản lý người dùng theo vai trò: `admin`, `job_seeker`, `recruiter`.
- Quản lý tài khoản, hồ sơ cá nhân, thông tin công ty và media liên quan.
- Quản lý CV, upload file CV, preview/download CV và phân tích CV bằng AI.
- Quản lý danh mục nghề nghiệp, kỹ năng, tin tuyển dụng và kỹ năng yêu cầu của job.
- Hỗ trợ ứng tuyển, quản lý trạng thái ứng tuyển, lịch phỏng vấn và gửi email thông báo.
- Tính điểm phù hợp giữa CV và công việc để phục vụ hiển thị AI Match.
- Cung cấp API thống kê cho dashboard quản trị.

## Kiến Trúc Hiện Tại

Backend được xây dựng bằng NestJS theo định hướng Clean Architecture, kết hợp cách tổ chức module của NestJS. Kiến trúc chưa hoàn toàn "sạch" tuyệt đối, nhưng đã tách tương đối rõ các lớp trách nhiệm:

- `domain`: định nghĩa entity nghiệp vụ và repository interface.
- `application`: chứa use case, query, DTO ứng dụng và điều phối nghiệp vụ.
- `infrastructure`: triển khai database, repository TypeORM, Redis, queue, mail, storage, AI client.
- `presentation`: controller, DTO request/response và module API.
- `common`: guard, interceptor, exception, constants, helper và utility dùng chung.

Luồng tổng quát:

```txt
Controller -> UseCase/Query -> Repository Interface -> TypeORM Repository -> PostgreSQL
                         -> Redis / Queue / Mail / MinIO / AI Service
```

## Công Nghệ Sử Dụng

- Node.js, TypeScript
- NestJS
- TypeORM
- PostgreSQL
- Redis
- BullMQ
- MinIO/S3-compatible storage
- Nodemailer
- Swagger
- Docker Compose cho hạ tầng local

## Yêu Cầu Cài Đặt

- Node.js 20+ khuyến nghị
- npm
- Docker Desktop hoặc Docker Engine
- PostgreSQL, Redis, MinIO nếu không dùng Docker Compose
- `ai_service` chạy ở port `8001` nếu cần phân tích CV bằng AI

## Cấu Hình Môi Trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Các biến quan trọng:

```env
IP_ADDRESS=localhost
WEB_PORT=3000
WEB_ENV=development
CORS_ALLOWED_ORIGINS=

JWT_SECRET=your-secret
JWT_ACCESS_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=ai_resume_system_db

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY_ID=admin
MINIO_SECRET_ACCESS_KEY=admin123
MINIO_S3_BUCKET_CV=cv
MINIO_S3_BUCKET_LOGO=company-logos
MINIO_S3_BUCKET_AVATAR=avatars
MINIO_S3_BUCKET_BANNER=company-banners

AI_SERVICE_BASE_URL=http://localhost:8001
AI_SERVICE_TIMEOUT_MS=60000
AI_SERVICE_API_KEY=internal-shared-secret
```

Lưu ý: `AI_SERVICE_API_KEY` phải trùng với biến cùng tên bên `ai_service`.

## Chạy Hạ Tầng Local

Từ thư mục gốc project:

```bash
cd docker
docker compose -f docker-compose.postgres.yml up -d
```

File compose hiện chạy:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO API: `localhost:9000`
- MinIO Console: `localhost:9001`

## Cài Dependency

```bash
cd backend_cv
npm install
```

## Migration Và Seed

Chạy migration:

```bash
npm run migration:run
```

Chạy seed dữ liệu dev:

```bash
npm run seed:dev
```

Không tự chạy migration nếu bạn chỉ đang đọc source hoặc sửa tài liệu.

## Chạy Development

```bash
npm run start:dev
```

API mặc định:

```txt
http://localhost:3000/api/v1
```

Swagger:

```txt
http://localhost:3000/api/docs
```

Port thực tế phụ thuộc `WEB_PORT` trong `.env`.

## Lệnh Hữu Ích

```bash
npm run build
npm run start
npm run start:prod
npm run test
npm run test:e2e
npm run test:cov
npm run lint
```

## Luồng Chạy Toàn Hệ Thống

1. Chạy PostgreSQL, Redis, MinIO bằng Docker Compose.
2. Chạy `ai_service` ở port `8001`.
3. Chạy `backend_cv`.
4. Chạy `frontend_cv` cho job seeker/recruiter.
5. Chạy `cms_frontend_cv` cho admin.

## Ghi Chú Vận Hành

- Backend dùng global prefix `/api` và version URI `/v1`, nên endpoint có dạng `/api/v1/...`.
- Redis dùng cho cache, auth cache và queue.
- BullMQ dùng Redis để xử lý tác vụ bất đồng bộ như parse/phân tích CV.
- MinIO dùng để lưu CV, avatar, logo và banner.
- `job_matches` lưu kết quả AI Match theo cặp CV-job; Redis chỉ cache response phụ trợ.
- Nếu frontend bị lỗi CORS, kiểm tra `CORS_ALLOWED_ORIGINS` hoặc `WEB_ENV`.
