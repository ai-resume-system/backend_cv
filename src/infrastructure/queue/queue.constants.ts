export const CV_PARSE_QUEUE = 'cv.parse';
export const SEARCH_INDEX_QUEUE = 'search.index';
export const CACHE_INVALIDATE_QUEUE = 'cache.invalidate';
export const STORAGE_DELETE_QUEUE = 'storage.delete';
export const CV_PARSE_DLQ = 'cv.parse.dlq';
export const SEARCH_INDEX_DLQ = 'search.index.dlq';
export const CACHE_INVALIDATE_DLQ = 'cache.invalidate.dlq';
export const STORAGE_DELETE_DLQ = 'storage.delete.dlq';

export interface ICvParseJob {
  cvId: string;
  fileKey: string;
  extension: 'pdf' | 'docx' | 'doc';
}

export interface ISearchIndexJob {
  aggregateType: 'job' | 'cv';
  aggregateId: string;
  action: 'index' | 'delete';
}

export interface ICacheInvalidateJob {
  keys?: string[];
  prefixes?: string[];
}

export interface IStorageDeleteJob {
  bucketType: 'cv' | 'company_logo' | 'avatar';
  objectKey: string;
  reason: 'cv.deleted' | 'cv.replaced';
  aggregateId: string;
}
