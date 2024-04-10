export interface IPaginatedResponse<TItem> {
  data: TItem[];
  total: number;
  skip: number;
  take: number;
}
