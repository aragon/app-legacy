import {useReactiveVar} from '@apollo/client';
import {useEffect, useState} from 'react';

import {
  PendingMultisigApprovals,
  pendingMultisigApprovalsVar,
  PendingMultisigExecution,
  pendingMultisigExecutionVar,
  pendingProposalsVar,
  PendingTokenBasedExecution,
  pendingTokenBasedExecutionVar,
  PendingTokenBasedVotes,
  pendingTokenBasedVotesVar,
} from 'context/apolloClient';
import {usePrivacyContext} from 'context/privacyContext';
import {
  PENDING_EXECUTION_KEY,
  PENDING_MULTISIG_EXECUTION_KEY,
  PENDING_PROPOSALS_KEY,
} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';
import {
  augmentProposalWithCachedExecution,
  augmentProposalWithCachedVote,
  isTokenBasedProposal,
} from 'utils/proposals';
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

  const cachedTokenBaseExecutions = useReactiveVar(
    pendingTokenBasedExecutionVar
  );
  const cachedMultisigExecutions = useReactiveVar(pendingMultisigExecutionVar);

  useEffect(() => {
    const getDaoProposal = async () => {
      try {
        setIsLoading(true);

        const cachedProposal = proposalCache[daoAddress]?.[proposalId];
        let cachedVotes;
        let cachedExecutions;

        if (pluginType === 'multisig.plugin.dao.eth') {
          cachedVotes = cachedMultisigVotes;
          cachedExecutions = cachedMultisigExecutions;
        } else {
          cachedVotes = cachedTokenBasedVotes;
          cachedExecutions = cachedTokenBaseExecutions;
        }

        const proposal = await pluginClient?.methods.getProposal(proposalId);
        if (proposal) {
          setData(
            getAugmentedProposal(
              proposal,
              daoAddress,
              cachedExecutions,
              cachedVotes,
              preferences?.functional
            )
          );

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
          setData(
            getAugmentedProposal(
              cachedProposal as DetailedProposal,
              daoAddress,
              cachedExecutions,
              cachedVotes,
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
    pluginClient?.methods,
    pluginType,
    preferences?.functional,
    proposalCache,
    proposalId,
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
