import {useReactiveVar} from '@apollo/client';
import {VoteProposalStep, VoteValues} from '@aragon/sdk-client';
import {IVoteProposalParams} from '@aragon/sdk-client/dist/internal/interfaces/plugins';
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
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {fetchBalance} from 'utils/tokens';
import {pendingVotesVar} from './apolloClient';
import {useNetwork} from './network';
import {useProviders} from './providers';

//TODO: currently a context, but considering there might only ever be one child,
// might need to turn it into a wrapper that passes props to proposal page
type ProposalTransactionContextType = {
  /** handles voting on proposal */
  handleSubmitVote: (vote: VoteValues, token?: string) => void;
  pluginAddress: string;
  pluginType: PluginTypes;
  isLoading: boolean;
  voteSubmitted: boolean;
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

  const {address} = useWallet();
  const {network} = useNetwork();
  const {infura: provider} = useProviders();

  const [tokenAddress, setTokenAddress] = useState<string>();
  const [showVoteModal, setShowVoteModal] = useState(false);

  const cachedVotes = useReactiveVar(pendingVotesVar);
  const [voteParams, setVoteParams] = useState<IVoteProposalParams>();
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [voteProcessState, setVoteProcessState] = useState<TransactionState>();

  const {data: daoId, isLoading: paramIsLoading} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId || ''
  );

  const {pluginAddress, pluginType} = useMemo(() => {
    return {
      pluginAddress: daoDetails?.plugins[0].instanceAddress || '',
      pluginType: daoDetails?.plugins[0].id as PluginTypes,
    };
  }, [daoDetails?.plugins]);

  const pluginClient = usePluginClient(
    pluginAddress,
    daoDetails?.plugins[0].id as PluginTypes
  );

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

  // estimation fees for voting on proposal
  const {tokenPrice, maxFee, averageFee, stopPolling} = usePollGasFee(
    estimateVotingFees,
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

      // no token address, not tokenBased proposal
      if (!tokenAddress) {
        pendingVotesVar({...cachedVotes, [proposalId]: {address, vote}});
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

      pendingVotesVar({...cachedVotes, [proposalId]: {address, vote, weight}});
    },
    [address, cachedVotes, network, provider, tokenAddress]
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
    const voteSteps = pluginClient?.methods.voteProposal(voteParams);

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

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ProposalTransactionContext.Provider
      value={{
        handleSubmitVote,
        isLoading: paramIsLoading || detailsAreLoading,
        pluginAddress,
        pluginType,
        voteSubmitted,
      }}
    >
      {children}
      <PublishModal
        title={t('labels.signVote')}
        state={voteProcessState || TransactionState.WAITING}
        isOpen={showVoteModal}
        onClose={handleCloseVoteModal}
        buttonLabel={t('governance.proposals.buttons.vote')}
        callback={handleVoteExecution}
        closeOnDrag={voteProcessState !== TransactionState.LOADING}
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
