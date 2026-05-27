import type { Request } from 'express';
import {
  AUTH_CLIENTS,
  AUTH_CLIENT_HEADER,
  DEFAULT_AUTH_CLIENT,
  type AuthClient,
} from 'src/common/constants/auth-client.constants';

const AUTH_CLIENT_VALUES = new Set<AuthClient>(Object.values(AUTH_CLIENTS));

export function normalizeAuthClient(value?: string | null): AuthClient {
  if (!value) {
    return DEFAULT_AUTH_CLIENT;
  }

  return AUTH_CLIENT_VALUES.has(value as AuthClient)
    ? (value as AuthClient)
    : DEFAULT_AUTH_CLIENT;
}

export function resolveAuthClient(request: Request): AuthClient {
  const headerValue = request.headers[AUTH_CLIENT_HEADER] as
    | string
    | undefined;

  return normalizeAuthClient(headerValue);
}
