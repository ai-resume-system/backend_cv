import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IResponseApiAdminRecentActivityDto } from 'src/application/dtos/admin-analytics/res.admin-analytics.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

const RECENT_ACTIVITY_LIMIT = 20;

@Injectable()
export class GetAdminRecentActivitiesQuery extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetAdminRecentActivitiesQuery.name));
  }

  async execute(): Promise<IResponseApiAdminRecentActivityDto> {
    return this.runSafe('[Get Admin Recent Activities]:', async () => {
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.ADMIN_ANALYTICS_RECENT_ACTIVITIES,
      );
      const cacheKey = `${CACHE_KEYS.ADMIN_ANALYTICS_RECENT_ACTIVITIES}:v${version}`;
      const cached =
        await this.redis.safeGetJson<IResponseApiAdminRecentActivityDto>(
          cacheKey,
        );
      if (cached) {
        return cached;
      }

      const [recentUsers, recentJobs, recentReviewedJobs, recentApplications] =
        await Promise.all([
          this.userRepository.getRecentRegisteredUsers(RECENT_ACTIVITY_LIMIT),
          this.jobRepository.getRecentCreatedJobs(RECENT_ACTIVITY_LIMIT),
          this.jobRepository.getRecentReviewedJobs(RECENT_ACTIVITY_LIMIT),
          this.jobApplicationRepository.getRecentApplications(
            RECENT_ACTIVITY_LIMIT,
          ),
        ]);

      const applicationJobIds = [
        ...new Set(recentApplications.map((item) => item.jobId)),
      ];
      const jobs = await this.jobRepository.findByIds(applicationJobIds);
      const jobMap = new Map(jobs.map((job) => [job.id, job]));

      const activities = [
        ...recentUsers.map((item) => ({
          id: `user-${item.id}`,
          type: 'user_registered' as const,
          title: 'Người dùng mới đăng ký',
          description: `${item.email} vừa đăng ký tài khoản ${this.getRoleLabel(item.role)}.`,
          occurredAt: item.createdAt,
          metadata: { role: item.role },
        })),
        ...recentJobs.map((item) => ({
          id: `job-created-${item.id}`,
          type: 'job_created' as const,
          title: 'Tin tuyển dụng mới được tạo',
          description: `${item.title} vừa được tạo trong hệ thống quản trị.`,
          occurredAt: item.createdAt,
          metadata: { status: item.status },
        })),
        ...recentReviewedJobs.map((item) => ({
          id: `job-reviewed-${item.id}-${item.updatedAt.toISOString()}`,
          type: 'job_reviewed' as const,
          title: this.getReviewedJobTitle(item.status),
          description: this.getReviewedJobDescription(item.title, item.status),
          occurredAt: item.updatedAt,
          metadata: { status: item.status },
        })),
        ...recentApplications.map((item) => ({
          id: `application-${item.id}`,
          type: 'application_created' as const,
          title: 'Ứng viên mới vừa ứng tuyển',
          description: `${item.fullName} vừa apply vào ${jobMap.get(item.jobId)?.title || 'một tin tuyển dụng'}.`,
          occurredAt: item.createdAt,
          metadata: { jobId: item.jobId },
        })),
      ]
        .sort(
          (left, right) =>
            right.occurredAt.getTime() - left.occurredAt.getTime(),
        )
        .slice(0, RECENT_ACTIVITY_LIMIT);

      const response = { data: activities };
      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DEGRADED);
      return response;
    });
  }

  private getReviewedJobTitle(status: string): string {
    switch (status) {
      case EJobStatus.OPEN:
        return 'Tin tuyển dụng vừa được duyệt';
      case EJobStatus.REJECTED:
        return 'Tin tuyển dụng vừa bị từ chối';
      case EJobStatus.CLOSED:
        return 'Tin tuyển dụng vừa được đóng';
      case EJobStatus.EXPIRED:
        return 'Tin tuyển dụng vừa hết hạn';
      default:
        return 'Trạng thái tin tuyển dụng vừa thay đổi';
    }
  }

  private getReviewedJobDescription(title: string, status: string): string {
    switch (status) {
      case EJobStatus.OPEN:
        return `${title} đã chuyển trạng thái sang mở.`;
      case EJobStatus.REJECTED:
        return `${title} đã chuyển trạng thái sang từ chối.`;
      case EJobStatus.CLOSED:
        return `${title} đã chuyển trạng thái sang đã đóng.`;
      case EJobStatus.EXPIRED:
        return `${title} đã chuyển trạng thái sang hết hạn.`;
      default:
        return `${title} đã chuyển trạng thái.`;
    }
  }

  private getRoleLabel(role: EUserRole): string {
    switch (role) {
      case EUserRole.ADMIN:
        return 'quản trị viên';
      case EUserRole.RECRUITER:
        return 'nhà tuyển dụng';
      case EUserRole.JOB_SEEKER:
      default:
        return 'người tìm việc';
    }
  }
}
