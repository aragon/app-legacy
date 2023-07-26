import {TimeFilter} from 'utils/constants';

export type TokenPrices = {
  [key: string]: {
    price: number;
    percentages: {
      [key in TimeFilter]: number;
    };
  };
};
