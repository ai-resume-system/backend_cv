export const AUTH_CLIENTS = {
  JOBSEEKER: 'job_seeker',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
} as const;

export type AuthClient = (typeof AUTH_CLIENTS)[keyof typeof AUTH_CLIENTS];

export const AUTH_CLIENT_COOKIE_NAMES: Record<AuthClient, string> = {
  [AUTH_CLIENTS.JOBSEEKER]: '__rt_jobseeker',
  [AUTH_CLIENTS.RECRUITER]: '__rt_recruiter',
  [AUTH_CLIENTS.ADMIN]: '__rt_admin',
};

export const AUTH_CLIENT_HEADER = 'x-auth-client';
export const DEFAULT_AUTH_CLIENT: AuthClient = AUTH_CLIENTS.JOBSEEKER;
