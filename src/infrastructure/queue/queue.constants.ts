import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { EBucketType } from 'src/common/constants/enum/upload.enum';

export const CV_PARSE_QUEUE = 'cv.parse';
export const CACHE_INVALIDATE_QUEUE = 'cache.invalidate';
export const STORAGE_DELETE_QUEUE = 'storage.delete';
export const JOB_APPLICATION_STATUS_EMAIL_QUEUE =
  'job-application.status-email';
export const CV_PARSE_DLQ = 'cv.parse.dlq';
export const CACHE_INVALIDATE_DLQ = 'cache.invalidate.dlq';
export const STORAGE_DELETE_DLQ = 'storage.delete.dlq';
export const JOB_APPLICATION_STATUS_EMAIL_DLQ =
  'job-application.status-email.dlq';

export interface ICvParseJob {
  cvId: string;
  parsedDataId: string;
  fileKey: string;
  extension: 'pdf' | 'docx' | 'doc';
  requestedProvider?: 'gemini' | 'openai' | 'groq';
}

export interface ICacheInvalidateJob {
  keys?: string[];
  prefixes?: string[];
}

export interface IStorageDeleteJob {
  bucketType:
    | EBucketType.CV
    | EBucketType.COMPANY_LOGO
    | EBucketType.AVATAR
    | EBucketType.BANNER;
  objectKey: string;
  reason:
    | 'cv.deleted'
    | 'cv.replaced'
    | 'storage.cleanup'
    | 'avatar.deleted'
    | 'company.logo.deleted'
    | 'company.banner.deleted';
  aggregateId: string;
}

export interface IJobApplicationStatusEmailJob {
  aggregateId: string;
  applicationId: string;
  to: string;
  fullName?: string;
  status:
    | EJobApplicationStatus.INTERVIEW
    | EJobApplicationStatus.REJECTED
    | EJobApplicationStatus.OFFERED;
  jobTitle: string;
  name?: string;
  scheduleTime?: string;
  scheduleLocation?: string;
  scheduleLink?: string;
}
