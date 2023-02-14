import {useReactiveVar} from '@apollo/client';
import {useEffect, useState} from 'react';

import {
  pendingMultisigApprovalsVar,
  pendingMultisigExecutionVar,
  pendingProposalsVar,
  pendingTokenBasedExecutionVar,
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
        let augmentedProposal;

        if (pluginType === 'multisig.plugin.dao.eth') {
          cachedVotes = cachedMultisigVotes;
        } else {
          cachedVotes = cachedTokenBasedVotes;
        }

        const proposal = await pluginClient?.methods.getProposal(proposalId);
        if (proposal) {
          augmentedProposal = {
            ...augmentProposalWithCachedVote(
              proposal,
              daoAddress,
              cachedVotes,
              preferences?.functional
            ),
            ...(isTokenBasedProposal(proposal)
              ? augmentProposalWithCachedExecution(
                  proposal,
                  daoAddress,
                  cachedTokenBaseExecutions,
                  preferences?.functional,
                  pendingTokenBasedExecutionVar,
                  PENDING_EXECUTION_KEY
                )
              : augmentProposalWithCachedExecution(
                  proposal,
                  daoAddress,
                  cachedMultisigExecutions,
                  preferences?.functional,
                  pendingMultisigExecutionVar,
                  PENDING_MULTISIG_EXECUTION_KEY
                )),
          };
          setData(augmentedProposal);

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
          augmentedProposal = {
            ...augmentProposalWithCachedVote(
              cachedProposal as DetailedProposal,
              daoAddress,
              cachedVotes,
              preferences?.functional
            ),
            ...(isTokenBasedProposal(cachedProposal)
              ? augmentProposalWithCachedExecution(
                  cachedProposal,
                  daoAddress,
                  cachedTokenBaseExecutions,
                  preferences?.functional,
                  pendingTokenBasedExecutionVar,
                  PENDING_EXECUTION_KEY
                )
              : augmentProposalWithCachedExecution(
                  cachedProposal as DetailedProposal,
                  daoAddress,
                  cachedMultisigExecutions,
                  preferences?.functional,
                  pendingMultisigExecutionVar,
                  PENDING_MULTISIG_EXECUTION_KEY
                )),
          };
          setData(augmentedProposal);
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
