import {useReactiveVar} from '@apollo/client';
import {
  MultisigProposal,
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
  TokenVotingProposal,
} from '@aragon/sdk-client';
import {useCallback, useEffect, useState} from 'react';

import {
  pendingMultisigApprovalsVar,
  pendingMultisigExecutionVar,
  pendingMultisigProposalsVar,
  pendingTokenBasedExecutionVar,
  pendingTokenBasedProposalsVar,
  pendingTokenBasedVotesVar,
} from 'context/apolloClient';
import {usePrivacyContext} from 'context/privacyContext';
import {
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_PROPOSALS_KEY,
} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';
import {
  addApprovalToMultisigToProposal,
  addVoteToProposal,
} from 'utils/proposals';
import {HookData, ProposalId, ProposalListItem} from 'utils/types';
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

  const cachedMultisigVotes = useReactiveVar(pendingMultisigApprovalsVar);
  const cachedTokenBasedVotes = useReactiveVar(pendingTokenBasedVotesVar);

  const cachedMultisigExecutions = useReactiveVar(pendingMultisigExecutionVar);
  const cachedTokenBaseExecutions = useReactiveVar(
    pendingTokenBasedExecutionVar
  );

  const cachedMultisigProposals = useReactiveVar(pendingMultisigProposalsVar);
  const cachedTokenBasedProposals = useReactiveVar(
    pendingTokenBasedProposalsVar
  );

  const isMultisigPlugin = type === 'multisig.plugin.dao.eth';
  const isTokenBasedPlugin = type === 'token-voting.plugin.dao.eth';

  // return cache keys and variables based on the type of plugin;
  const getCachedProposalData = useCallback(() => {
    if (isMultisigPlugin) {
      return {
        proposalCacheKey: PENDING_MULTISIG_PROPOSALS_KEY,
        proposalCacheVar: pendingMultisigProposalsVar,
        proposalCache: cachedMultisigProposals,
        executions: cachedMultisigExecutions,
      };
    }

    // token voting
    if (isTokenBasedPlugin) {
      return {
        proposalCacheKey: PENDING_PROPOSALS_KEY,
        proposalCacheVar: pendingTokenBasedProposalsVar,
        proposalCache: cachedTokenBasedProposals,
        executions: cachedTokenBaseExecutions,
      };
    }
  }, [
    cachedMultisigExecutions,
    cachedMultisigProposals,
    cachedTokenBaseExecutions,
    cachedTokenBasedProposals,
    isMultisigPlugin,
    isTokenBasedPlugin,
  ]);

  const augmentProposalsWithCache = useCallback(
    (fetchedProposals: ProposalListItem[]) => {
      // get proposal cached data
      const cachedData = getCachedProposalData();

      // no cache for current dao return proposals from subgraph
      if (!cachedData?.proposalCache[daoAddress]) return fetchedProposals;

      // get all cached proposals for current dao
      const daoCachedProposals = {...cachedData.proposalCache[daoAddress]};
      const augmentedProposals = [...fetchedProposals];

      for (const proposalId in daoCachedProposals) {
        // if proposal already picked up by subgraph, remove it
        // from the cache.
        if (fetchedProposals.some(p => proposalId === p.id.toString())) {
          delete daoCachedProposals[proposalId];

          // update cache to new values
          const newCache = {
            ...cachedData.proposalCache,
            [daoAddress]: {...daoCachedProposals},
          };
          cachedData.proposalCacheVar(newCache);

          // update local storage to match cache
          if (preferences?.functional) {
            localStorage.setItem(
              cachedData.proposalCacheKey,
              JSON.stringify(newCache, customJSONReplacer)
            );
          }
        } else {
          // proposal not yet fetched, add votes, execution and status if necessary
          const id = new ProposalId(proposalId).makeGloballyUnique(daoAddress);

          // check if proposal has been executed
          const cachedProposal = cachedData.executions[id]
            ? {
                ...daoCachedProposals[proposalId],
                status: ProposalStatus.EXECUTED,
              }
            : {...daoCachedProposals[proposalId]};

          // add cached approval to multisig proposal
          if (isMultisigPlugin) {
            augmentedProposals.unshift({
              ...(addApprovalToMultisigToProposal(
                cachedProposal as MultisigProposal,
                cachedMultisigVotes[id]
              ) as ProposalListItem),
            });
          }

          // add cached votes to token based proposal
          if (isTokenBasedPlugin) {
            augmentedProposals.unshift({
              ...(addVoteToProposal(
                cachedProposal as TokenVotingProposal,
                cachedTokenBasedVotes[id]
              ) as ProposalListItem),
            });
          }
        }
      }

      return augmentedProposals;
    },

    // intentionally leaving out proposalCache so that this doesn't
    // get re-run when items are removed from the cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [daoAddress, getCachedProposalData, preferences?.functional]
  );

  useEffect(() => {
    async function getDaoProposals() {
      try {
        if (skip === 0) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

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
