import {useReactiveVar} from '@apollo/client';
import {
  ExecuteProposalStep,
  IExecuteProposalParams,
  IVoteProposalParams,
  VoteProposalStep,
  VoteValues,
} from '@aragon/sdk-client';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {
  CHAIN_METADATA,
  PENDING_VOTES_KEY,
  TransactionState,
} from 'utils/constants';
import {customJSONReplacer, generateCachedProposalId} from 'utils/library';
import {stripPlgnAdrFromProposalId} from 'utils/proposals';
import {fetchBalance} from 'utils/tokens';
import {pendingVotesVar} from './apolloClient';
import {useNetwork} from './network';
import {usePrivacyContext} from './privacyContext';
import {useProviders} from './providers';

//TODO: currently a context, but considering there might only ever be one child,
// might need to turn it into a wrapper that passes props to proposal page
type ProposalTransactionContextType = {
  /** handles voting on proposal */
  handleSubmitVote: (vote: VoteValues, token?: string) => void;
  handleExecuteProposal: () => void;
  pluginAddress: string;
  pluginType: PluginTypes;
  isLoading: boolean;
  voteSubmitted: boolean;
  executeSubmitted: boolean;
  executionFailed: boolean;
  transactionHash: string;
};

type Props = Record<'children', ReactNode>;

/**
 * This context serves as a transaction manager for proposal
 * voting and action execution
 */
const ProposalTransactionContext =
  createContext<ProposalTransactionContextType | null>(null);

const ProposalTransactionProvider: React.FC<Props> = ({children}) => {
  const {t} = useTranslation();
  const {id} = useParams();

  const {address, isConnected} = useWallet();
  const {network} = useNetwork();
  const {infura: provider} = useProviders();

  const [tokenAddress, setTokenAddress] = useState<string>();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);

  const cachedVotes = useReactiveVar(pendingVotesVar);
  const [voteParams, setVoteParams] = useState<IVoteProposalParams>();
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [voteProcessState, setVoteProcessState] = useState<TransactionState>();

  const [executeParams, setExecuteParams] = useState<IExecuteProposalParams>();
  const [executeSubmitted, setExecuteSubmitted] = useState(false);
  const [executionFailed, setExecutionFailed] = useState(false);
  const [executeProcessState, setExecuteProcessState] =
    useState<TransactionState>();
  const [transactionHash, setTransactionHash] = useState<string>('');

  const {data: daoAddress, isLoading: paramIsLoading} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoAddress || ''
  );

  const {pluginAddress, pluginType} = useMemo(() => {
    return {
      pluginAddress: daoDetails?.plugins[0].instanceAddress || '',
      pluginType: daoDetails?.plugins[0].id as PluginTypes,
    };
  }, [daoDetails?.plugins]);

  const pluginClient = usePluginClient(
    daoDetails?.plugins[0].id as PluginTypes
  );

  const {preferences} = usePrivacyContext();

  const shouldPollVoteFees = useMemo(
    () =>
      voteParams !== undefined && voteProcessState === TransactionState.WAITING,
    [voteParams, voteProcessState]
  );

  /*************************************************
   *                    Helpers                    *
   *************************************************/
  const handleSubmitVote = useCallback(
    (vote: VoteValues, tokenAddress?: string) => {
      // id should never be null as it is required to navigate to this page
      // Also, the proposal details page (child) navigates back to not-found
      // if the id is invalid
      setVoteParams({proposalId: id!, pluginAddress, vote});

      setTokenAddress(tokenAddress);
      setShowVoteModal(true);
      setVoteProcessState(TransactionState.WAITING);
    },
    [id, pluginAddress]
  );

  // estimate voting fees
  const estimateVotingFees = useCallback(async () => {
    if (voteParams) return pluginClient?.estimation.voteProposal(voteParams);
  }, [pluginClient?.estimation, voteParams]);

  const handleExecuteProposal = useCallback(() => {
    setExecuteParams({proposalId: id!, pluginAddress});
    setShowExecuteModal(true);
    setExecuteProcessState(TransactionState.WAITING);
  }, [id, pluginAddress]);

  // estimate proposal execution fees
  const estimateExecuteFees = useCallback(async () => {
    if (executeParams)
      return pluginClient?.estimation.executeProposal(executeParams);
  }, [executeParams, pluginClient?.estimation]);

  // estimation fees for voting on proposal/executing proposal
  const {tokenPrice, maxFee, averageFee, stopPolling} = usePollGasFee(
    showExecuteModal ? estimateExecuteFees : estimateVotingFees,
    shouldPollVoteFees
  );

  // handles closing vote modal
  const handleCloseVoteModal = useCallback(() => {
    switch (voteProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        setShowVoteModal(false);

        break; // TODO: reload and cache
      default: {
        setShowVoteModal(false);
        stopPolling();
      }
    }
  }, [stopPolling, voteProcessState]);

  // set proper state and cache vote when transaction is successful
  const onVoteSubmitted = useCallback(
    async (proposalId: string, vote: VoteValues) => {
      setVoteParams(undefined);
      setVoteSubmitted(true);
      setVoteProcessState(TransactionState.SUCCESS);

      if (!address) return;

      let newCache;
      const cachedProposalId = generateCachedProposalId(daoAddress, proposalId);

      // no token address, not tokenBased proposal
      if (!tokenAddress) {
        newCache = {...cachedVotes, [cachedProposalId]: {address, vote}};
        pendingVotesVar(newCache);

        if (preferences?.functional) {
          localStorage.setItem(
            PENDING_VOTES_KEY,
            JSON.stringify(newCache, customJSONReplacer)
          );
        }
        return;
      }

      // fetch token user balance, ie vote weight
      const weight: bigint = await fetchBalance(
        tokenAddress,
        address!,
        provider,
        CHAIN_METADATA[network].nativeCurrency,
        false
      );

      newCache = {...cachedVotes, [cachedProposalId]: {address, vote, weight}};
      pendingVotesVar(newCache);
      if (preferences?.functional) {
        localStorage.setItem(
          PENDING_VOTES_KEY,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }
    },
    [
      address,
      cachedVotes,
      daoAddress,
      network,
      preferences?.functional,
      provider,
      tokenAddress,
    ]
  );

  // handles vote submission/execution
  const handleVoteExecution = useCallback(async () => {
    if (voteProcessState === TransactionState.SUCCESS) {
      handleCloseVoteModal();
      return;
    }

    if (!voteParams || voteProcessState === TransactionState.LOADING) {
      console.log('Transaction is running');
      return;
    }

    if (!pluginAddress) {
      console.error('Plugin address is required');
      return;
    }

    setVoteProcessState(TransactionState.LOADING);
    const voteSteps = pluginClient?.methods.voteProposal({
      ...voteParams,
      proposalId: stripPlgnAdrFromProposalId(voteParams.proposalId),
    });

    if (!voteSteps) {
      throw new Error('Voting function is not initialized correctly');
    }

    for await (const step of voteSteps) {
      try {
        switch (step.key) {
          case VoteProposalStep.VOTING:
            console.log(step.txHash);
            break;
          case VoteProposalStep.DONE:
            console.log(step.voteId);
            break;
        }
        onVoteSubmitted(voteParams.proposalId, voteParams.vote);
      } catch (err) {
        console.error(err);
        setVoteProcessState(TransactionState.ERROR);
      }
    }
  }, [
    handleCloseVoteModal,
    onVoteSubmitted,
    pluginAddress,
    pluginClient?.methods,
    voteParams,
    voteProcessState,
  ]);

  // handles closing execute modal
  const handleCloseExecuteModal = useCallback(() => {
    switch (executeProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        {
          setShowExecuteModal(false);
          setExecuteSubmitted(true);
        }
        break; // TODO: reload and cache
      default: {
        setShowExecuteModal(false);
        stopPolling();
      }
    }
  }, [executeProcessState, stopPolling]);

  // handles proposal execution
  const handleProposalExecution = useCallback(async () => {
    if (executeProcessState === TransactionState.SUCCESS) {
      handleCloseExecuteModal();
      return;
    }
    if (!executeParams || executeProcessState === TransactionState.LOADING) {
      console.log('Transaction is running');
      return;
    }
    if (!pluginAddress) {
      console.error('Plugin address is required');
      return;
    }
    if (!isConnected) {
      open('wallet');
      return;
    }

    setExecuteProcessState(TransactionState.LOADING);
    const executeSteps = pluginClient?.methods.executeProposal({
      ...executeParams,
      proposalId: stripPlgnAdrFromProposalId(executeParams.proposalId),
    });

    if (!executeSteps) {
      throw new Error('Voting function is not initialized correctly');
    }
    for await (const step of executeSteps) {
      try {
        switch (step.key) {
          case ExecuteProposalStep.EXECUTING:
            setTransactionHash(step.txHash);
            break;
          case ExecuteProposalStep.DONE:
            console.log(step.key);
            break;
        }
        setExecuteParams(undefined);
        setExecutionFailed(false);
        setExecuteProcessState(TransactionState.SUCCESS);
      } catch (err) {
        console.error(err);
        setExecutionFailed(true);
        setExecuteProcessState(TransactionState.ERROR);
      }
    }
  }, [
    executeParams,
    executeProcessState,
    handleCloseExecuteModal,
    isConnected,
    pluginAddress,
    pluginClient?.methods,
  ]);

  const value = useMemo(
    () => ({
      handleSubmitVote,
      handleExecuteProposal,
      isLoading: paramIsLoading || detailsAreLoading,
      pluginAddress,
      pluginType,
      voteSubmitted,
      executeSubmitted,
      executionFailed,
      transactionHash,
    }),
    [
      detailsAreLoading,
      executeSubmitted,
      executionFailed,
      handleExecuteProposal,
      handleSubmitVote,
      paramIsLoading,
      pluginAddress,
      pluginType,
      transactionHash,
      voteSubmitted,
    ]
  );
  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ProposalTransactionContext.Provider value={value}>
      {children}
      <PublishModal
        title={
          showExecuteModal
            ? t('labels.signExecuteProposal')
            : t('labels.signVote')
        }
        buttonLabel={
          showExecuteModal
            ? t('governance.proposals.buttons.execute')
            : t('governance.proposals.buttons.vote')
        }
        state={
          (showExecuteModal ? executeProcessState : voteProcessState) ||
          TransactionState.WAITING
        }
        isOpen={showVoteModal || showExecuteModal}
        onClose={
          showExecuteModal ? handleCloseExecuteModal : handleCloseVoteModal
        }
        callback={
          showExecuteModal ? handleProposalExecution : handleVoteExecution
        }
        closeOnDrag={
          showExecuteModal
            ? executeProcessState !== TransactionState.LOADING
            : voteProcessState !== TransactionState.LOADING
        }
        maxFee={maxFee}
        averageFee={averageFee}
        tokenPrice={tokenPrice}
      />
    </ProposalTransactionContext.Provider>
  );
};

function useProposalTransactionContext(): ProposalTransactionContextType {
  const context = useContext(ProposalTransactionContext);

  if (context === null) {
    throw new Error(
      'useProposalTransactionContext() can only be used on the descendants of <UseProposalTransactionProvider />'
    );
  }
  return context;
}

export {ProposalTransactionProvider, useProposalTransactionContext};
