import {useReactiveVar} from '@apollo/client';
import {
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
} from '@aragon/sdk-client';
import {useCallback, useEffect, useState} from 'react';

import {
  pendingExecutionVar,
  pendingProposalsVar,
  pendingVotesVar,
} from 'context/apolloClient';
import {usePrivacyContext} from 'context/privacyContext';
import {PENDING_PROPOSALS_KEY} from 'utils/constants';
import {customJSONReplacer, generateCachedProposalId} from 'utils/library';
import {addVoteToProposal} from 'utils/proposals';
import {DetailedProposal, HookData, ProposalListItem} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';

/**
 * Retrieves list of proposals from SDK
 * NOTE: rename to useDaoProposals once the other hook has been deprecated
 * @param daoAddress
 * @param type plugin type
 * @returns list of proposals on plugin
 */
export function useProposals(
  daoAddress: string,
  type: PluginTypes,
  limit = 6,
  skip = 0,
  status?: ProposalStatus
): HookData<Array<ProposalListItem>> {
  const [data, setData] = useState<Array<ProposalListItem>>([]);
  const [error, setError] = useState<Error>();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const client = usePluginClient(type);

  const {preferences} = usePrivacyContext();
  const cachedVotes = useReactiveVar(pendingVotesVar);
  const cachedExecutions = useReactiveVar(pendingExecutionVar);
  const proposalCache = useReactiveVar(pendingProposalsVar);

  const augmentProposalsWithCache = useCallback(
    (fetchedProposals: ProposalListItem[]) => {
      if (!proposalCache[daoAddress]) return fetchedProposals;

      const daoCache = {...proposalCache[daoAddress]};
      const augmentedProposals = [...fetchedProposals];

      for (const proposalId in daoCache) {
        // proposal already picked up; delete it
        if (fetchedProposals.some(p => proposalId === p.id)) {
          delete daoCache[proposalId];

          // cache and store new values
          const newCache = {...proposalCache, [daoAddress]: {...daoCache}};
          pendingProposalsVar(newCache);
          if (preferences?.functional) {
            localStorage.setItem(
              PENDING_PROPOSALS_KEY,
              JSON.stringify(newCache, customJSONReplacer)
            );
          }
        } else {
          // proposal not yet fetched, augment and add votes, execution status if necessary
          const id = generateCachedProposalId(daoAddress, proposalId);
          const cachedProposal = cachedExecutions[id]
            ? {...daoCache[proposalId], status: ProposalStatus.EXECUTED}
            : {...daoCache[proposalId]};

          augmentedProposals.unshift({
            ...(addVoteToProposal(
              cachedProposal as DetailedProposal,
              cachedVotes[id]
            ) as ProposalListItem),
          });
        }
      }

      return augmentedProposals;
    },

    // intentionally leaving out proposalCache so that this doesn't
    // get re-run when items are removed from the cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [daoAddress, preferences?.functional]
  );

  useEffect(() => {
    async function getDaoProposals() {
      try {
        if (skip === 0) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        console.log({
          daoAddressOrEns: daoAddress,
          status,
          limit,
          skip,
          sortBy: ProposalSortBy.CREATED_AT,
          direction: SortDirection.DESC,
        });

        const proposals = await client?.methods.getProposals({
          daoAddressOrEns: daoAddress,
          status,
          limit,
          skip,
          sortBy: ProposalSortBy.CREATED_AT,
          direction: SortDirection.DESC,
        });

        setData([...augmentProposalsWithCache(proposals || [])]);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    }

    if (daoAddress && client?.methods) getDaoProposals();
  }, [
    augmentProposalsWithCache,
    client?.methods,
    daoAddress,
    limit,
    skip,
    status,
  ]);

  return {data, error, isLoading, isInitialLoading, isLoadingMore};
}
