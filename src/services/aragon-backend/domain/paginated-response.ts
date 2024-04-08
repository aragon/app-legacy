import {IDao} from 'services/aragon-backend/domain/dao';
export interface IPaginatedResponse<TItem> {
  pages: TItem[];
  total: number;
  skip: number;
  take: number;
}

export interface IInfiniteODAOPagesResponse {
  page: IDaoPages[];
  skip: number;
  take: number;
  total: number;
}
export interface IDaoPages {
  data: IDao;
  skip: number;
  take: number;
  total: number;
}
