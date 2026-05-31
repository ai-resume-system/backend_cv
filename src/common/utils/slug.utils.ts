export function slugifyText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function buildSlugCandidate(
  source: string | undefined | null,
  fallbackPrefix: string,
): string {
  const normalized = slugifyText(source?.trim() || '');
  return normalized || `${fallbackPrefix}-${Date.now()}`;
}

export function appendSlugSuffix(baseSlug: string, suffix: number): string {
  if (suffix <= 1) {
    return baseSlug;
  }

  return `${baseSlug}-${suffix}`;
}
