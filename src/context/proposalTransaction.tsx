import {
  ExecuteProposalStep,
  MultisigClient,
  TokenVotingClient,
  VoteProposalParams,
  VoteProposalStep,
  VoteValues,
} from '@aragon/sdk-client';
import {useQueryClient} from '@tanstack/react-query';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {useVotingPowerAsync} from 'services/aragon-sdk/queries/use-voting-power';
import {
  AragonSdkQueryItem,
  aragonSdkQueryKeys,
} from 'services/aragon-sdk/query-keys';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {
  ExecutionDetail,
  executionStorage,
  voteStorage,
} from 'utils/localStorage';
import {ProposalId} from 'utils/types';
import {useNetwork} from './network';
import {useProviders} from './providers';

//TODO: currently a context, but considering there might only ever be one child,
// might need to turn it into a wrapper that passes props to proposal page
type SubmitVoteParams = {
  vote: VoteValues;
  token?: string;
  replacement?: boolean;
};

type ProposalTransactionContextType = {
  /** handles voting on proposal */
  handleSubmitVote: (params: SubmitVoteParams) => void;
  handleExecuteProposal: () => void;
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
  const {id: urlId} = useParams();

  const {address, isConnected} = useWallet();
  const {network} = useNetwork();
  const queryClient = useQueryClient();
  const {api: provider} = useProviders();
  const fetchVotingPower = useVotingPowerAsync();

  const [tokenAddress, setTokenAddress] = useState<string>();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);

  const [voteParams, setVoteParams] = useState<VoteProposalParams>();
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [replacingVote, setReplacingVote] = useState(false);
  const [voteProcessState, setVoteProcessState] = useState<TransactionState>();

  const [executeProposalId, setExecuteProposalId] = useState<ProposalId>();
  const [executeSubmitted, setExecuteSubmitted] = useState(false);
  const [executionFailed, setExecutionFailed] = useState(false);
  const [executeProcessState, setExecuteProcessState] =
    useState<TransactionState>();
  const [transactionHash, setTransactionHash] = useState<string>('');

  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  const {pluginAddress, pluginType} = useMemo(() => {
    return {
      pluginAddress: daoDetails?.plugins[0].instanceAddress || '',
      pluginType: daoDetails?.plugins[0].id as PluginTypes,
    };
  }, [daoDetails?.plugins]);

  const pluginClient = usePluginClient(
    daoDetails?.plugins[0].id as PluginTypes
  );

  const shouldPollVoteFees = useMemo(
    () =>
      (voteParams !== undefined &&
        voteProcessState === TransactionState.WAITING) ||
      (executeProposalId !== undefined &&
        executeProcessState === TransactionState.WAITING),
    [executeProposalId, executeProcessState, voteParams, voteProcessState]
  );

  const shouldDisableCallback = useMemo(() => {
    if (
      voteProcessState === TransactionState.SUCCESS ||
      executeProcessState === TransactionState.SUCCESS
    )
      return false;

    return !(voteParams || executeProposalId);
  }, [executeProcessState, executeProposalId, voteParams, voteProcessState]);

  /*************************************************
   *                    Helpers                    *
   *************************************************/
  const invalidateProposalQueries = useCallback(() => {
    const allProposalsQuery = [AragonSdkQueryItem.PROPOSALS];
    const currentProposal = aragonSdkQueryKeys.proposal({
      id: new ProposalId(urlId!).export(),
      pluginType,
    });

    queryClient.invalidateQueries(allProposalsQuery);
    queryClient.invalidateQueries(currentProposal);
  }, [pluginType, queryClient, urlId]);

  const handleSubmitVote = useCallback(
    (params: SubmitVoteParams) => {
      // id should never be null as it is required to navigate to this page
      // Also, the proposal details page (child) navigates back to not-found
      // if the id is invalid
      setVoteParams({
        proposalId: new ProposalId(urlId!).export(),
        vote: params.vote,
      });

      setReplacingVote(!!params.replacement);
      setTokenAddress(params.token);
      setShowVoteModal(true);
      setVoteProcessState(TransactionState.WAITING);
    },
    [urlId]
  );

  // estimate voting fees
  const estimateVotingFees = useCallback(async () => {
    if (voteParams) {
      if (tokenAddress) {
        return (pluginClient as TokenVotingClient)?.estimation.voteProposal({
          ...voteParams,
          proposalId: voteParams.proposalId,
        });
      }

      return (pluginClient as MultisigClient)?.estimation.approveProposal({
        proposalId: voteParams.proposalId,
        tryExecution: false,
      });
    }
  }, [pluginClient, tokenAddress, voteParams]);

  const handleExecuteProposal = useCallback(() => {
    setExecuteProposalId(new ProposalId(urlId!));
    setShowExecuteModal(true);
    setExecuteProcessState(TransactionState.WAITING);
  }, [urlId]);

  // estimate proposal execution fees
  const estimateExecuteFees = useCallback(async () => {
    if (executeProposalId) {
      if (tokenAddress) {
        return (pluginClient as TokenVotingClient)?.estimation.executeProposal(
          executeProposalId.export()
        );
      }
      return (pluginClient as MultisigClient)?.estimation.executeProposal(
        executeProposalId.export()
      );
    }
  }, [executeProposalId, pluginClient, tokenAddress]);

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
    async (
      proposalId: ProposalId,
      vote: VoteValues,
      voteReplaced?: boolean
    ) => {
      if (!daoDetails?.address) return;

      setVoteParams(undefined);
      setReplacingVote(false);
      setVoteSubmitted(true);
      setVoteProcessState(TransactionState.SUCCESS);

      if (!address) return;

      let voteToPersist;

      // cache multisig vote
      if (pluginType === 'multisig.plugin.dao.eth') {
        voteToPersist = address.toLowerCase();
      }

      // cache token voting vote
      if (pluginType === 'token-voting.plugin.dao.eth' && tokenAddress) {
        // fetch token user balance, ie vote weight
        const weight = await fetchVotingPower({tokenAddress, address});
        voteToPersist = {
          address: address.toLowerCase(),
          vote,
          weight: weight.toBigInt(),
          voteReplaced: !!voteReplaced,
        };
      }

      if (voteToPersist) {
        voteStorage.addVote(
          CHAIN_METADATA[network].id,
          proposalId.toString(),
          voteToPersist
        );
      }

      invalidateProposalQueries();
    },
    [
      address,
      daoDetails?.address,
      fetchVotingPower,
      invalidateProposalQueries,
      network,
      pluginType,
      tokenAddress,
    ]
  );

  // set proper state and cache proposal execution when transaction is successful
  const onExecutionSubmitted = useCallback(
    async (proposalId: ProposalId, txHash: string) => {
      if (!address || !daoDetails?.address) return;

      // get current block number
      const executionBlockNumber = await provider.getBlockNumber();

      // details to be cached
      const executionDetails: ExecutionDetail = {
        executionBlockNumber,
        executionDate: new Date(),
        executionTxHash: txHash,
      };

      // add execution detail to local storage
      executionStorage.addExecutionDetail(
        CHAIN_METADATA[network].id,
        proposalId.toString(),
        executionDetails
      );

      // invalidate proposal queries to either pick
      // up cached values or remove them
      invalidateProposalQueries();
    },
    [address, daoDetails?.address, invalidateProposalQueries, network, provider]
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
        proposalId: voteParams.proposalId,
        tryExecution: false,
      });
    } else {
      voteSteps = (pluginClient as TokenVotingClient)?.methods.voteProposal({
        ...voteParams,
        proposalId: voteParams.proposalId,
      });
    }

    if (!voteSteps) {
      throw new Error('Voting function is not initialized correctly');
    }

    // clear up previous submission state
    setVoteSubmitted(false);

    try {
      for await (const step of voteSteps) {
        switch (step.key) {
          case VoteProposalStep.VOTING:
            console.log(step.txHash);
            break;
          case VoteProposalStep.DONE:
            onVoteSubmitted(
              new ProposalId(voteParams.proposalId),
              voteParams.vote,
              replacingVote
            );
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
    replacingVote,
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
    if (
      !executeProposalId ||
      executeProcessState === TransactionState.LOADING
    ) {
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

    let executeSteps;
    if (tokenAddress) {
      executeSteps = (
        pluginClient as TokenVotingClient
      )?.methods.executeProposal(executeProposalId.export());
    } else {
      executeSteps = (pluginClient as MultisigClient)?.methods.executeProposal(
        executeProposalId.export()
      );
    }

    if (!executeSteps) {
      throw new Error('Voting function is not initialized correctly');
    }

    try {
      let txHash = '';

      for await (const step of executeSteps) {
        switch (step.key) {
          case ExecuteProposalStep.EXECUTING:
            setTransactionHash(step.txHash);
            txHash = step.txHash;
            break;
          case ExecuteProposalStep.DONE:
            setExecuteProposalId(undefined);
            setExecutionFailed(false);
            setExecuteProcessState(TransactionState.SUCCESS);
            onExecutionSubmitted(executeProposalId, txHash);
            break;
        }
      }
    } catch (err) {
      console.error(err);
      setExecutionFailed(true);
      setExecuteProcessState(TransactionState.ERROR);
    }
  }, [
    executeProposalId,
    executeProcessState,
    handleCloseExecuteModal,
    isConnected,
    onExecutionSubmitted,
    pluginAddress,
    pluginClient,
    tokenAddress,
  ]);

  const value = useMemo(
    () => ({
      handleSubmitVote,
      handleExecuteProposal,
      isLoading,
      voteSubmitted,
      executeSubmitted,
      executionFailed,
      transactionHash,
    }),
    [
      isLoading,
      executeSubmitted,
      executionFailed,
      handleExecuteProposal,
      handleSubmitVote,
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
        disabledCallback={shouldDisableCallback}
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
