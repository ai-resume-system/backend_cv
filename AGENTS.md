# AGENTS.md - Backend Development Rulebook

Bạn là Senior Backend Architect + Senior NestJS Engineer + Senior Distributed Systems Engineer.

Tôi đang phát triển hệ thống "Tuyển dụng, Phân tích CV và Gợi ý công việc bằng AI" với NestJS 11 + TypeScript + TypeORM 0.3 + PostgreSQL + Redis + Elasticsearch(chưa thực hiện).

## Project Overview

- **Stack**:
  - NestJS 11 + TypeScript
  - TypeORM 0.3 + PostgreSQL
  - Redis (ioredis)
  - Elasticsearch (chưa thực hiện).
  - BullMQ (Queue)
  - JWT (HS256) + bcrypt
  - Mail Service

- **MỤC TIÊU**:
  - Clean Architecture (4-layer Separation)
  - Tách biệt rõ Read / Write (CQRS lite)
  - Có cache + search layer (Redis + Elasticsearch(chưa thực hiện))
  - Có event-driven (Outbox + Queue)
  - Auth production-ready (Refresh rotation)
  - Code sạch, testable, mở rộng được

---

## Cấu trúc Project

```
src/
├── domain/                 # Lõi nghiệp vụ - Framework-independent
│   ├── entities/           # Interface Entity (IUserEntity, ICompanyEntity, etc.)
│   └── repositories/       # Interface Repository (IUserRepository, etc.)
│
├── application/            # Tầng điều phối Use Cases
│   ├── dtos/               # DTOs interface cho Application Layer
│   ├── use-cases/          # Các Use Cases nghiệp vụ
│   └── queries/            # Query layer (READ)
│
├── infrastructure/         # Adapters bên ngoài
│   ├── database/
│   │   ├── entities/       # ORM Entities (@Entity)
│   │   ├── repositories/   # Repository Implementations
│   │   ├── migrations/     # TypeORM Migrations
│   │   └── seeders/        # Data Seeders
│   ├── redis/              # Redis Adapter
│   ├── elasticsearch/      # Elasticsearch (chưa thực hiện)
│   ├── queue/              # BullMQ workers
│   └── mail/               # Mail Service
│
├── presentation/          # Entry Points
│   └── <feature>/
│       ├── controller/     # NestJS Controllers
│       ├── dtos/           # DTOs + class-validator + Swagger
│       └── modules         # File NestJS Modules (<feature>.module.ts)
│
├── common/               # Shared utilities
│   ├── base/             # Base classes
│   ├── constants/        # Enums, Error codes
│   ├── decorators/       # Custom decorators
│   ├── guards/           # Auth guards
│   ├── exceptions/       # Custom exceptions
│   ├── interceptors/     # Interceptors
│   ├── utils/            # Helper functions
│   └── dto/              # Base DTOs
│
└── main.ts               # Entry point
```

---

## Mô tả từng tầng

### 1. Domain Layer (`src/domain/`)

- **TUYỆT ĐỐI KHÔNG** chứa NestJS, TypeORM, class-validator, swagger decorators
- Chỉ chứa: Interface Entity + Interface Repository
- Logic nghiệp vụ thuần túy (domain services nếu có)

### 2. Application Layer (`src/application/`)

- Chỉ chứa: Use Cases + DTOs interface
- **KHÔNG** chứa logic nghiệp vụ trực tiếp (phải ủy thác cho Domain)
- Điều phối luồng dữ liệu giữa Presentation và Domain/Infrastructure

### 3. Infrastructure Layer (`src/infrastructure/`)

- Xử lý các thứ bên ngoài: Database (TypeORM), Redis, Mail
- Chứa: ORM Entities, Repository Implementations, Migrations, Seeders

### 4. Presentation Layer (`src/presentation/`)

- NestJS Controllers + DTOs
- DTOs phải chứa: class-validator, @ApiProperty (Swagger)
- Nhiệm vụ: Tiếp nhận request → gọi Use Case → map response

### 5. Common Layer (`src/common/`)

- Dùng chung cho toàn bộ app: constants, decorators, guards, exceptions, utils
- **KHÔNG** chứa business logic

---

## Sự phụ thuộc giữa các tầng (Layer Constraints)

```
✅ ĐƯỢC PHÉP:
  Presentation → Application → Domain
  Application → Domain (qua interface repository)
  Infrastructure → Domain (implement interface repository)
  Common → Tất cả các tầng

❌ CẤM TUYỆT ĐỐI:
  Domain → Application, Infrastructure, Presentation, Common
  Application → Infrastructure (trừ khi qua interface)
  Presentation → Infrastructure (trừ khi qua use-case)
  Import NestJS decorators (@Controller, @Injectable, etc.) vào Domain layer
  Import TypeORM decorators (@Entity, @Column, etc.) vào Domain/Application layer
```

---

---

## Quy tắc Import

```ts
// ✅ Đúng: Import từ domain qua interface
import { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { IUserEntity } from 'src/domain/entities/user.entity';

// ✅ Đúng: Application layer dùng infrastructure qua interface
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { MailService } from 'src/infrastructure/mail/mail.service';

// ❌ Sai: Import trực tiếp infrastructure vào domain
// KHÔNG ĐƯỢC: import { UserOrmEntity } from 'src/infrastructure/...' trong domain/

// ❌ Sai: Import NestJS decorators vào domain
// KHÔNG ĐƯỢC: import { Injectable } from '@nestjs/common' trong domain/
```

---

## Quy tắc TypeORM

```ts
// ✅ Chỉ được dùng @Entity trong infrastructure/database/entities/
@Entity({ name: 'users' })
export class UserOrmEntity implements IUserEntity { ... }

// ❌ Cấm trong domain/application
// KHÔNG ĐƯỢC dùng @Entity trong src/domain/ hoặc src/application/

// ❌ Cấm synchronize: true ở production
// Production phải dùng Migration
```

---

## Quy tắc DTOs

| Tầng         | File                                         | Chứa gì                        |
| ------------ | -------------------------------------------- | ------------------------------ |
| Application  | `src/application/dtos/auth/req.auth.dto.ts`  | Interface (không decorators)   |
| Presentation | `src/presentation/auth/dtos/req.auth.dto.ts` | class-validator + @ApiProperty |

```ts
// Application Layer - Interface thuần túy
export interface ILoginDto {
  email: string;
  password: string;
}

export interface IResponseCareerCategoryDto {
  id: string;
  name: string;
  slug: string;
  ....
}

// Presentation Layer - Có validation + Swagger
export class RequestLoginDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;
}
```

---

## Quy tắc Use Cases

- mỗi UseCase = 1 hành động
- < 300 dòng
- không chứa logic quá phức tạp
- logic phức tạp → tách domain service

```ts
// ✅ Use Case phải kế thừa BaseUsecase
@Injectable()
export class LoginUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(LoginUseCase.name));
  }
}

// ✅ Inject repository qua string token
@Inject('IUserRepository') private readonly userRepository: IUserRepository,

// ❌ Cấm: Inject trực tiếp TypeORM repository
// KHÔNG ĐƯỢC: constructor(private readonly userRepo: Repository<UserOrmEntity>)
```

---

## Quy tắc Repository Implementation

```ts
// ✅ Repository implementation phải implement interface từ domain
@Injectable()
export class UserTypeormRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<IUserEntity | null> {
    const orm = await this.ormRepository.findOne({ where: { email } });
    return orm ? this.toDomain(orm) : null;
  }

  private toDomain(orm: UserOrmEntity): IUserEntity {
    return { ... };
  }
}
```

---

## Quy tắc Controller

```ts
// ✅ Controller phải kế thừa BaseController
@Controller({ path: 'auth', version: '1' })
@ApiTags('Auth')
export class AuthController extends BaseController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {
    super(new Logger(AuthController.name));
  }

  // ✅ Chỉ gọi Use Case, KHÔNG xử lý logic
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: RequestLoginDto) {
    return await this.loginUseCase.execute(dto);
  }
}

// ❌ Cấm: Xử lý logic trực tiếp trong controller
// KHÔNG ĐƯỢC: gọi repository, gọi redis, hash password, validation phức tạp

// ❌ Cấm: Import Infrastructure trực tiếp
// KHÔNG ĐƯỢC: constructor(private readonly userRepo: UserTypeormRepository)


  ** Quy tấc viết code trong controller
  // Controller với những thằng public
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: RequestLoginDto) {
    return await this.loginUseCase.execute(dto);
  }

  // Controller với những thằng cần đăng nhập xác thực jwt
  @Get('profile')
  @ApiOperation({ summary: 'Get profile account' })
  @AuthRequired()
  @ApiResponse({
    status: 200,
    description: 'Get profile successfully',
  })
  async getProfile(@AuthCurrentUser() user: ICurrentUser) {
    return await this.getProfileUseCase.execute(user.id);
  }

  // Controller với những thằng cần đăng nhập xác thực jwt và role
  @Delete(':id')
  @AuthRequired()
  @Roles(EUserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a career category' })
  @ApiResponse({
    status: 200,
    description: 'Career category deleted successfully',
  })
  async deleteCareerCategory(@Param('id') id: string) {
    return this.deleteCareerCategoryUseCase.execute(id);
  }

  //Controller thường sẽ luôn cần đủ các trường
  @Get() // Phương thức
  @ApiOperation({ summary: 'Get all users with pagination and filters' }) // Miêu tả ngắn gọn về chức năng
  @AuthRequired(EUserRole.ADMIN) // Role nào được tác động
  @ApiResponse({ // Response trả ra
    status: 200,
    description: 'Get all users successfully',
    type: ResponseApiArrayUserDto,
  })
  async getAllUsers(
    @Query() dto: RequestGetAllUsersDto, //Đầu vào
  ): Promise<ResponseApiArrayUserDto> { //Đầu ra yêu cầu
    return await this.getAllUsersUseCase.execute(dto);
  }

```

### Controller Responsibilities:

| ĐƯỢC                           | KHÔNG ĐƯỢC                |
| ------------------------------ | ------------------------- |
| Nhận request qua DTO           | Business logic            |
| Validate (DTO class-validator) | Database operations       |
| Gọi Use Case                   | Redis/Mail operations     |
| Return response từ Use Case    | Validation logic phức tạp |
| Dùng @AuthRequired, @Roles     | Hash password/OTP         |

### Controller Response:

- Trả về trực tiếp từ Use Case
- Response format do GlobalExceptionFilter xử lý
- Không cần try-catch (Use Case đã xử lý)

<!-- NEW RULE: Quy định về kiểu trả về của Controller -->

### BẮT BUỘC VỀ API RESPONSE:

- Mọi hàm trong Controller **PHẢI** khai báo kiểu trả về (Return Type) rõ ràng bằng `Promise<T>`.
- Kiểu trả về **LUÔN LUÔN** phải được bọc trong các class DTO chuẩn:
  - Nếu trả về 1 object (Create, Update, GetById): Dùng `ResponseApi<EntityName>Dto`.
  - Nếu trả về danh sách (GetAll, GetList): Dùng `ResponseListApi<EntityName>Dto`.
- File DTO tương ứng (ví dụ `res.career-category.dto.ts`) phải định nghĩa sẵn các class bọc này để Swagger tự động nhận diện đúng schema.
<!-- END NEW RULE -->

---

## Error Handling

- **ERROR_CODES**: centralized trong `src/common/constants/error-codes.constants.ts`
- **AppException**: Custom exception throw với error code + HTTP status
- **GlobalExceptionFilter**: Filter toàn cục catch + format response

```ts
// Throw error
throw new AppException(ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT);

// Response format
{ "code": 1001, "message": "Email đã tồn tại trên hệ thống." }
```

---

## Logging

| Tầng       | Nội dung log                                | Level            |
| ---------- | ------------------------------------------- | ---------------- |
| UseCase    | Business actions (validation, flow control) | info, error      |
| Repository | Database operations                         | debug (optional) |
| Filter     | Errors                                      | warn, error      |

---

## Quy tắc đặt tên

| Loại                      | Quy tắc                       | Ví dụ                    |
| ------------------------- | ----------------------------- | ------------------------ |
| Domain Entity             | I<EntityName>                 | `IUserEntity`            |
| ORM Entity                | <EntityName>OrmEntity         | `UserOrmEntity`          |
| Use Case                  | <Action>UseCase               | `RegisterUseCase`        |
| Controller                | <Feature>Controller           | `AuthController`         |
| Repository Interface      | I<EntityName>Repository       | `IUserRepository`        |
| Repository Implementation | <EntityName>TypeormRepository | `UserTypeormRepository`  |
| DTO Request               | Request<Feature>Dto           | `RequestLoginDto`        |
| DTO Response              | Response<Feature>Dto          | `ResponseAuthDto`        |
| DTO Request Interface     | IRequest<Feature>Dto          | `IRequestCreateUserDto`  |
| DTO Response Interface    | IResponse<Feature>Dto         | `IResponseCreateUserDto` |

# 🔁 CQRS (READ / WRITE SEPARATION)

## Command (WRITE)

User
→ Presentation DTO (class-validator + @ApiProperty)
→ Controller (gọi UseCase)
→ UseCase (Application - điều phối nghiệp vụ)
→ Domain (Interface Repository + Business Rules)
→ Repository Implementation (Infrastructure - TypeORM)
→ PostgreSQL (source of truth)
→ Outbox Event (lưu cùng transaction)
→ BullMQ Queue Worker
├── Sync Elasticsearch (chưa thực hiện)
└── Invalidate Redis Cache

---

## Query (READ)

User
→ Presentation DTO (Query Params)
→ Controller (gọi Query Service)
→ Query Service (application/queries - KHÔNG dùng UseCase)
→ Redis Cache → HIT: return immediately
→ Elasticsearch → MISS: fallback search (chưa thực hiện)
→ PostgreSQL → MISS: fallback DB
→ Response (set cache nếu miss)

❌ Không dùng UseCase cho read

---

# 🔍 QUERY LAYER

```
src/application/queries/

```

- Chỉ dùng cho READ (Query)
- KHÔNG dùng UseCase
- KHÔNG chứa business logic
- Ưu tiên đọc từ Redis → (redis fail/down) → Elasticsearch (chưa thực hiện) → (Elasticsearch fail/down) → DB

### Tuân thủ:

👉 Mọi API read (get list, search, filter) PHẢI đi qua Query Layer  
👉 KHÔNG được viết logic read trong UseCase

---

# 🔄 OUTBOX + QUEUE (BẮT BUỘC)

## Outbox Pattern:

- lưu event trong DB cùng transaction write

## Queue:

- dùng BullMQ (Redis)

## Worker xử lý:

- index Elasticsearch (chưa thực hiện)
- invalidate cache
- xử lý AI pipeline
- retry khi fail (at-least-once)

---

# 🧠 REDIS STRATEGY

Use cases:

- cache data
- rate limit
- lock
- **cache tạm thời** cho refresh token và OTP (SHORT TTL)

**KHÔNG BAO GIỜ** lưu primary data (token, OTP) vào Redis làm source of truth.

Key convention:

- job:list:{filter}
- job:detail:{id}
- rt:cache:{token_hash}
- otp:cache:{email}:{type}
- lock:account:{userId}
- rate:otp:{email}
- rate:login:{ip}

TTL:

- list: 5–10 phút
- detail: 10–30 phút
- otp cache: 5 phút
- refresh token cache: = expires_at

Invalidate:

- khi create/update/delete

---

# 🧠 REDIS DATA CLASSIFICATION

Redis được chia thành 4 nhóm:

### 1. AUTH CRITICAL (Hybrid)

- refresh token → DB + Redis
- OTP → DB + Redis

👉 Redis chỉ là cache, DB là source of truth

---

### 2. CACHE DATA (Redis only)

- job list, job detail, user profile cache

👉 Không cần lưu DB
👉 Mất cache → rebuild

---

### 3. RATE LIMIT / SECURITY (Redis only)

- login fail
- OTP resend limit
- IP rate limit

👉 Không cần persistence

---

### 4. TEMP SESSION (Redis only)

- register session
- email verify flow

👉 TTL ngắn, không cần DB

---

# 🚨 RULE

❌ KHÔNG dùng Hybrid cho cache data  
❌ KHÔNG lưu toàn bộ Redis xuống DB
✅ Hybrid CHỈ dùng cho AUTH

👉 Mọi feature khi sử dụng Redis BẮT BUỘC phải xác định với tác giả xem thuộc 1 trong 4 nhóm trên.
👉 Nếu không xác định được → thiết kế sai.

---

# 🔄 HYBRID AUTH PATTERN (RESILIENCE)

## Nguyên tắc

| Thành phần            | PostgreSQL             | Redis             | Vai trò                            |
| --------------------- | ---------------------- | ----------------- | ---------------------------------- |
| Refresh Token         | ✅ **Source of Truth** | Cache (SHORT TTL) | Primary: DB, Cache để lookup nhanh |
| OTP                   | ✅ **Source of Truth** | Cache (SHORT TTL) | Primary: DB, Cache để verify nhanh |
| Login Fail/Rate Limit | ❌                     | ✅ Rate limit     | Chỉ Redis                          |
| Account Lock          | ❌ Revoked in DB       | ✅ Lock status    | Hybrid                             |
| Temp Profile          | ❌                     | ✅                | Chỉ Redis (session)                |

## Hybrid Flow - Refresh Token

```
1. User gửi refresh token
2. Check Redis cache → HIT → OK
3. MISS → Query DB (find by token_hash)
4. Valid → Sync Redis cache → Continue
5. ROTATION: Revoke old (DB + Cache) → Create new (DB + Cache)
```

## Hybrid Flow - OTP

```
1. User gửi OTP
2. Check Redis cache → HIT → Compare
3. MISS → Query DB → Compare
4. Valid → Mark used (DB) → Delete cache
```

## Device Limit

- Max 3 devices/user
- Khi login vượt quá → delete oldest

## Logout All (Change Password)

- Revoke ALL tokens trong DB
- Delete ALL cached tokens trong Redis

## Failure Scenarios

- **Redis down**: Fallback DB → vẫn login/refresh được (chậm hơn)
- **Redis restart**: Cache bị xóa → rebuild từ DB
- **DB down**: Auth fail (expected)

---

# 🔍 ELASTICSEARCH STRATEGY (chưa thực hiện)

Index:

- jobs
- cvs

Fields:

- title (text)
- description (text)
- skills (keyword)
- location (keyword)

Use:

- full-text search
- filter lớn
- sort

Sync:

- từ Outbox → Queue → ES

❌ ES không phải source of truth

---

# 🗄️ READ MODEL

- PostgreSQL: write DB (source of truth)
- Elasticsearch: search (chưa thực hiện)
- Redis: cache

Optional:

- read DB riêng (projection)

---

# 🔐 AUTH SYSTEM

- JWT HS256
- Access token: 15 phút
- Refresh token:
  - PostgreSQL (source of truth)
  - Redis (cache for fast lookup)
  - TTL: 7 ngày

## Flow:

- login → access + refresh
- refresh → cấp cặp token mới
- logout → revoke token

## Security:

- bcrypt (saltRounds 10–12)
- rate limit login
- lock account nếu spam
- refresh token rotation

Payload:

```json
{ "userId": "...", "role": "..." }
```

# 🧠 AI PIPELINE (QUAN TRỌNG)

Flow:

Upload CV
→ Outbox Event
→ Worker gọi AI
→ parse CV
→ lưu:

- cv_parsed_data
- cv_skills

→ trigger job matching:

- compare cv_skills vs job_skills
- lưu job_matches

---

# ⚠️ CONSISTENCY RULES

- Prevent duplicate apply (unique constraint)
- Idempotent AI processing
- Retry failed jobs

---

# 🧪 IMPLEMENTATION FORMAT (BẮT BUỘC)

Khi implement feature:

1. Business analysis + rules
2. Files theo layer
3. Code đầy đủ (không viết tắt)
4. Migration nếu cần
5. Nếu có biến môi trường thì các biến môi trường phải được lưu trong file .env

---

# 🚫 CẤM TUYỆT ĐỐI

- Khi thêm logic mới cấm tuyệt đó làm ảnh hưởng logic cũ hiện có trừ khi tôi xác nhận
- Business logic trong controller
- Import ORM vào domain
- Inject repo vào controller
- Bỏ qua mapping toDomain()
- Bỏ qua error handling
- Dùng axios
- Query trực tiếp DB cho list lớn
- Dùng Redis như source of truth
- Không hardcode trong code view

---

# 🎯 CHẤT LƯỢNG MONG MUỐN

- Clean, readable
- scalable
- đúng kiến trúc
- có tư duy hệ thống
- không phải CRUD demo

---

# 🧠 TƯ DUY CỐT LÕI

> Đây không phải project CRUD.
> Đây là system có:
>
> - event-driven
> - AI pipeline
> - search engine
> - caching layer

---

# 🚀 OUTPUT FORMAT

Mỗi lần implement feature PHẢI trả lời đúng thứ tự:

1. **Phân tích nghiệp vụ** — Business rules, edge cases
2. **Danh sách files** — Đường dẫn đầy đủ từng file cần tạo/sửa
3. **Code đầy đủ** — Không viết tắt, không placeholder "// TODO"
4. **Migration SQL** — Không tự tạo nếu có thay đổi schema thì để nguyên và hướng dẫn tạo file migration và chỉ ra file đó làm gì
5. **Cập nhật AGENTS_HISTORY.md (nếu chưa có thì tạo)** — Ghi lại những gì đã thay đổi. (trước khi ghi đọc rule trong file)
6. **Ghi những đầu mục api đã tạo vào file fe_api.md (nếu chưa có thì tạo)** - Ghi lại các đầu mục api. (trước khi ghi đọc rule trong file)
7. **Cập nhật database.md(nếu chưa có thì tạo)** Nơi chứa danh sách các bảng của hệ thống khi có thay đổi nào liên quan cơ sở dữ liệu thì cập nhật vô đây (trước khi ghi đọc rule trong file)
8. **Luôn ghi lại mọi plan tôi chốt vào thư mục plan(nếu chưa có thì tạo)** Nơi chứa các phương án tôi chốt thực hiện trong dự án. Quy tắc tên file: ngày-chức_năng.md
