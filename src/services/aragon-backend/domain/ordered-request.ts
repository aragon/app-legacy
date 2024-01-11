export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface IOrderedRequest<TField> {
  direction: OrderDirection;
  orderBy: TField;
}
