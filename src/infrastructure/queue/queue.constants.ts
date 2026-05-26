export const CV_PARSE_QUEUE = 'cv.parse';
export const CACHE_INVALIDATE_QUEUE = 'cache.invalidate';
export const STORAGE_DELETE_QUEUE = 'storage.delete';
export const JOB_APPLICATION_STATUS_EMAIL_QUEUE = 'job-application.status-email';
export const CV_PARSE_DLQ = 'cv.parse.dlq';
export const CACHE_INVALIDATE_DLQ = 'cache.invalidate.dlq';
export const STORAGE_DELETE_DLQ = 'storage.delete.dlq';
export const JOB_APPLICATION_STATUS_EMAIL_DLQ =
  'job-application.status-email.dlq';

export interface ICvParseJob {
  cvId: string;
  fileKey: string;
  extension: 'pdf' | 'docx' | 'doc';
}

export interface ICacheInvalidateJob {
  keys?: string[];
  prefixes?: string[];
}

export interface IStorageDeleteJob {
  bucketType: 'cv' | 'company_logo' | 'avatar' | 'banner';
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
  status: 'INTERVIEW' | 'REJECTED' | 'OFFERED';
  jobTitle: string;
  companyName?: string;
  scheduleTime?: string;
  scheduleLocation?: string;
  scheduleLink?: string;
}
