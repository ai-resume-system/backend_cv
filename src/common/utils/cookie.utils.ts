import type { CookieOptions, Response } from 'express';

export const REFRESH_TOKEN_COOKIE_NAME = '__rt';

const REFRESH_TOKEN_COOKIE_PATH = '/api/v1/auth';
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function isProductionEnvironment(): boolean {
  const runtimeEnv = process.env.NODE_ENV ?? process.env.WEB_ENV;
  return runtimeEnv === 'production';
}

function buildRefreshTokenCookieOptions(): CookieOptions {
  const isProduction = isProductionEnvironment();

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: REFRESH_TOKEN_COOKIE_PATH,
    domain: isProduction ? '.fuse.vn' : undefined,
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  };
}

export function setRefreshTokenCookie(
  response: Response,
  refreshToken: string,
  maxAge?: number,
): void {
  const options = buildRefreshTokenCookieOptions();
  if (maxAge) {
    options.maxAge = maxAge;
  }
  response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, options);
}

export function clearRefreshTokenCookie(response: Response): void {
  response.clearCookie(
    REFRESH_TOKEN_COOKIE_NAME,
    buildRefreshTokenCookieOptions(),
  );
}
