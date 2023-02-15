import {useReactiveVar} from '@apollo/client';
import {useCallback, useEffect, useState} from 'react';

import {
  PendingMultisigApprovals,
  pendingMultisigApprovalsVar,
  PendingMultisigExecution,
  pendingMultisigExecutionVar,
  pendingTokenBasedProposalsVar,
  PendingTokenBasedExecution,
  pendingTokenBasedExecutionVar,
  PendingTokenBasedVotes,
  pendingTokenBasedVotesVar,
  pendingMultisigProposalsVar,
} from 'context/apolloClient';
import {usePrivacyContext} from 'context/privacyContext';
import {
  PENDING_EXECUTION_KEY,
  PENDING_MULTISIG_EXECUTION_KEY,
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_PROPOSALS_KEY,
} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';
import {
  augmentProposalWithCachedExecution,
  augmentProposalWithCachedVote,
  isTokenBasedProposal,
} from 'utils/proposals';
import {DetailedProposal, HookData, ProposalId} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';

/**
 * Retrieve a single detailed proposal
 * @param proposalId id of proposal to retrieve
 * @param pluginType plugin type
 * @returns a detailed proposal
 */
export const useDaoProposal = (
  daoAddress: string,
  proposalId: ProposalId,
  pluginType: PluginTypes,
  pluginAddress: string
): HookData<DetailedProposal | undefined> => {
  const [data, setData] = useState<DetailedProposal>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const pluginClient = usePluginClient(pluginType);

  const {preferences} = usePrivacyContext();

  const cachedMultisigVotes = useReactiveVar(pendingMultisigApprovalsVar);
  const cachedTokenBasedVotes = useReactiveVar(pendingTokenBasedVotesVar);

  const cachedMultisigProposals = useReactiveVar(pendingMultisigProposalsVar);
  const cachedTokenBasedProposals = useReactiveVar(
    pendingTokenBasedProposalsVar
  );

  const cachedTokenBaseExecutions = useReactiveVar(
    pendingTokenBasedExecutionVar
  );
  const cachedMultisigExecutions = useReactiveVar(pendingMultisigExecutionVar);

  const getCachedProposalData = useCallback(() => {
    if (pluginType === 'multisig.plugin.dao.eth') {
      return {
        proposalCacheKey: PENDING_MULTISIG_PROPOSALS_KEY,
        proposalCacheVar: pendingMultisigProposalsVar,
        proposalCache: cachedMultisigProposals,
        proposal: cachedMultisigProposals[daoAddress]?.[proposalId.toString()],
        votes: cachedMultisigVotes,
        executions: cachedMultisigExecutions,
      };
    }

    // token voting
    return {
      proposalCacheKey: PENDING_PROPOSALS_KEY,
      proposalCacheVar: pendingTokenBasedProposalsVar,
      proposalCache: cachedTokenBasedProposals,
      proposal: cachedTokenBasedProposals[daoAddress]?.[proposalId.toString()],
      votes: cachedTokenBasedVotes,
      executions: cachedTokenBaseExecutions,
    };
  }, [
    cachedMultisigExecutions,
    cachedMultisigProposals,
    cachedMultisigVotes,
    cachedTokenBaseExecutions,
    cachedTokenBasedProposals,
    cachedTokenBasedVotes,
    daoAddress,
    pluginType,
    proposalId,
  ]);

  useEffect(() => {
    const getDaoProposal = async () => {
      const cacheData = getCachedProposalData();

      try {
        setIsLoading(true);

        const proposal = await pluginClient?.methods.getProposal(
          proposalId.makeGloballyUnique(pluginAddress)
        );

        if (proposal) {
          setData(
            // add cached executions and votes to the fetched proposal
            getAugmentedProposal(
              proposal,
              daoAddress,
              cacheData.executions,
              cacheData.votes,
              preferences?.functional
            )
          );

          // remove cached proposal if it exists
          if (cacheData.proposal) {
            const newCache = {...cacheData.proposalCache};
            delete newCache[daoAddress][proposalId.toString()];

            // update new values
            cacheData.proposalCacheVar(newCache);

            if (preferences?.functional) {
              localStorage.setItem(
                cacheData.proposalCacheKey,
                JSON.stringify(newCache, customJSONReplacer)
              );
            }
          }
        } else if (cacheData.proposal) {
          // proposal is not yet indexed but is in the cache, augment it
          // with cached votes and execution
          setData(
            getAugmentedProposal(
              cacheData.proposal as DetailedProposal,
              daoAddress,
              cacheData.executions,
              cacheData.votes,
              preferences?.functional
            )
          );
        }
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (proposalId) getDaoProposal();
  }, [
    cachedMultisigExecutions,
    cachedMultisigVotes,
    cachedTokenBaseExecutions,
    cachedTokenBasedVotes,
    daoAddress,
    getCachedProposalData,
    pluginClient?.methods,
    pluginType,
    preferences?.functional,
    proposalId,
    pluginAddress,
  ]);

  return {data, error, isLoading};
};

// extracted for readability
function getAugmentedProposal(
  proposal: DetailedProposal,
  daoAddress: string,
  cachedExecutions: PendingTokenBasedExecution | PendingMultisigExecution,
  cachedVotes: PendingTokenBasedVotes | PendingMultisigApprovals,
  functionalCookiesEnabled: boolean | undefined
): DetailedProposal {
  if (isTokenBasedProposal(proposal)) {
    return {
      ...augmentProposalWithCachedVote(
        proposal,
        daoAddress,
        cachedVotes,
        functionalCookiesEnabled
      ),

      ...augmentProposalWithCachedExecution(
        proposal,
        daoAddress,
        cachedExecutions,
        functionalCookiesEnabled,
        pendingTokenBasedExecutionVar,
        PENDING_EXECUTION_KEY
      ),
    };
  }

  return {
    ...augmentProposalWithCachedVote(
      proposal,
      daoAddress,
      cachedVotes,
      functionalCookiesEnabled
    ),
    ...augmentProposalWithCachedExecution(
      proposal,
      daoAddress,
      cachedExecutions,
      functionalCookiesEnabled,
      pendingMultisigExecutionVar,
      PENDING_MULTISIG_EXECUTION_KEY
    ),
  };
}
