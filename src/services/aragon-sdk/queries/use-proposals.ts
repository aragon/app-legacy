import {
  MultisigProposalListItem,
  ProposalSortBy,
  TokenVotingProposalListItem,
} from '@aragon/sdk-client';
import {
  EMPTY_PROPOSAL_METADATA_LINK,
  InvalidCidError,
  SortDirection,
  UNAVAILABLE_PROPOSAL_METADATA,
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
} from '@aragon/sdk-client-common';
import {
  InfiniteData,
  UseInfiniteQueryOptions,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {useNetwork} from 'context/network';
import {
  PluginClient,
  isMultisigClient,
  isTokenVotingClient,
  usePluginClient,
} from 'hooks/usePluginClient';
import {
  CHAIN_METADATA,
  SUBGRAPH_API_URL,
  SupportedChainID,
  SupportedNetworks,
} from 'utils/constants';
import {invariant} from 'utils/invariant';
import {proposalStorage} from 'utils/localStorage/proposalStorage';
import {IFetchProposalsParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';
import {transformInfiniteProposals} from '../selectors';
import {GaslessVotingProposalListItem} from '@vocdoni/gasless-voting';
import request from 'graphql-request';
import {SubgraphMultisigProposalListItem} from 'utils/types';
import {ipfsService} from 'services/ipfs/ipfsService';
import {SubgraphTokenVotingProposalListItem} from '@aragon/sdk-client/dist/tokenVoting/internal/types';
import {isEnsDomain} from '@aragon/ods-old';
import {useProviders} from 'context/providers';
import {providers} from 'ethers';
import {
  toMultisigProposalListItem,
  toTokenVotingProposalListItem,
} from '../selectors/proposals';
import {
  QueryMultisigProposals,
  QueryTokenVotingProposals,
} from '../queryhelpers/proposals';

export const PROPOSALS_PER_PAGE = 6;

type FetchProposalsResponseTypes =
  | Array<MultisigProposalListItem>
  | Array<TokenVotingProposalListItem>
  | Array<GaslessVotingProposalListItem>;

const DEFAULT_PARAMS = {
  limit: PROPOSALS_PER_PAGE,
  skip: 0,
  sortBy: ProposalSortBy.CREATED_AT,
  direction: SortDirection.DESC,
};

async function getProposalsList(
  client: PluginClient,
  params: IFetchProposalsParams,
  network: SupportedNetworks
) {
  const {daoAddressOrEns, limit, skip, direction, sortBy} = params;

  if (isTokenVotingClient(client)) {
    const {tokenVotingProposals} = await request<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokenVotingProposals: any;
    }>(SUBGRAPH_API_URL[network]!, QueryTokenVotingProposals, {
      where: {
        dao: daoAddressOrEns,
      },
      limit,
      skip,
      direction,
      sortBy,
    });

    return await Promise.all(
      tokenVotingProposals.map(
        async (
          proposal: SubgraphTokenVotingProposalListItem
        ): Promise<TokenVotingProposalListItem> => {
          // format in the metadata field
          if (!proposal.metadata) {
            return toTokenVotingProposalListItem(
              proposal,
              EMPTY_PROPOSAL_METADATA_LINK
            );
          }
          try {
            const metadata = await ipfsService.getData(proposal.metadata);
            return toTokenVotingProposalListItem(proposal, metadata);
          } catch (err) {
            if (err instanceof InvalidCidError) {
              return toTokenVotingProposalListItem(
                proposal,
                UNSUPPORTED_PROPOSAL_METADATA_LINK
              );
            }
            return toTokenVotingProposalListItem(
              proposal,
              UNAVAILABLE_PROPOSAL_METADATA
            );
          }
        }
      )
    );
  } else if (isMultisigClient(client)) {
    const {multisigProposals} = await request<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      multisigProposals: any;
    }>(SUBGRAPH_API_URL[network]!, QueryMultisigProposals, {
      where: {
        dao: daoAddressOrEns,
      },
      limit,
      skip,
      direction,
      sortBy,
    });

    return await Promise.all(
      multisigProposals.map(
        async (
          proposal: SubgraphMultisigProposalListItem
        ): Promise<MultisigProposalListItem> => {
          if (!proposal.metadata) {
            return toMultisigProposalListItem(
              proposal,
              EMPTY_PROPOSAL_METADATA_LINK
            );
          }
          // format in the metadata field
          try {
            const metadata = await ipfsService.getData(proposal.metadata);
            return toMultisigProposalListItem(proposal, metadata);
          } catch (err) {
            if (err instanceof InvalidCidError) {
              return toMultisigProposalListItem(
                proposal,
                UNSUPPORTED_PROPOSAL_METADATA_LINK
              );
            }
            return toMultisigProposalListItem(
              proposal,
              UNAVAILABLE_PROPOSAL_METADATA
            );
          }
        }
      )
    );
  }
}

async function fetchProposals(
  client: PluginClient | undefined,
  params: IFetchProposalsParams,
  network: SupportedNetworks,
  provider: providers.Provider
): Promise<FetchProposalsResponseTypes> {
  invariant(!!client, 'fetchProposalsAsync: client is not defined');

  // eslint-disable-next-line prefer-const
  let {daoAddressOrEns, ...restParams} = params;

  daoAddressOrEns = isEnsDomain(params?.daoAddressOrEns || '')
    ? ((await provider.resolveName(params.daoAddressOrEns as string)) as string)
    : params.daoAddressOrEns;

  const data = await getProposalsList(
    client,
    {daoAddressOrEns: daoAddressOrEns?.toLowerCase(), ...restParams},
    network
  );
  return data as FetchProposalsResponseTypes;
}

export const useProposals = (
  userParams: Partial<IFetchProposalsParams> & {pluginAddress: string},
  options: Omit<
    UseInfiniteQueryOptions<FetchProposalsResponseTypes>,
    'queryKey' | 'getNextPageParam' | 'initialPageParam'
  > = {}
) => {
  const params = {...DEFAULT_PARAMS, ...userParams};
  const client = usePluginClient(params.pluginType);
  const queryClient = useQueryClient();
  const {api: provider} = useProviders();

  const {network} = useNetwork();
  const chainId = CHAIN_METADATA[network].id;

  if (
    client == null ||
    params.daoAddressOrEns == null ||
    params.pluginAddress == null
  ) {
    options.enabled = false;
  }

  // get the previously merged local storage proposals from the react-query cache
  // this helps to restore the state after component is unmounted/remounted
  const previouslyMergedStoredProposals: Set<string> =
    queryClient.getQueryData(
      aragonSdkQueryKeys.localProposals(params.status)
    ) ?? new Set();

  const defaultSelect = (data: InfiniteData<FetchProposalsResponseTypes>) =>
    transformInfiniteProposals(chainId, data);

  return useInfiniteQuery({
    ...options,
    queryKey: aragonSdkQueryKeys.proposals(params),
    queryFn: async context => {
      // adjust the skip to take into account proposals that have already been merged
      const skip = context.pageParam
        ? (Number(context.pageParam) * params.limit ?? DEFAULT_PARAMS.limit) -
          previouslyMergedStoredProposals.size
        : params.skip;

      // fetch proposals from subgraph
      const serverProposals = await fetchProposals(
        client,
        {...params, skip},
        network,
        provider
      );
      const serverProposalIds = new Set(serverProposals.map(p => p.id));

      // fetch from local storage
      const allLocalProposals = proposalStorage.getProposalsByPluginAddress(
        chainId,
        params.pluginAddress
      );

      // Get local proposals without duplicates
      const uniqueStoredProposals = getUniqueStoredProposals(
        serverProposalIds,
        allLocalProposals,
        chainId
      );

      // Get local proposals that have not yet been merged into the query response
      const finalStoredProposals = getUnmergedStoredProposals(
        uniqueStoredProposals,
        serverProposalIds,
        previouslyMergedStoredProposals,
        params.status
      );

      // update the cache of local proposals
      queryClient.setQueryData(
        aragonSdkQueryKeys.localProposals(params.status),
        previouslyMergedStoredProposals
      );

      // Return the combined proposals
      return [...finalStoredProposals, ...serverProposals].slice(
        0,
        params.limit
      ) as FetchProposalsResponseTypes;
    },
    initialPageParam: 0,
    // If the length of the last page is equal to the limit from params,
    // it's likely there's more data to fetch. Can't be certain since
    // the SDK doesn't return a max length
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === params.limit) {
        return allPages.length;
      }
    },

    select: defaultSelect,
  });
};

/**
 * Remove duplicates from the cache.
 *
 * This function filters out proposals from local storage that are also found in the server's data.
 * It additionally removes such proposals from the persistent local storage.
 *
 * @param serverProposalIds - A Set containing IDs of the server's proposals.
 * @param localProposals - An array of proposals fetched from local storage.
 * @param chainId - The chain ID for identifying the correct chain-specific proposal storage.
 * @returns An array of local proposals that do not exist in the server's data.
 */
function getUniqueStoredProposals(
  serverProposalIds: Set<string>,
  localProposals: Array<MultisigProposalListItem | TokenVotingProposalListItem>,
  chainId: SupportedChainID
) {
  return localProposals.filter(proposal => {
    if (serverProposalIds.has(proposal.id)) {
      proposalStorage.removeProposal(chainId, proposal.id);
      return false;
    }
    return true;
  });
}

/**
 * Retrieve unique local proposals.
 *
 * This function extracts unique local proposals that do not exist in the server's data
 * or in the set of previously merged stored proposals, and that match the provided status criteria.
 *
 * @param localProposals - An array of proposals fetched from local storage.
 * @param serverProposalIds - A Set containing IDs of the server's proposals.
 * @param previouslyMergedStoredProposals - A Set containing IDs of previously merged stored proposals.
 * @param params - The parameters for fetching proposals, used to match proposal status.
 * @returns An array of unique local proposals.
 */
function getUnmergedStoredProposals(
  localProposals: Array<MultisigProposalListItem | TokenVotingProposalListItem>,
  serverProposalIds: Set<string>,
  previouslyMergedStoredProposals: Set<string>,
  status?: IFetchProposalsParams['status']
) {
  const combinedProposals = [];
  for (const proposal of localProposals) {
    if (
      !serverProposalIds.has(proposal.id) &&
      !previouslyMergedStoredProposals.has(proposal.id) &&
      (proposal.status === status || status == null)
    ) {
      combinedProposals.push(proposal);
      previouslyMergedStoredProposals.add(proposal.id);
    }
  }
  return combinedProposals;
}
