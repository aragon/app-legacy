import {QueryKey} from '@tanstack/query-core';
import {TokenDaoMember} from 'hooks/useDaoMembers';

export enum Census3QueryItem {
  VOTING_POWER = 'VOTING_POWER',
  PAST_VOTING_POWER = 'PAST_VOTING_POWER',
  CENSUS = 'CENSUS',
  TOKEN = 'TOKEN',
  HOLDERS_LIST = 'HOLDERS_LIST',
}

export const Census3QueryKeys = {
  votingPower: (params: TokenDaoMember): QueryKey => [
    Census3QueryItem.VOTING_POWER,
    params,
  ],
  pastVotingPower: (params: TokenDaoMember): QueryKey => [
    Census3QueryItem.PAST_VOTING_POWER,
    params,
  ],
  census: (censusId: string): QueryKey => [Census3QueryItem.CENSUS, censusId],
  token: (tokenId: string): QueryKey => [Census3QueryItem.CENSUS, tokenId],
  holdersList: (strategyId: number, page: number): QueryKey => [
    Census3QueryItem.HOLDERS_LIST,
    strategyId,
    page,
  ],
};
