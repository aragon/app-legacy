import {QueryKey} from '@tanstack/query-core';
import {TokenDaoMember} from 'hooks/useDaoMembers';

export enum Census3QueryItem {
  VOTING_POWER = 'VOTING_POWER',
}

export const Census3QueryKeys = {
  votingPower: (params: TokenDaoMember): QueryKey => [
    Census3QueryItem.VOTING_POWER,
    params,
  ],
};
