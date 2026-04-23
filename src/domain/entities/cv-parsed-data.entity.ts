export interface ICVParsedDataEntity {
  id: string;
  cvId: string;
  rawText?: string;
  parsedJson?: Record<string, unknown>;
  score: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
