import {
  MultisigClient,
  MultisigProposalListItem,
  ProposalSortBy,
  TokenVotingClient,
  TokenVotingProposalListItem,
} from '@aragon/sdk-client';
import {SortDirection} from '@aragon/sdk-client-common';
import {
  InfiniteData,
  UseInfiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query';

import {useNetwork} from 'context/network';
import {usePluginClient} from 'hooks/usePluginClient';
import {CHAIN_METADATA} from 'utils/constants';
import {invariant} from 'utils/invariant';
import {IFetchProposalsParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';
import {transformInfiniteProposals} from '../selectors';

const PROPOSALS_PER_PAGE = 6;

const DEFAULT_PARAMS: IFetchProposalsParams = {
  limit: PROPOSALS_PER_PAGE,
  skip: 0,
  sortBy: ProposalSortBy.CREATED_AT,
  direction: SortDirection.DESC,
};

async function fetchProposalsAsync(
  params: IFetchProposalsParams,
  client: TokenVotingClient | MultisigClient | undefined
): Promise<
  Array<MultisigProposalListItem> | Array<TokenVotingProposalListItem>
> {
  invariant(!!client, 'fetchProposalsAsync: client is not defined');
  const data = await client.methods.getProposals(params);
  return data;
}

export const useProposals = (
  userParams: Partial<IFetchProposalsParams>,
  options: UseInfiniteQueryOptions<
    Array<MultisigProposalListItem> | Array<TokenVotingProposalListItem>
  > = {}
) => {
  const params = {...DEFAULT_PARAMS, ...userParams};
  const client = usePluginClient(params.pluginType);

  const {network} = useNetwork();
  const chainId = CHAIN_METADATA[network].id;

  if (client == null || params.daoAddressOrEns == null) {
    options.enabled = false;
  }

  const defaultSelect = (
    data: InfiniteData<
      Array<MultisigProposalListItem> | Array<TokenVotingProposalListItem>
    >
  ) => transformInfiniteProposals(chainId, data);

  return useInfiniteQuery({
    ...options,
    queryKey: aragonSdkQueryKeys.proposals(params),

    queryFn: context => {
      // Adjust the skip based on the current page
      const skip = context.pageParam
        ? context.pageParam * params.limit!
        : params.skip;
      return fetchProposalsAsync({...params, skip}, client);
    },

    // If the length of the last page is equal to the limit from params,
    // it's likely there's more data to fetch. Can't be certain since
    // the SDK doesn't return a max length
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === params.limit) {
        return allPages.length;
      }
    },

    select: options.select ?? defaultSelect,
  });
};
