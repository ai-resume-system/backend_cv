export interface ISlugRepository<TEntity> {
  findBySlug(slug: string): Promise<TEntity | null>; // Tìm theo slug
  isSlugTaken(slug: string, excludeId?: string): Promise<boolean>; // Kiểm tra slug đã tồn tại chưa
}
