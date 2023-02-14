import {useReactiveVar} from '@apollo/client';
import {
  ExecuteProposalStep,
  IExecuteProposalParams,
  IVoteProposalParams,
  MultisigClient,
  TokenVotingClient,
  VoteProposalStep,
  VoteValues,
} from '@aragon/sdk-client';
import {BigNumber} from 'ethers';
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
  PENDING_EXECUTION_KEY,
  PENDING_MULTISIG_VOTES_KEY,
  PENDING_VOTES_KEY,
  TransactionState,
} from 'utils/constants';
import {customJSONReplacer, generateCachedProposalId} from 'utils/library';
import {stripPlgnAdrFromProposalId} from 'utils/proposals';
import {fetchBalance} from 'utils/tokens';
import {
  pendingExecutionVar,
  pendingMultisigVotesVar,
  pendingTokenBasedVotesVar,
} from './apolloClient';
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

  const cachedExecution = useReactiveVar(pendingExecutionVar);
  const cachedMultisigVotes = useReactiveVar(pendingMultisigVotesVar);
  const cachedTokenBasedVotes = useReactiveVar(pendingTokenBasedVotesVar);

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
      (voteParams !== undefined &&
        voteProcessState === TransactionState.WAITING) ||
      (executeParams !== undefined &&
        executeProcessState === TransactionState.WAITING),
    [executeParams, executeProcessState, voteParams, voteProcessState]
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
    if (voteParams) {
      if (tokenAddress) {
        return (pluginClient as TokenVotingClient)?.estimation.voteProposal({
          ...voteParams,
          proposalId: stripPlgnAdrFromProposalId(voteParams.proposalId),
        });
      }

      return (pluginClient as MultisigClient)?.estimation.approveProposal({
        pluginAddress: voteParams.pluginAddress,
        proposalId: BigInt(stripPlgnAdrFromProposalId(voteParams.proposalId)),
        tryExecution: false,
      });
    }
  }, [pluginClient, tokenAddress, voteParams]);

  const handleExecuteProposal = useCallback(() => {
    setExecuteParams({proposalId: id!, pluginAddress});
    setShowExecuteModal(true);
    setExecuteProcessState(TransactionState.WAITING);
  }, [id, pluginAddress]);

  // estimate proposal execution fees
  const estimateExecuteFees = useCallback(async () => {
    if (executeParams)
      // TODO: Handle multisig and token voting case
      return pluginClient?.estimation.executeProposal({
        ...executeParams,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        proposalId: stripPlgnAdrFromProposalId(executeParams.proposalId),
      });
  }, [executeParams, pluginClient?.estimation]);

  // estimation fees for voting on proposal/executing proposal
  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(
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
        break;
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

      // cache multisig vote
      if (pluginType === 'multisig.plugin.dao.eth') {
        newCache = {
          ...cachedMultisigVotes,
          [cachedProposalId]: address,
        };
        pendingMultisigVotesVar(newCache);

        if (preferences?.functional) {
          localStorage.setItem(
            PENDING_MULTISIG_VOTES_KEY,
            JSON.stringify(newCache, customJSONReplacer)
          );
        }
        return;
      }

      // cache token voting vote
      if (pluginType === 'token-voting.plugin.dao.eth' && tokenAddress) {
        // fetch token user balance, ie vote weight
        const weight: BigNumber = await fetchBalance(
          tokenAddress,
          address!,
          provider,
          CHAIN_METADATA[network].nativeCurrency,
          false
        );

        newCache = {
          ...cachedTokenBasedVotes,
          [cachedProposalId]: {address, vote, weight: weight.toBigInt()},
        };
        pendingTokenBasedVotesVar(newCache);

        if (preferences?.functional) {
          localStorage.setItem(
            PENDING_VOTES_KEY,
            JSON.stringify(newCache, customJSONReplacer)
          );
        }
      }
    },
    [
      address,
      cachedMultisigVotes,
      cachedTokenBasedVotes,
      daoAddress,
      network,
      pluginType,
      preferences?.functional,
      provider,
      tokenAddress,
    ]
  );

  // set proper state and cache proposal execution when transaction is successful
  const onExecutionSubmitted = useCallback(
    async (proposalId: string) => {
      if (!address) return;

      const cachedProposalId = generateCachedProposalId(daoAddress, proposalId);

      const newCache = {
        ...cachedExecution,
        [cachedProposalId]: true,
      };
      pendingExecutionVar(newCache);

      if (preferences?.functional) {
        localStorage.setItem(
          PENDING_EXECUTION_KEY,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }
    },
    [address, cachedExecution, daoAddress, preferences?.functional]
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

    let voteSteps;

    if (!tokenAddress) {
      voteSteps = (pluginClient as MultisigClient)?.methods.approveProposal({
        pluginAddress: voteParams.pluginAddress,
        proposalId: BigInt(stripPlgnAdrFromProposalId(voteParams.proposalId)),
        tryExecution: false,
      });
    } else {
      voteSteps = (pluginClient as TokenVotingClient)?.methods.voteProposal({
        ...voteParams,
        proposalId: stripPlgnAdrFromProposalId(voteParams.proposalId),
      });
    }

    if (!voteSteps) {
      throw new Error('Voting function is not initialized correctly');
    }

    try {
      for await (const step of voteSteps) {
        switch (step.key) {
          case VoteProposalStep.VOTING:
            console.log(step.txHash);
            break;
          case VoteProposalStep.DONE:
            onVoteSubmitted(voteParams.proposalId, voteParams.vote);
            break;
        }
      }
    } catch (err) {
      console.error(err);
      setVoteProcessState(TransactionState.ERROR);
    }
  }, [
    handleCloseVoteModal,
    onVoteSubmitted,
    pluginAddress,
    pluginClient,
    tokenAddress,
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
    // TODO: Handle multisig and token voting case
    const executeSteps = pluginClient?.methods.executeProposal({
      ...executeParams,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      proposalId: stripPlgnAdrFromProposalId(executeParams.proposalId),
    });

    if (!executeSteps) {
      throw new Error('Voting function is not initialized correctly');
    }

    try {
      for await (const step of executeSteps) {
        switch (step.key) {
          case ExecuteProposalStep.EXECUTING:
            setTransactionHash(step.txHash);
            break;
          case ExecuteProposalStep.DONE:
            console.log(step.key);
            setExecuteParams(undefined);
            setExecutionFailed(false);
            setExecuteProcessState(TransactionState.SUCCESS);
            onExecutionSubmitted(executeParams.proposalId);
            break;
        }
      }
    } catch (err) {
      console.error(err);
      setExecutionFailed(true);
      setExecuteProcessState(TransactionState.ERROR);
    }
  }, [
    executeParams,
    executeProcessState,
    handleCloseExecuteModal,
    isConnected,
    onExecutionSubmitted,
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
        gasEstimationError={gasEstimationError}
        disabledCallback={!(voteParams || executeParams)}
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
