import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ICVEntity } from 'src/domain/entities/cv.entity';
import { IJobEntity } from 'src/domain/entities/job.entity';

export const JOBS_INDEX = 'jobs';
export const CVS_INDEX = 'cvs';

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);

  constructor(private readonly elasticsearch: ElasticsearchService) {}

  async ensureIndexes(): Promise<void> {
    await Promise.all([this.ensureJobsIndex(), this.ensureCvsIndex()]);
  }

  async indexJob(job: IJobEntity): Promise<void> {
    await this.elasticsearch.index({
      index: JOBS_INDEX,
      id: job.id,
      document: {
        id: job.id,
        companyId: job.companyId,
        careerCategoryId: job.careerCategoryId,
        title: job.title,
        description: job.description,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        experienceYears: job.experienceYears,
        jobType: job.jobType,
        status: job.status,
        expiredAt: job.expiredAt,
        rejectReason: job.rejectReason,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        deletedAt: job.deletedAt,
      },
    });
  }

  async removeJob(id: string): Promise<void> {
    await this.elasticsearch.delete({ index: JOBS_INDEX, id }).catch(() => undefined);
  }

  async indexCv(cv: ICVEntity): Promise<void> {
    await this.elasticsearch.index({
      index: CVS_INDEX,
      id: cv.id,
      document: {
        id: cv.id,
        userId: cv.userId,
        title: cv.title,
        fileUrl: cv.fileUrl,
        processingStatus: cv.processingStatus,
        isDefault: cv.isDefault,
        summary: cv.summary,
        status: cv.status,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
        deletedAt: cv.deletedAt,
      },
    });
  }

  async removeCv(id: string): Promise<void> {
    await this.elasticsearch.delete({ index: CVS_INDEX, id }).catch(() => undefined);
  }

  async search<T>(params: {
    index: string;
    query: Record<string, unknown>;
    from?: number;
    size?: number;
    sort?: unknown[];
    searchAfter?: unknown[];
  }): Promise<{ data: T[]; total: number; nextCursor?: string }> {
    const response = await this.elasticsearch.search({
      index: params.index,
      query: params.query as any,
      from: params.searchAfter ? undefined : params.from,
      size: params.size,
      sort: params.sort as any,
      search_after: params.searchAfter as any,
    });
    const hits = response.hits.hits;
    const total =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total?.value || 0;
    const lastSort = hits[hits.length - 1]?.sort;
    return {
      data: hits.map((hit) => hit._source as T),
      total,
      nextCursor: lastSort ? Buffer.from(JSON.stringify(lastSort)).toString('base64') : undefined,
    };
  }

  private async ensureJobsIndex(): Promise<void> {
    const exists = await this.elasticsearch.indices.exists({ index: JOBS_INDEX });
    if (exists) return;
    await this.elasticsearch.indices.create({
      index: JOBS_INDEX,
      mappings: {
        properties: {
          title: { type: 'text' },
          description: { type: 'text' },
          location: { type: 'keyword' },
          jobType: { type: 'keyword' },
          status: { type: 'keyword' },
          companyId: { type: 'keyword' },
          careerCategoryId: { type: 'keyword' },
          salaryMin: { type: 'integer' },
          salaryMax: { type: 'integer' },
          experienceYears: { type: 'integer' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
          expiredAt: { type: 'date' },
        },
      },
    });
    this.logger.log('Created jobs Elasticsearch index');
  }

  private async ensureCvsIndex(): Promise<void> {
    const exists = await this.elasticsearch.indices.exists({ index: CVS_INDEX });
    if (exists) return;
    await this.elasticsearch.indices.create({
      index: CVS_INDEX,
      mappings: {
        properties: {
          title: { type: 'text' },
          summary: { type: 'text' },
          userId: { type: 'keyword' },
          status: { type: 'keyword' },
          processingStatus: { type: 'keyword' },
          isDefault: { type: 'boolean' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
        },
      },
    });
    this.logger.log('Created cvs Elasticsearch index');
  }
}
