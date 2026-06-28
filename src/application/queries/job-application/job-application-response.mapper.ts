import type {
  IApplicationCVResponse,
  IApplicationJobResponse,
  IApplicationUserResponse,
  IJobSeekerJobApplicationDto,
  IRecruiterJobApplicationDto,
} from 'src/application/dtos/job-application/res.job-application.dto';
import type { IJobApplicationEntity } from 'src/domain/entities/job-application.entity';

type BaseOptions = {
  cv?: IApplicationCVResponse;
  job?: IApplicationJobResponse;
};

export function toJobSeekerJobApplicationDto(
  application: IJobApplicationEntity,
  options: BaseOptions = {},
): IJobSeekerJobApplicationDto {
  return {
    id: application.id,
    cvId: application.cvId,
    userId: application.userId,
    jobId: application.jobId,
    fullName: application.fullName,
    contactEmail: application.contactEmail,
    contactPhone: application.contactPhone,
    coverLetter: application.coverLetter,
    matchingScore: application.matchingScore,
    status: application.status,
    interviewType: application.interviewType,
    interviewStatus: application.interviewStatus,
    interviewNotes: application.interviewNotes,
    onboardingNotes: application.onboardingNotes,
    rejectionReason: application.rejectionReason,
    scheduleTime: application.scheduleTime,
    scheduleLocation: application.scheduleLocation,
    scheduleLink: application.scheduleLink,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    deletedAt: application.deletedAt,
    cv: options.cv,
    job: options.job,
  };
}

type RecruiterOptions = BaseOptions & {
  user?: IApplicationUserResponse;
};

export function toRecruiterJobApplicationDto(
  application: IJobApplicationEntity,
  options: RecruiterOptions = {},
): IRecruiterJobApplicationDto {
  return {
    ...toJobSeekerJobApplicationDto(application, options),
    user: options.user,
  };
}
