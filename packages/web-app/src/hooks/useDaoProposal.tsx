import {useReactiveVar} from '@apollo/client';
import {useCallback, useEffect, useState} from 'react';

import {
  PendingMultisigApprovals,
  pendingMultisigApprovalsVar,
  PendingMultisigExecution,
  pendingMultisigExecutionVar,
  pendingMultisigProposalsVar,
  PendingTokenBasedExecution,
  pendingTokenBasedExecutionVar,
  pendingTokenBasedProposalsVar,
  PendingTokenBasedVotes,
  pendingTokenBasedVotesVar,
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
  isMultisigProposal,
  isTokenBasedProposal,
} from 'utils/proposals';
import {DetailedProposal, HookData, ProposalId} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';

/**
 * Retrieve a single detailed proposal
 * @param daoAddress address used to create unique proposal id
 * @param proposalId id of proposal to retrieve
 * @param pluginType plugin type
 * @param pluginAddress plugin address
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

  const cachedMultisigExecutions = useReactiveVar(pendingMultisigExecutionVar);
  const cachedTokenBaseExecutions = useReactiveVar(
    pendingTokenBasedExecutionVar
  );

  const proposalGuid = proposalId.makeGloballyUnique(pluginAddress);

  // return cache keys and variables based on the type of plugin;
  const getCachedProposalData = useCallback(() => {
    if (pluginType === 'multisig.plugin.dao.eth') {
      return {
        proposalCacheKey: PENDING_MULTISIG_PROPOSALS_KEY,
        proposalCacheVar: pendingMultisigProposalsVar,
        proposalCache: cachedMultisigProposals,
        proposal: cachedMultisigProposals[daoAddress]?.[proposalGuid],
        votes: cachedMultisigVotes,
        executions: cachedMultisigExecutions,
      };
    }

    // token voting
    if (pluginType === 'token-voting.plugin.dao.eth') {
      return {
        proposalCacheKey: PENDING_PROPOSALS_KEY,
        proposalCacheVar: pendingTokenBasedProposalsVar,
        proposalCache: cachedTokenBasedProposals,
        proposal: cachedTokenBasedProposals[daoAddress]?.[proposalGuid],
        votes: cachedTokenBasedVotes,
        executions: cachedTokenBaseExecutions,
      };
    }
  }, [
    cachedMultisigExecutions,
    cachedMultisigProposals,
    cachedMultisigVotes,
    cachedTokenBaseExecutions,
    cachedTokenBasedProposals,
    cachedTokenBasedVotes,
    daoAddress,
    pluginType,
    proposalGuid,
  ]);

  useEffect(() => {
    const getDaoProposal = async () => {
      const cacheData = getCachedProposalData();

      try {
        setIsLoading(true);

        const proposal = await pluginClient?.methods.getProposal(proposalGuid);

        if (proposal && cacheData) {
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
            delete newCache[daoAddress][proposalGuid];

            // update new values
            cacheData.proposalCacheVar(newCache);

            if (preferences?.functional) {
              localStorage.setItem(
                cacheData.proposalCacheKey,
                JSON.stringify(newCache, customJSONReplacer)
              );
            }
          }
        } else if (cacheData?.proposal) {
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

    if (proposalGuid) getDaoProposal();
  }, [
    daoAddress,
    getCachedProposalData,
    pluginClient?.methods,
    pluginType,
    preferences?.functional,
    proposalGuid,
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
      ...augmentProposalWithCachedExecution(
        augmentProposalWithCachedVote(
          proposal,
          daoAddress,
          cachedVotes,
          functionalCookiesEnabled
        ) as DetailedProposal,
        daoAddress,
        cachedExecutions,
        functionalCookiesEnabled,
        pendingTokenBasedExecutionVar,
        PENDING_EXECUTION_KEY
      ),
    };
  }

  if (isMultisigProposal(proposal)) {
    return {
      ...augmentProposalWithCachedExecution(
        augmentProposalWithCachedVote(
          proposal,
          daoAddress,
          cachedVotes,
          functionalCookiesEnabled
        ) as DetailedProposal,
        daoAddress,
        cachedExecutions,
        functionalCookiesEnabled,
        pendingMultisigExecutionVar,
        PENDING_MULTISIG_EXECUTION_KEY
      ),
    };
  }

  return proposal;
}
