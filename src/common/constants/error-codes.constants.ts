import { HttpStatus } from '@nestjs/common';

export const ERROR_CODES = {
  // AUTH - REGISTER
  AUTH_EMAIL_ALREADY_EXISTS: {
    message: 'Email already exists in the system.',
    status: HttpStatus.CONFLICT,
  },
  AUTH_PHONE_INVALID: {
    message: 'Invalid phone number. Format: +84xxxxxxxxx or 0xxxxxxxxx.',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_PASSWORD_WEAK: {
    message:
      'Password must be at least 8 characters long, including uppercase letters, lowercase letters, and numbers.',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_REGISTER_FAILED: {
    message: 'Registration failed.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // AUTH - OTP / VERIFY
  INVALID_OTP_TYPE: {
    message: 'Invalid OTP type.',
    status: HttpStatus.BAD_REQUEST,
  },
  AUTH_OTP_INVALID: {
    message: 'Invalid or expired OTP code.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_OTP_EXPIRED: {
    message: 'OTP code has expired.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_ACCOUNT_NOT_FOUND: {
    message: 'Account does not exist.',
    status: HttpStatus.NOT_FOUND,
  },
  AUTH_OTP_LOCKED: {
    message: 'Account is locked due to too many incorrect OTP attempts.',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_OTP_RESEND_LIMIT_EXCEEDED: {
    message: 'Too many requests. Please try again later.',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
  AUTH_OTP_COOLDOWN: {
    message: 'Please wait 60 seconds before requesting a new OTP.',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
  AUTH_USER_UNVERIFIED: {
    message: 'Account is unverified. Cannot perform this action.',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_USER_ALREADY_VERIFIED: {
    message: 'Account is already verified. Cannot perform this action.',
    status: HttpStatus.CONFLICT,
  },
  AUTH_SIGN_KEY_INVALID: {
    message: 'Invalid or expired signature verification key.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_USER_LOCKED: {
    message:
      'User account has been locked. Cannot perform this action. Please contact support!',
    status: HttpStatus.FORBIDDEN,
  },

  // AUTH - LOGIN
  AUTH_INVALID_CREDENTIALS: {
    message: 'Incorrect email or password.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_USER_INACTIVE: {
    message: 'Account is locked or inactive.',
    status: HttpStatus.FORBIDDEN,
  },
  AUTH_LOGIN_FAILED: {
    message: 'Login failed.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  AUTH_LOGIN_LOCKED_10M: {
    message:
      'Account locked due to too many failed login attempts. Please try again in 10 minutes.',
    status: HttpStatus.FORBIDDEN,
  },

  // AUTH - TOKEN
  AUTH_INVALID_TOKEN: {
    message: 'Invalid or expired token.',
    status: HttpStatus.UNAUTHORIZED,
  },
  ACCESS_TOKEN_INVALID_OR_EXPIRED: {
    message: 'Invalid or expired access token.',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_REFRESH_TOKEN_INVALID_OR_EXPIRED: {
    message: 'Invalid or expired refresh token.',
    status: HttpStatus.UNAUTHORIZED,
  },

  // AUTH - PASSWORD
  AUTH_CHANGE_PASSWORD_FAILED: {
    message: 'Failed to change password.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  AUTH_OLD_PASSWORD_INCORRECT: {
    message: 'Incorrect old password.',
    status: HttpStatus.BAD_REQUEST,
  },

  // USER
  USER_NOT_FOUND: {
    message: 'User not found.',
    status: HttpStatus.NOT_FOUND,
  },
  USER_ALREADY_EXISTS: {
    message: 'User already exists.',
    status: HttpStatus.CONFLICT,
  },
  COMPANY_NOT_FOUND: {
    message: 'Company not found.',
    status: HttpStatus.NOT_FOUND,
  },

  // JOB
  JOB_NOT_FOUND: {
    message: 'Job not found.',
    status: HttpStatus.NOT_FOUND,
  },
  JOB_ALREADY_EXISTS: {
    message: 'Job already exists.',
    status: HttpStatus.CONFLICT,
  },
  JOB_CREATE_FAILED: {
    message: 'Failed to create job.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_UPDATE_FAILED: {
    message: 'Failed to update job.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_DELETE_FAILED: {
    message: 'Failed to delete job.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_INVALID_STATUS_TRANSITION: {
    message: 'Invalid job status transition.',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_INVALID_EXPIRED_AT: {
    message: 'Expired date must be greater than current time.',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_INVALID_SALARY_RANGE: {
    message: 'Minimum salary must be less than or equal to maximum salary.',
    status: HttpStatus.BAD_REQUEST,
  },

  // CV
  CV_NOT_FOUND: {
    message: 'CV not found.',
    status: HttpStatus.NOT_FOUND,
  },
  CV_ALREADY_EXISTS: {
    message: 'CV already exists.',
    status: HttpStatus.CONFLICT,
  },
  CV_CREATE_FAILED: {
    message: 'Failed to create CV.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_UPDATE_FAILED: {
    message: 'Failed to update CV.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_DELETE_FAILED: {
    message: 'Failed to delete CV.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CV_FILE_TOO_LARGE: {
    message: 'Maximum CV file size is 5MB.',
    status: HttpStatus.BAD_REQUEST,
  },
  CV_FILE_TYPE_INVALID: {
    message: 'Invalid file format. Only PDF, DOC, and DOCX are accepted.',
    status: HttpStatus.BAD_REQUEST,
  },
  CV_ACCESS_DENIED: {
    message: 'You do not have permission to access this CV.',
    status: HttpStatus.FORBIDDEN,
  },
  RATE_LIMIT_EXCEEDED: {
    message:
      'File download limit exceeded within 1 minute. Please try again later.',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },

  // CV ANALYSIS
  CV_ANALYSIS_ALREADY_PROCESSING_ERROR: {
    message:
      'CV analysis is in progress. Please wait for the current job to complete.',
    status: HttpStatus.CONFLICT,
  },
  CV_ANALYSIS_FILE_MISSING_ERROR: {
    message: 'CV is missing a valid file to perform analysis.',
    status: HttpStatus.BAD_REQUEST,
  },
  CV_ANALYSIS_TRIGGER_FAILED_ERROR: {
    message: 'Failed to initialize the CV analysis process.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // CAREER CATEGORY
  CAREER_CATEGORY_NOT_FOUND: {
    message: 'Career category not found.',
    status: HttpStatus.NOT_FOUND,
  },
  CAREER_CATEGORY_ALREADY_EXISTS: {
    message: 'Career category already exists.',
    status: HttpStatus.CONFLICT,
  },
  CAREER_CATEGORY_CREATE_FAILED: {
    message: 'Failed to create career category.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAREER_CATEGORY_UPDATE_FAILED: {
    message: 'Failed to update career category.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAREER_CATEGORY_DELETE_FAILED: {
    message: 'Failed to delete career category.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // SKILL
  SKILL_NOT_FOUND: {
    message: 'Skill not found.',
    status: HttpStatus.NOT_FOUND,
  },
  SKILL_ALREADY_EXISTS: {
    message: 'Skill already exists.',
    status: HttpStatus.CONFLICT,
  },
  SKILL_CREATE_FAILED: {
    message: 'Failed to create skill.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  SKILL_UPDATE_FAILED: {
    message: 'Failed to update skill.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  SKILL_DELETE_FAILED: {
    message: 'Failed to delete skill.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  SKILL_IN_USE: {
    message: 'Skill is in use and cannot be deleted.',
    status: HttpStatus.CONFLICT,
  },

  // FAVOURITE JOB
  FAVOURITE_JOB_NOT_FOUND: {
    message: 'Favourite job not found.',
    status: HttpStatus.NOT_FOUND,
  },
  FAVOURITE_JOB_ALREADY_EXISTS: {
    message: 'Job has already been added to favourites.',
    status: HttpStatus.CONFLICT,
  },
  FAVOURITE_JOB_CREATE_FAILED: {
    message: 'Failed to add favourite job.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  FAVOURITE_JOB_DELETE_FAILED: {
    message: 'Failed to remove favourite job.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // JOB APPLICATION
  JOB_APPLICATION_NOT_FOUND: {
    message: 'Job application not found.',
    status: HttpStatus.NOT_FOUND,
  },
  JOB_APPLICATION_ALREADY_EXISTS: {
    message: 'You have already applied for this job.',
    status: HttpStatus.CONFLICT,
  },
  JOB_APPLICATION_CREATE_FAILED: {
    message: 'Failed to apply for the job.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_APPLICATION_UPDATE_FAILED: {
    message: 'Failed to update job application.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_APPLICATION_WITHDRAW_FAILED: {
    message: 'Failed to withdraw job application.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  JOB_APPLICATION_JOB_NOT_OPEN: {
    message: 'This job is no longer accepting applications.',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_JOB_EXPIRED: {
    message: 'This job application period has expired.',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_CV_IN_USE: {
    message: 'This CV is currently being used for another application.',
    status: HttpStatus.CONFLICT,
  },
  JOB_APPLICATION_CANNOT_WITHDRAW: {
    message:
      'Cannot withdraw application. The application status has already been changed.',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_STATUS_INVALID: {
    message: 'Invalid job application status.',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_ACCESS_DENIED: {
    message: 'You do not have permission to access this job application.',
    status: HttpStatus.FORBIDDEN,
  },
  JOB_APPLICATION_INVALID_STATUS_TRANSITION: {
    message: 'Invalid job application status transition.',
    status: HttpStatus.BAD_REQUEST,
  },
  JOB_APPLICATION_INTERVIEW_SCHEDULE_REQUIRED: {
    message:
      'Interview schedule time and location are required when scheduling an interview.',
    status: HttpStatus.BAD_REQUEST,
  },

  // MEDIA / ROLE
  MEDIA_FILE_REQUIRED: {
    message: 'Uploaded file cannot be empty.',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_FILE_TOO_LARGE: {
    message: 'Maximum file size allowed is 5MB.',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_FILE_TYPE_INVALID: {
    message: 'Invalid file format. Only image files are accepted.',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_TYPE_INVALID: {
    message: 'Invalid media type.',
    status: HttpStatus.BAD_REQUEST,
  },
  MEDIA_UPLOAD_FAILED: {
    message: 'Failed to upload media.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  ROLE_UNABLE_TO_DETERMINE: {
    message: 'Unable to determine user permissions.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  ROLE_INSUFFICIENT_PERMISSIONS: {
    message: 'You do not have permission to perform this action.',
    status: HttpStatus.FORBIDDEN,
  },

  // SYSTEM
  IP_NOT_FOUND: {
    message: 'IP address not found.',
    status: HttpStatus.NOT_FOUND,
  },
  INTERNAL_SERVER_ERROR: {
    message: 'Internal server error. Please try again later.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  VALIDATION_ERROR: {
    message: 'Invalid input data.',
    status: HttpStatus.BAD_REQUEST,
  },
  SYSTEM_BUSY: {
    message: 'System is busy, please try again later.',
    status: HttpStatus.SERVICE_UNAVAILABLE,
  },
} as const;
