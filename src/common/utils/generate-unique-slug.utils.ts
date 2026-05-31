import { appendSlugSuffix, buildSlugCandidate } from './slug.utils';

export async function generateUniqueSlug(
  source: string | undefined | null,
  fallbackPrefix: string,
  isSlugTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = buildSlugCandidate(source, fallbackPrefix);
  let suffix = 1;
  let candidate = baseSlug;

  while (await isSlugTaken(candidate)) {
    suffix += 1;
    candidate = appendSlugSuffix(baseSlug, suffix);
  }

  return candidate;
}
