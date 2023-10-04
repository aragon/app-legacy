import {TokenHolder} from './token-holder';

export type TokenHoldersResponse = {
  holders: {
    holders: TokenHolder[];
    totalHolders: number;
  };
};
