import {IDao} from 'services/aragon-backend/domain/dao';

export interface IDaoPage {
  data: IDao[];
  total: number;
  skip: number;
  take: number;
}
export interface IPaginatedDaoResponse {
  pages: IDaoPage[];
}
