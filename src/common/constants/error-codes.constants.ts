import { HttpStatus } from '@nestjs/common';

export const ERROR_CODES = {
  // AUTH - REGISTER
  AUTH_EMAIL_ALREADY_EXISTS: {
    message: 'Email already exists',
    status: HttpStatus.CONFLICT,
  },
  AUTH_PHONE_INVALID: {
    message: 'Invalid phone number',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_PASSWORD_WEAK: {
    message: 'Password too weak',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_REGISTER_FAILED: {
    message: 'Registration failed',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // AUTH - OTP / VERIFY
  INVALID_OTP_TYPE: {
    message: 'Invalid OTP type',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_OTP_INVALID: {
    message: 'Invalid or expired OTP',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_OTP_EXPIRED: {
    message: 'OTP has expired',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_ACCOUNT_NOT_FOUND: {
    message: 'Account not found',
    status: HttpStatus.NOT_FOUND,
  },
  AUTH_OTP_LOCKED: {
    message: 'Account locked due OTP failures',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_OTP_RESEND_LIMIT_EXCEEDED: {
    message: 'Too many requests',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
  AUTH_OTP_COOLDOWN: {
    message: 'Please wait 60 seconds',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
  AUTH_USER_UNVERIFIED: {
    message: 'Account is unverified',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_USER_ALREADY_VERIFIED: {
    message: 'Account already verified',
    status: HttpStatus.CONFLICT,
  },
  AUTH_SIGN_KEY_INVALID: {
    message: 'Invalid or expired key',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_ACCOUNT_ROLE_MISMATCH: {
    message: 'Role does not match',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_USER_LOCKED: {
    message: 'Account locked, contact support',
    status: HttpStatus.FORBIDDEN,
  },

  // AUTH - LOGIN
  AUTH_INVALID_CREDENTIALS: {
    message: 'Incorrect email or password',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_USER_INACTIVE: {
    message: 'Account is inactive',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_LOGIN_FAILED: {
    message: 'Login failed',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  AUTH_LOGIN_LOCKED_10M: {
    message: 'Too many failures, try in 10m',
    status: HttpStatus.FORBIDDEN,
  },

  // AUTH - TOKEN
  AUTH_INVALID_TOKEN: {
    message: 'Invalid or expired token',
    status: HttpStatus.UNAUTHORIZED,
  },
  ACCESS_TOKEN_INVALID_OR_EXPIRED: {
    message: 'Invalid or expired access token',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_REFRESH_TOKEN_INVALID_OR_EXPIRED: {
    message: 'Invalid or expired refresh token',
    status: HttpStatus.UNAUTHORIZED,
  },

  // AUTH - PASSWORD
  AUTH_CHANGE_PASSWORD_FAILED: {
    message: 'Password change failed',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  AUTH_OLD_PASSWORD_INCORRECT: {
    message: 'Old password is incorrect',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_NEW_PASSWORD_SAME_AS_OLD: {
    message: 'New password same as old',
    status: HttpStatus.BAD_REQUEST,
  },

  // USER
  USER_NOT_FOUND: {
    message: 'User not found',
    status: HttpStatus.NOT_FOUND,
  },
  USER_ALREADY_EXISTS: {
    message: 'User already exists',
    status: HttpStatus.CONFLICT,
  },
  COMPANY_NOT_FOUND: {
    message: 'Company not found',
    status: HttpStatus.NOT_FOUND,
  },

  INVALID_EMPLOYEE_RANGE: {
    message: 'Invalid employee range',
    status: HttpStatus.BAD_REQUEST,
  },

  // JOB
  JOB_NOT_FOUND: {
    message: 'Job not found',
    status: HttpStatus.NOT_FOUND,
  },
  JOB_ALREADY_EXISTS: {
    message: 'Job already exists',
    status: HttpStatus.CONFLICT,
  },
  JOB_CREATE_FAILED: {
    message: 'Failed to create job',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_UPDATE_FAILED: {
    message: 'Failed to update job',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_DELETE_FAILED: {
    message: 'Failed to delete job',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_INVALID_STATUS_TRANSITION: {
    message: 'Invalid job status transition',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_INVALID_EXPIRED_AT: {
    message: 'Expired date must be future',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_INVALID_SALARY_RANGE: {
    message: 'Invalid salary range',
    status: HttpStatus.BAD_REQUEST,
  },
  // CV
  CV_NOT_FOUND: {
    message: 'CV not found',
    status: HttpStatus.NOT_FOUND,
  },
  CV_ALREADY_EXISTS: {
    message: 'CV already exists',
    status: HttpStatus.CONFLICT,
  },
  CV_CREATE_FAILED: {
    message: 'Failed to create CV',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_UPDATE_FAILED: {
    message: 'Failed to update CV',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_DELETE_FAILED: {
    message: 'Failed to delete CV',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_FILE_TOO_LARGE: {
    message: 'File too large (max 10MB)',
    status: HttpStatus.BAD_REQUEST,
  },
  CV_FILE_TYPE_INVALID: {
    message: 'Invalid file type (PDF/DOCX/DOC)',
    status: HttpStatus.BAD_REQUEST,
  },
  CV_ACCESS_DENIED: {
    message: 'Access denied to CV',
    status: HttpStatus.FORBIDDEN,
  },
  RATE_LIMIT_EXCEEDED: {
    message: 'Rate limit exceeded',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },

  // CV ANALYSIS
  CV_ANALYSIS_ALREADY_PROCESSING_ERROR: {
    message: 'CV analysis already in progress',
    status: HttpStatus.CONFLICT,
  },
  CV_ANALYSIS_FILE_MISSING_ERROR: {
    message: 'CV file is missing',
    status: HttpStatus.BAD_REQUEST,
  },
  CV_ANALYSIS_TRIGGER_FAILED_ERROR: {
    message: 'Failed to start CV analysis',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_ANALYSIS_COOLDOWN_ERROR: {
    message: 'Please wait before analyzing another CV',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
  CV_ANALYSIS_TEMP_FILE_NOT_FOUND: {
    message: 'Temporary CV file not found or expired',
    status: HttpStatus.NOT_FOUND,
  },
  CV_ANALYSIS_PREVIEW_NOT_FOUND: {
    message: 'Temporary CV analysis preview not found or expired',
    status: HttpStatus.NOT_FOUND,
  },
  CV_ANALYSIS_NOT_READY: {
    message: 'CV analysis result is not ready',
    status: HttpStatus.CONFLICT,
  },

  // CAREER CATEGORY
  CAREER_CATEGORY_NOT_FOUND: {
    message: 'Career category not found',
    status: HttpStatus.NOT_FOUND,
  },
  CAREER_CATEGORY_ALREADY_EXISTS: {
    message: 'Career category already exists',
    status: HttpStatus.CONFLICT,
  },
  CAREER_CATEGORY_CREATE_FAILED: {
    message: 'Failed to create career category',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAREER_CATEGORY_UPDATE_FAILED: {
    message: 'Failed to update career category',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAREER_CATEGORY_DELETE_FAILED: {
    message: 'Failed to delete career category',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAREER_CATEGORY_NOT_DELETED: {
    message: 'Career category is not deleted',
    status: HttpStatus.CONFLICT,
  },
  CAREER_CATEGORY_IN_USE: {
    message: 'Category in use, cannot delete',
    status: HttpStatus.CONFLICT,
  },
  CAREER_CATEGORY_RESTORE_FAILED: {
    message: 'Failed to restore career category',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // SKILL
  SKILL_NOT_FOUND: { message: 'Skill not found', status: HttpStatus.NOT_FOUND },
  SKILL_ALREADY_EXISTS: {
    message: 'Skill already exists',
    status: HttpStatus.CONFLICT,
  },
  SKILL_CREATE_FAILED: {
    message: 'Failed to create skill',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  SKILL_UPDATE_FAILED: {
    message: 'Failed to update skill',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  SKILL_DELETE_FAILED: {
    message: 'Failed to delete skill',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  SKILL_NOT_DELETED: {
    message: 'Skill is not deleted',
    status: HttpStatus.CONFLICT,
  },
  SKILL_IN_USE: {
    message: 'Skill in use, cannot delete',
    status: HttpStatus.CONFLICT,
  },
  SKILL_CAREER_CATEGORY_DELETED: {
    message: 'Career category of this skill is deleted',
    status: HttpStatus.CONFLICT,
  },
  SKILL_RESTORE_FAILED: {
    message: 'Failed to restore skill',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // FAVOURITE JOB
  FAVOURITE_JOB_NOT_FOUND: {
    message: 'Favourite job not found',
    status: HttpStatus.NOT_FOUND,
  },
  FAVOURITE_JOB_ALREADY_EXISTS: {
    message: 'Job already in favourites',
    status: HttpStatus.CONFLICT,
  },
  FAVOURITE_JOB_CREATE_FAILED: {
    message: 'Failed to add favourite',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  FAVOURITE_JOB_DELETE_FAILED: {
    message: 'Failed to remove favourite',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // JOB APPLICATION
  JOB_APPLICATION_NOT_FOUND: {
    message: 'Application not found',
    status: HttpStatus.NOT_FOUND,
  },
  JOB_APPLICATION_ALREADY_EXISTS: {
    message: 'Already applied for this job',
    status: HttpStatus.CONFLICT,
  },
  JOB_APPLICATION_CREATE_FAILED: {
    message: 'Failed to apply',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_APPLICATION_UPDATE_FAILED: {
    message: 'Failed to update application',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_APPLICATION_WITHDRAW_FAILED: {
    message: 'Failed to withdraw application',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_APPLICATION_JOB_NOT_OPEN: {
    message: 'Job is not open',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_JOB_EXPIRED: {
    message: 'Application period expired',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_CV_IN_USE: {
    message: 'CV already used elsewhere',
    status: HttpStatus.CONFLICT,
  },
  JOB_APPLICATION_CANNOT_WITHDRAW: {
    message: 'Cannot withdraw application now',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_ACCESS_DENIED: {
    message: 'Access denied to application',
    status: HttpStatus.FORBIDDEN,
  },
  JOB_APPLICATION_INVALID_STATUS_TRANSITION: {
    message: 'Invalid status transition',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_INTERVIEW_SCHEDULE_REQUIRED: {
    message: 'Interview schedule required',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_INTERVIEW_TYPE_REQUIRED: {
    message: 'Interview type required',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_INTERVIEW_LOCATION_OR_LINK_REQUIRED: {
    message: 'Interview location or link required',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_REJECTION_REASON_REQUIRED: {
    message: 'Rejection reason required',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_ONBOARDING_NOTES_REQUIRED: {
    message: 'Onboarding notes required',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_INTERVIEW_STATUS_NOT_UPDATABLE: {
    message: 'Interview status cannot be updated',
    status: HttpStatus.BAD_REQUEST,
  },

  // MEDIA / ROLE
  MEDIA_FILE_REQUIRED: {
    message: 'File cannot be empty',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_FILE_TOO_LARGE: {
    message: 'File too large (max 5MB)',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_FILE_TYPE_INVALID: {
    message: 'Invalid file type',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_TYPE_INVALID: {
    message: 'Invalid media type',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_UPLOAD_FAILED: {
    message: 'Upload failed',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  ROLE_UNABLE_TO_DETERMINE: {
    message: 'Cannot determine permissions',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  ROLE_INSUFFICIENT_PERMISSIONS: {
    message: 'Insufficient permissions',
    status: HttpStatus.FORBIDDEN,
  },

  // SYSTEM
  INVALID_UUID: {
    message: 'Invalid UUID',
    status: HttpStatus.BAD_REQUEST,
  },
  IP_NOT_FOUND: {
    message: 'IP address not found',
    status: HttpStatus.NOT_FOUND,
  },
  INTERNAL_SERVER_ERROR: {
    message: 'Internal server error',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  VALIDATION_ERROR: {
    message: 'Invalid input data',
    status: HttpStatus.BAD_REQUEST,
  },
  SYSTEM_BUSY: {
    message: 'System busy, try again later',
    status: HttpStatus.SERVICE_UNAVAILABLE,
  },
} as const;
