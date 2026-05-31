export const CACHE_KEYS = {
  JOB_LIST: 'job:list',
  JOB_DETAIL: 'job:detail',
  SKILL_LIST: 'skill:list',
  SKILL_DETAIL: 'skill:detail',
  COMPANY_LIST: 'company:list',
  COMPANY_DETAIL: 'company:detail',
  CV_LIST: 'cv:list',
  CV_DETAIL: 'cv:detail',
  USER_LIST: 'user:list',
  USER_DETAIL: 'user:profile',
  CAREER_CATEGORY_LIST: 'career-category:list',
  CAREER_CATEGORY_DETAIL: 'career-category:detail',
  CAREER_CATEGORY_TOP: 'career-category:top',
} as const;

export const CACHE_VERSION_KEYS = {
  JOB_LIST: 'job:list',
  JOB_DETAIL: 'job:detail',
  SKILL_LIST: 'skill:list',
  SKILL_DETAIL: 'skill:detail',
  COMPANY_LIST: 'company:list',
  COMPANY_DETAIL: 'company:detail',
  CV_LIST: 'cv:list',
  CV_DETAIL: 'cv:detail',
  USER_LIST: 'user:list',
  CAREER_CATEGORY_LIST: 'career-category:list',
  CAREER_CATEGORY_DETAIL: 'career-category:detail',
  CAREER_CATEGORY_TOP: 'career-category:top',
} as const;

export const CACHE_TTL = {
  LIST: 600,
  DETAIL: 1800,
  DEGRADED: 60,
} as const;
