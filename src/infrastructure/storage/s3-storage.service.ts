import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { EBucketType } from 'src/common/constants/enum/upload.enum';
import { Readable } from 'stream';

export interface IUploadObjectParams {
  key: string;
  buffer: Buffer;
  contentType: string;
  bucketType?: EBucketType;
}

export interface IStorageObjectInfo {
  key: string;
  lastModified?: Date;
  size?: number;
}

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3: S3Client;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint =
      this.configService.get<string>('minio.endpoint') ||
      'http://localhost:9000';
    const accessKeyId = this.configService.get<string>('minio.accessKeyId');
    const secretAccessKey = this.configService.get<string>(
      'minio.secretAccessKey',
    );
    const s3Region =
      this.configService.get<string>('minio.region') || 'us-east-1';

    const forcePathStyle =
      this.configService.get<string>('minio.pathStyle') === 'true' ||
      this.configService.get<boolean>('minio.pathStyle') === true;

    if (!this.endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'MinIO configuration is incomplete. Please check MINIO_ENDPOINT, MINIO_ACCESS_KEY_ID, MINIO_SECRET_ACCESS_KEY',
      );
    }

    this.s3 = new S3Client({
      region: s3Region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: forcePathStyle,
    });
  }

  async uploadObject(params: IUploadObjectParams): Promise<string> {
    const bucket = this.getBucket(params.bucketType || EBucketType.CV);

    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: bucket,
        Key: params.key,
        Body: params.buffer,
        ContentType: params.contentType,
      },
    });

    await upload.done();
    return this.toPublicUrl(params.key, params.bucketType || EBucketType.CV);
  }

  async getPrivateObjectBuffer(key: string): Promise<Buffer> {
    const result = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.getBucket(EBucketType.CV),
        Key: this.normalizeObjectKey(key, EBucketType.CV),
      }),
    );
    const body = result.Body;
    if (!body) return Buffer.alloc(0);
    if (body instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }
    return Buffer.from(await (body as Blob).arrayBuffer());
  }

  async createPrivateDownloadUrl(
    key: string,
    bucketType: EBucketType = EBucketType.CV,
    expiresIn?: number,
    fileName?: string,
  ): Promise<string> {
    return this.createPrivateObjectUrl(
      key,
      bucketType,
      expiresIn,
      this.buildContentDisposition('attachment', fileName),
    );
  }

  async createPrivatePreviewUrl(
    key: string,
    bucketType: EBucketType = EBucketType.CV,
    expiresIn?: number,
  ): Promise<string> {
    return this.createPrivateObjectUrl(key, bucketType, expiresIn, 'inline');
  }

  async deleteObject(
    key: string,
    bucketType: EBucketType = EBucketType.CV,
  ): Promise<void> {
    const objectKey = this.normalizeObjectKey(key, bucketType);
    if (!objectKey) return;
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.getBucket(bucketType),
        Key: objectKey,
      }),
    );
  }

  async listObjects(
    bucketType: EBucketType,
    prefix?: string,
  ): Promise<IStorageObjectInfo[]> {
    const bucket = this.getBucket(bucketType);
    const objects: IStorageObjectInfo[] = [];
    let continuationToken: string | undefined;

    do {
      const result = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );

      for (const item of result.Contents || []) {
        if (!item.Key) continue;
        objects.push({
          key: item.Key,
          lastModified: item.LastModified,
          size: item.Size,
        });
      }

      continuationToken = result.NextContinuationToken;
    } while (continuationToken);

    return objects;
  }

  normalizeObjectKey(
    keyOrUrl: string,
    bucketType: EBucketType = EBucketType.CV,
  ): string {
    if (!keyOrUrl) return '';
    const bucket = this.getBucket(bucketType);
    const trimBucketPrefix = (value: string) => {
      const normalized = value.replace(/^\/+/, '');
      return normalized.startsWith(`${bucket}/`)
        ? normalized.slice(bucket.length + 1)
        : normalized;
    };

    try {
      const url = new URL(keyOrUrl);
      return trimBucketPrefix(decodeURIComponent(url.pathname));
    } catch {
      return trimBucketPrefix(keyOrUrl);
    }
  }

  private async createPrivateObjectUrl(
    key: string,
    bucketType: EBucketType,
    expiresIn: number | undefined,
    disposition: string,
  ): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: this.getBucket(bucketType),
        Key: this.normalizeObjectKey(key, bucketType),
        ResponseContentDisposition: disposition,
      }),
      {
        expiresIn:
          expiresIn ||
          this.configService.get<number>('minio.presignedUrlTtl') ||
          900,
      },
    );
  }

  private buildContentDisposition(
    type: 'inline' | 'attachment',
    fileName?: string,
  ): string {
    if (!fileName) return type;
    const fallback = fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/["\\]/g, '')
      .trim();
    return `${type}; filename="${fallback || 'download'}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
  }

  toPublicUrl(key: string, bucketType: EBucketType = EBucketType.CV): string {
    const bucket = this.getBucket(bucketType);
    const baseUrl = this.endpoint.replace(/\/$/, '');
    return `${baseUrl}/${bucket}/${key.replace(/^\//, '')}`;
  }

  isExternalUrl(value?: string): boolean {
    if (!value) return false;
    try {
      const url = new URL(value);
      const endpoint = new URL(this.endpoint);
      return url.host !== endpoint.host;
    } catch {
      return false;
    }
  }

  private getBucket(bucketType: EBucketType): string {
    switch (bucketType) {
      case EBucketType.CV:
        return this.configService.get<string>('minio.cvBucket') || 'cv-files';
      case EBucketType.COMPANY_LOGO:
        return (
          this.configService.get<string>('minio.logoBucket') || 'company-logos'
        );
      case EBucketType.AVATAR:
        return (
          this.configService.get<string>('minio.avatarBucket') ||
          'avatars-profile'
        );
      case EBucketType.BANNER:
        return (
          this.configService.get<string>('minio.bannerBucket') ||
          'company-banners'
        );
      default:
        return this.configService.get<string>('minio.cvBucket') || 'cv-files';
    }
  }
}
