import {useReactiveVar} from '@apollo/client';
import {ProposalStatus} from '@aragon/sdk-client';
import {useCallback, useEffect, useState} from 'react';

import {
  pendingExecutionVar,
  pendingMultisigApprovalsVar,
  pendingProposalsVar,
  pendingTokenBasedVotesVar,
} from 'context/apolloClient';
import {usePrivacyContext} from 'context/privacyContext';
import {PENDING_EXECUTION_KEY, PENDING_PROPOSALS_KEY} from 'utils/constants';
import {customJSONReplacer, generateCachedProposalId} from 'utils/library';
import {augmentProposalWithVoteCache} from 'utils/proposals';
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

  const cachedMultisigVotes = useReactiveVar(pendingMultisigApprovalsVar);
  const cachedTokenBasedVotes = useReactiveVar(pendingTokenBasedVotesVar);

  const proposalCache = useReactiveVar(pendingProposalsVar);
  const cachedExecutions = useReactiveVar(pendingExecutionVar);

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

        const cachedVotes =
          pluginType === 'multisig.plugin.dao.eth'
            ? cachedMultisigVotes
            : cachedTokenBasedVotes;

        const proposal = await pluginClient?.methods.getProposal(proposalId);
        if (proposal) {
          setData({
            ...augmentProposalWithVoteCache(
              proposal,
              daoAddress,
              cachedVotes,
              preferences?.functional
            ),
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
            ...augmentProposalWithVoteCache(
              cachedProposal as DetailedProposal,
              daoAddress,
              cachedVotes,
              preferences?.functional
            ),
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
    cachedMultisigVotes,
    cachedTokenBasedVotes,
    daoAddress,
    pluginClient?.methods,
    pluginType,
    preferences?.functional,
    proposalCache,
    proposalId,
  ]);

  return {data, error, isLoading};
};
