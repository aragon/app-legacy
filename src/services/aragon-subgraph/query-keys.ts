import {QueryKey} from '@tanstack/react-query';
import {IFetchTotalProposalCountParams} from './aragon-subgraph-service.api';

export enum AragonSubgraphQueryItem {
  TOTAL_PROPOSAL_COUNT = 'TOTAL_PROPOSAL_COUNT',
}

export const aragonSubgraphQueryKeys = {
  totalProposalCount: (params: IFetchTotalProposalCountParams): QueryKey => [
    AragonSubgraphQueryItem.TOTAL_PROPOSAL_COUNT,
    params,
  ],
};
