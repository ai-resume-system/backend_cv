export interface ISlugRepository<TEntity> {
  findBySlug(slug: string): Promise<TEntity | null>;
  isSlugTaken(slug: string, excludeId?: string): Promise<boolean>;
}
