import {useReactiveVar} from '@apollo/client';
import {useCallback, useEffect, useState} from 'react';
import {ProposalStatus} from '@aragon/sdk-client';

import {
  pendingExecutionVar,
  pendingProposalsVar,
  pendingVotesVar,
} from 'context/apolloClient';
import {usePrivacyContext} from 'context/privacyContext';
import {
  PENDING_EXECUTION_KEY,
  PENDING_PROPOSALS_KEY,
  PENDING_VOTES_KEY,
} from 'utils/constants';
import {customJSONReplacer, generateCachedProposalId} from 'utils/library';
import {addVoteToProposal} from 'utils/proposals';
import {DetailedProposal, HookData} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';

/**
 * Retrieve a single detailed proposal
 * @param proposalId id of proposal to retrieve
 * @param pluginType plugin type
 * @returns a detailed proposal
 */
export const useDaoProposal = (
  daoAddress: string,
  proposalId: string,
  pluginType: PluginTypes
): HookData<DetailedProposal | undefined> => {
  const [data, setData] = useState<DetailedProposal>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const pluginClient = usePluginClient(pluginType);

  const {preferences} = usePrivacyContext();
  const cachedVotes = useReactiveVar(pendingVotesVar);
  const cachedExecutions = useReactiveVar(pendingExecutionVar);
  const proposalCache = useReactiveVar(pendingProposalsVar);

  // add cached vote to proposal and recalculate dependent info
  const augmentWithVoteCache = useCallback(
    (proposal: DetailedProposal) => {
      const id = generateCachedProposalId(daoAddress, proposalId);
      const cachedVote = cachedVotes[id];

      // no cache return original proposal
      if (!cachedVote) return proposal;

      // vote in cache is returned from SDK, delete cache
      if (
        proposal.votes.some(
          v => v.address.toLowerCase() === cachedVote.address.toLowerCase()
        )
      ) {
        const newVoteCache = {...cachedVotes};
        delete newVoteCache[id];

        // update cache
        pendingVotesVar(newVoteCache);
        if (preferences?.functional) {
          localStorage.setItem(
            PENDING_VOTES_KEY,
            JSON.stringify(newVoteCache, customJSONReplacer)
          );
        }

        return proposal;
      } else {
        // augment with cached vote
        return addVoteToProposal(proposal, cachedVote);
      }
    },
    [cachedVotes, daoAddress, preferences?.functional, proposalId]
  );

  const augmentWithExecutionCache = useCallback(
    (proposal: DetailedProposal) => {
      const id = generateCachedProposalId(daoAddress, proposalId);
      const cachedExecution = cachedExecutions[id];

      // no cache return original proposal
      if (!cachedExecution) return proposal;

      if (proposal.status === ProposalStatus.EXECUTED) {
        const newExecutionCache = {...cachedExecutions};
        delete newExecutionCache[id];

        // update cache
        pendingExecutionVar(newExecutionCache);
        if (preferences?.functional) {
          localStorage.setItem(
            PENDING_EXECUTION_KEY,
            JSON.stringify(newExecutionCache, customJSONReplacer)
          );
        }

        return proposal;
      } else {
        return {...proposal, status: ProposalStatus.EXECUTED};
      }
    },
    [cachedExecutions, daoAddress, preferences?.functional, proposalId]
  );

  useEffect(() => {
    async function getDaoProposal() {
      try {
        setIsLoading(true);

        const cachedProposal = proposalCache[daoAddress]?.[proposalId];

        const proposal = await pluginClient?.methods.getProposal(proposalId);
        if (proposal) {
          setData({
            ...augmentWithVoteCache(proposal),
            ...augmentWithExecutionCache(proposal),
          });

          // remove cached proposal if it exists
          if (cachedProposal) {
            const newCache = {...proposalCache};
            delete newCache[daoAddress][proposalId];

            // update new values
            pendingProposalsVar(newCache);

            if (preferences?.functional) {
              localStorage.setItem(
                PENDING_PROPOSALS_KEY,
                JSON.stringify(newCache, customJSONReplacer)
              );
            }
          }
        } else if (cachedProposal) {
          setData({
            ...augmentWithVoteCache(cachedProposal as DetailedProposal),
            ...augmentWithExecutionCache(cachedProposal as DetailedProposal),
          });
        }
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    if (proposalId) getDaoProposal();
  }, [
    augmentWithExecutionCache,
    augmentWithVoteCache,
    daoAddress,
    pluginClient?.methods,
    preferences?.functional,
    proposalCache,
    proposalId,
  ]);

  return {data, error, isLoading};
};
