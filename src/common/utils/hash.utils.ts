import { createHash } from 'crypto';

// hash value to string
export function hashToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

// hash object or any value to string
export function stableHash(value: unknown): string {
  return hashToken(JSON.stringify(value ?? {}));
}

// hash otp to verify
export function hashOtp(otp: string, email: string): string {
  return createHash('sha256').update(`${otp}:${email}:secret`).digest('hex');
}
