import {
  ApproveMultisigProposalParams,
  VoteProposalParams,
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

import PublishModal, {
  TransactionStateLabels,
} from 'containers/transactionModals/publishModal';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {
  GaslessPluginName,
  PluginTypes,
  isGaslessVotingClient,
  isMultisigClient,
  isTokenVotingClient,
  usePluginClient,
} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {useVotingPowerAsync} from 'services/aragon-sdk/queries/use-voting-power';
import {
  AragonSdkQueryItem,
  aragonSdkQueryKeys,
} from 'services/aragon-sdk/query-keys';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {voteStorage} from 'utils/localStorage';
import {ProposalId} from 'utils/types';
import GaslessVotingModal from '../containers/transactionModals/gaslessVotingModal';
import {GaslessVoteOrApprovalVote} from '../services/aragon-sdk/selectors';
import {useNetwork} from './network';

type ProposalTransactionContextType = {
  /** handles voting on proposal */
  handleExecutionMultisigApprove: (
    params: ApproveMultisigProposalParams
  ) => void;
  handleGaslessVoting: (params: SubmitVoteParams) => void;
  isLoading: boolean;
  voteOrApprovalSubmitted: boolean;
};

type SubmitVoteParams = {
  vote: VoteValues;
  voteTokenAddress?: string;
  replacement?: boolean;
};

type Props = Record<'children', ReactNode>;

/**
 * This context serves as a transaction manager for proposal
 * voting and action execution.
 * Note: Break this up when new plugin is added
 */
const ProposalTransactionContext =
  createContext<ProposalTransactionContextType | null>(null);

const ProposalTransactionProvider: React.FC<Props> = ({children}) => {
  const {t} = useTranslation();
  const {id: urlId} = useParams();
  const proposalId = new ProposalId(urlId!).export();

  const {address} = useWallet();
  const {network} = useNetwork();
  const queryClient = useQueryClient();
  const fetchVotingPower = useVotingPowerAsync();
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  // state values
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showGaslessModal, setShowGaslessModal] = useState(false);
  const [voteTokenAddress, setVoteTokenAddress] = useState<string>();
  const [showCommitteeApprovalModal, setShowCommitteeApprovalModal] =
    useState(false);

  const [voteParams, setVoteParams] = useState<VoteProposalParams>();
  const [approvalParams, setApprovalParams] =
    useState<ApproveMultisigProposalParams>();

  const [voteOrApprovalSubmitted, setVoteOrApprovalSubmitted] = useState(false);
  const [voteOrApprovalProcessState, setVoteOrApprovalProcessState] =
    useState<TransactionState>();

  const [executionTxHash] = useState<string>('');

  const pluginType = daoDetails?.plugins[0].id as PluginTypes;
  const pluginClient = usePluginClient(pluginType);

  const isMultisigPluginClient =
    !!pluginClient && isMultisigClient(pluginClient);
  const isTokenVotingPluginClient =
    !!pluginClient && isTokenVotingClient(pluginClient);
  const isGaslessVotingPluginClient =
    !!pluginClient && isGaslessVotingClient(pluginClient);

  const isWaitingForVoteOrApproval =
    (voteParams != null || approvalParams != null) &&
    voteOrApprovalProcessState === TransactionState.WAITING;

  const notInSuccessState =
    voteOrApprovalProcessState !== TransactionState.SUCCESS;

  const noActionsPending = !voteParams && !approvalParams && !proposalId;

  const shouldPollFees = isWaitingForVoteOrApproval;
  const shouldDisableModalCta = noActionsPending && notInSuccessState;

  /*************************************************
   *              Prepare Transactions             *
   *************************************************/

  const handleExecutionMultisigApprove = useCallback(
    (params: ApproveMultisigProposalParams) => {
      setApprovalParams(params);
      setShowCommitteeApprovalModal(true);
      setVoteOrApprovalProcessState(TransactionState.WAITING);
    },
    []
  );

  const handleGaslessVoting = useCallback(
    (params: SubmitVoteParams) => {
      setVoteParams({proposalId, vote: params.vote});
      setVoteTokenAddress(params.voteTokenAddress);
      setShowGaslessModal(true);
    },
    [proposalId]
  );

  /*************************************************
   *                  Estimations                  *
   *************************************************/
  const estimateVoteOrApprovalFees = useCallback(async () => {
    if (isGaslessVotingPluginClient && approvalParams) {
      return pluginClient?.estimation.approve(
        approvalParams.proposalId,
        approvalParams.tryExecution
      );
    }

    if (isTokenVotingPluginClient && voteParams && voteTokenAddress) {
      return pluginClient.estimation.voteProposal(voteParams);
    }

    if (isMultisigPluginClient && approvalParams) {
      return pluginClient.estimation.approveProposal(approvalParams);
    }
  }, [
    approvalParams,
    isMultisigPluginClient,
    isTokenVotingPluginClient,
    pluginClient,
    voteTokenAddress,
    voteParams,
    isGaslessVotingPluginClient,
  ]);

  // estimation fees for voting on proposal/executing proposal
  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateVoteOrApprovalFees, shouldPollFees);

  /*************************************************
   *               Cleanup & Cache                 *
   *************************************************/
  const invalidateProposalQueries = useCallback(() => {
    const allProposalsQuery = [AragonSdkQueryItem.PROPOSALS];
    const currentProposal = aragonSdkQueryKeys.proposal({
      id: proposalId,
      pluginType,
    });

    queryClient.invalidateQueries({
      queryKey: allProposalsQuery,
    });
    queryClient.invalidateQueries({queryKey: currentProposal});
  }, [pluginType, proposalId, queryClient]);

  const onGaslessVoteOrApprovalSubmitted = useCallback(
    async (proposalId: string, vote?: VoteValues) => {
      setVoteParams(undefined);
      setVoteOrApprovalSubmitted(true);
      setVoteOrApprovalProcessState(TransactionState.SUCCESS);

      if (!address) return;

      let voteToPersist;
      if (pluginType === GaslessPluginName) {
        if (vote && voteTokenAddress != null) {
          const weight = await fetchVotingPower({
            tokenAddress: voteTokenAddress,
            address,
          });
          voteToPersist = {
            type: 'gaslessVote',
            vote: {
              address: address.toLowerCase(),
              vote,
              weight: weight.toBigInt(),
            },
          } as GaslessVoteOrApprovalVote;
        } else {
          voteToPersist = {
            type: 'approval',
            vote: address.toLowerCase(),
          } as GaslessVoteOrApprovalVote;
        }
      }

      if (voteToPersist) {
        voteStorage.addVote(
          CHAIN_METADATA[network].id,
          proposalId.toString(),
          voteToPersist
        );
      }
    },
    [address, fetchVotingPower, network, pluginType, voteTokenAddress]
  );

  // handles closing vote/approval modal
  const handleCloseVoteModal = useCallback(() => {
    switch (voteOrApprovalProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        setShowVoteModal(false);
        invalidateProposalQueries();

        setShowCommitteeApprovalModal(false);
        break;
      default: {
        setShowVoteModal(false);
        setShowCommitteeApprovalModal(false);
        stopPolling();
      }
    }
  }, [invalidateProposalQueries, stopPolling, voteOrApprovalProcessState]);

  /*************************************************
   *              Submit Transactions              *
   *************************************************/

  const value = useMemo(
    () => ({
      handleExecutionMultisigApprove,
      handleGaslessVoting,
      isLoading,
      voteOrApprovalSubmitted,
      executionTxHash,
      approvalParams,
      voteParams,
    }),
    [
      handleExecutionMultisigApprove,
      handleGaslessVoting,
      isLoading,
      voteOrApprovalSubmitted,
      executionTxHash,
      approvalParams,
      voteParams,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  const state = voteOrApprovalProcessState ?? TransactionState.WAITING;

  let title = t('labels.signVote');

  const labels: TransactionStateLabels = {
    [TransactionState.WAITING]: t('governance.proposals.buttons.vote'),
  };

  if (
    pluginType === 'multisig.plugin.dao.eth' ||
    pluginType === GaslessPluginName
  ) {
    title = t('transactionModal.multisig.title.approveProposal');
    labels.WAITING = t('transactionModal.multisig.ctaApprove');
    labels.LOADING = t('transactionModal.multisig.ctaWaitingConfirmation');
    labels.SUCCESS = t('transactionModal.multisig.ctaContinueProposal');

    if (approvalParams?.tryExecution) {
      title = t('transactionModal.multisig.title.approveExecute');
      labels.WAITING = t('transactionModal.multisig.ctaApproveExecute');
    }
  }

  const isOpen = showVoteModal || showCommitteeApprovalModal;

  return (
    <ProposalTransactionContext.Provider value={value}>
      {children}
      <GaslessVotingModal
        vote={voteParams}
        setShowVoteModal={setShowGaslessModal}
        showVoteModal={showGaslessModal}
        setVoteSubmitted={setVoteOrApprovalSubmitted}
        onVoteSubmitted={onGaslessVoteOrApprovalSubmitted}
        invalidateProposalQueries={invalidateProposalQueries}
      />
      <PublishModal
        title={title}
        buttonStateLabels={labels}
        state={state}
        isOpen={isOpen}
        onClose={handleCloseVoteModal}
        callback={() => null}
        closeOnDrag={voteOrApprovalProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        tokenPrice={tokenPrice}
        gasEstimationError={gasEstimationError}
        disabledCallback={shouldDisableModalCta}
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
