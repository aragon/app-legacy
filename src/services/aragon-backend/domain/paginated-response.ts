import {IDao} from 'services/aragon-backend/domain/dao';

export interface IDaoPage {
  data: IDao[];
}
export interface IPaginatedDaoResponse {
  pages: IDaoPage[];
  total: number;
  skip: number;
  take: number;
}
