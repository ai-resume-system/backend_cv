import { validate as uuidValidate, version as uuidVersion } from 'uuid';

export function isValidUUID(str: string, v: 1 | 3 | 4 | 5 = 4): boolean {
  return uuidValidate(str) && uuidVersion(str) === v;
}
