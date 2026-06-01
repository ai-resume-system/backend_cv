import { EBucketType } from 'src/common/constants/enum/upload.enum';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';

const MEDIA_RESPONSE_URL_TTL_SECONDS = 3600;

export async function toPreviewUrl(
  storage: S3StorageService,
  value: string | null | undefined,
  bucketType: EBucketType,
  expiresIn: number = MEDIA_RESPONSE_URL_TTL_SECONDS,
): Promise<string | null | undefined> {
  if (!value || storage.isExternalUrl(value)) {
    return value;
  }

  return storage.createPrivatePreviewUrl(value, bucketType, expiresIn);
}

export async function resolveProfileAvatar<
  T extends { avatarUrl?: string | null } | null | undefined,
>(storage: S3StorageService, profile: T): Promise<T> {
  if (!profile) {
    return profile;
  }

  return {
    ...profile,
    avatarUrl: await toPreviewUrl(
      storage,
      profile.avatarUrl,
      EBucketType.AVATAR,
    ),
  };
}

export async function resolveCompanyMedia<
  T extends {
    logoUrl?: string | null;
    bannerUrl?: string | null;
  } | null | undefined,
>(storage: S3StorageService, company: T): Promise<T> {
  if (!company) {
    return company;
  }

  const [logoUrl, bannerUrl] = await Promise.all([
    toPreviewUrl(storage, company.logoUrl, EBucketType.COMPANY_LOGO),
    toPreviewUrl(storage, company.bannerUrl, EBucketType.BANNER),
  ]);

  return {
    ...company,
    logoUrl,
    bannerUrl,
  };
}
