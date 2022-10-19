import {useReactiveVar} from '@apollo/client';
import {
  ClientAddressList,
  ClientErc20,
  ICreateProposalParams,
  InstalledPluginListItem,
  ProposalCreationSteps,
} from '@aragon/sdk-client';
import {DaoAction} from '@aragon/sdk-client/dist/internal/interfaces/common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Loading} from 'components/temporary';
import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {
  CHAIN_METADATA,
  PENDING_PROPOSALS_KEY,
  TransactionState,
} from 'utils/constants';
import {getCanonicalUtcOffset} from 'utils/date';
import {customJSONReplacer} from 'utils/library';
import {Proposal} from 'utils/paths';
import {mapToDetailedProposal} from 'utils/proposals';
import {getTokenInfo} from 'utils/tokens';
import {Action} from 'utils/types';
import {pendingProposalsVar} from './apolloClient';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {usePrivacyContext} from './privacyContext';
import {useProviders} from './providers';

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
};

const CreateProposalProvider: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {preferences} = usePrivacyContext();

  const navigate = useNavigate();
  const {getValues} = useFormContext();

  const {infura} = useProviders();
  const {network} = useNetwork();
  const {isOnWrongNetwork, provider, address} = useWallet();

  const {data: dao, isLoading} = useDaoParam();
  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetails(dao);
  const {id: pluginType, instanceAddress: pluginAddress} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);

  const {
    data: {members},
  } = useDaoMembers(pluginAddress, pluginType as PluginTypes);

  const {data: pluginSettings} = usePluginSettings(
    pluginAddress,
    pluginType as PluginTypes
  );
  const {data: daoToken} = useDaoToken(pluginAddress);

  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType as PluginTypes);

  const [proposalCreationData, setProposalCreationData] =
    useState<ICreateProposalParams>();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  // TODO: set proposal ID when sdk returns proper id for now dummy id
  const [proposalId] = useState<string>(
    '0xd7e937b8d779de644c691857e58e3342ab322345_0x0'
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tokenSupply, setTokenSupply] = useState<bigint>();
  const cachedProposals = useReactiveVar(pendingProposalsVar);

  const shouldPoll = useMemo(
    () =>
      creationProcessState === TransactionState.WAITING &&
      proposalCreationData !== undefined,
    [creationProcessState, proposalCreationData]
  );

  /*************************************************
   *                     Effects                   *
   *************************************************/
  useEffect(() => {
    // Fetching necessary info about the token.
    async function fetchTotalSupply() {
      if (daoToken?.address)
        try {
          const {totalSupply} = await getTokenInfo(
            daoToken?.address,
            infura,
            CHAIN_METADATA[network].nativeCurrency
          );

          setTokenSupply(totalSupply);
        } catch (error) {
          console.error('Error fetching token information: ', error);
        }
    }

    fetchTotalSupply();
  }, [daoToken?.address, infura, network]);

  const encodeActions = useCallback(async () => {
    const actionsFromForm = getValues('actions');
    const actions: Array<Promise<DaoAction>> = [];

    // return an empty array for undefined clients
    if (!pluginClient || !client) return Promise.resolve([] as DaoAction[]);

    actionsFromForm.forEach((action: Action) => {
      switch (action.name) {
        case 'withdraw_assets':
          actions.push(
            client.encoding.withdrawAction(dao, {
              recipientAddress: action.to,
              amount: BigInt(Number(action.amount) * Math.pow(10, 18)),
              tokenAddress: action.tokenAddress,
            })
          );
          break;
        case 'mint_tokens':
          action.inputs.mintTokensToWallets.forEach(mint => {
            actions.push(
              Promise.resolve(
                (pluginClient as ClientErc20).encoding.mintTokenAction(
                  action.summary.daoTokenAddress as string,
                  {
                    address: mint.address,
                    amount: BigInt(Number(mint.amount) * Math.pow(10, 18)),
                  }
                )
              )
            );
          });
          break;
        case 'add_address': {
          const wallets = action.inputs.memberWallets.map(
            wallet => wallet.address
          );
          actions.push(
            Promise.resolve(
              (pluginClient as ClientAddressList).encoding.addMembersAction(
                pluginAddress,
                wallets
              )
            )
          );
          break;
        }
        case 'remove_address': {
          const wallets = action.inputs.memberWallets.map(
            wallet => wallet.address
          );
          actions.push(
            Promise.resolve(
              (pluginClient as ClientAddressList).encoding.removeMembersAction(
                pluginAddress,
                wallets
              )
            )
          );
          break;
        }
      }
    });

    return Promise.all(actions);
  }, [client, dao, getValues, pluginAddress, pluginClient]);

  // Because getValues does NOT get updated on each render, leaving this as
  // a function to be called when data is needed instead of a memoized value
  const getProposalCreationParams =
    useCallback(async (): Promise<ICreateProposalParams> => {
      const [
        title,
        summary,
        description,
        resources,
        startDate,
        startTime,
        startUtc,
        endDate,
        endTime,
        endUtc,
      ] = getValues([
        'proposalTitle',
        'proposalSummary',
        'proposal',
        'links',
        'startDate',
        'startTime',
        'startUtc',
        'endDate',
        'endTime',
        'endUtc',
      ]);

      const actions = await encodeActions();

      // Ignore encoding if the proposal had no actions
      return {
        pluginAddress,
        metadata: {
          title,
          summary,
          description,
          resources,
        },
        startDate: new Date(
          `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
        ),
        endDate: new Date(
          `${endDate}T${endTime}:00${getCanonicalUtcOffset(endUtc)}`
        ),
        actions,
      };
    }, [encodeActions, getValues, pluginAddress]);

  useEffect(() => {
    // set proposal creation data
    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING)
        setProposalCreationData(await getProposalCreationParams());
    }

    setProposalData();
  }, [creationProcessState, getProposalCreationParams, showTxModal]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const estimateCreationFees = useCallback(async () => {
    if (!pluginClient) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }
    if (!proposalCreationData) return;

    return pluginClient?.estimation.createProposal(proposalCreationData);
  }, [pluginClient, proposalCreationData]);

  const {tokenPrice, maxFee, averageFee, stopPolling} = usePollGasFee(
    estimateCreationFees,
    shouldPoll
  );

  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(generatePath(Proposal, {network, dao, id: proposalId}));
        break;
      default: {
        setCreationProcessState(TransactionState.WAITING);
        setShowTxModal(false);
        stopPolling();
      }
    }
  };

  const handlePublishProposal = async () => {
    if (!pluginClient) {
      return new Error('ERC20 SDK client is not initialized correctly');
    }

    // if no creation data is set, or transaction already running, do nothing.
    if (
      !proposalCreationData ||
      creationProcessState === TransactionState.LOADING
    ) {
      console.log('Transaction is running');
      return;
    }

    trackEvent('newProposal_createNowBtn_clicked', {
      dao_address: dao,
      estimated_gwei_fee: averageFee,
      total_usd_cost: averageFee ? tokenPrice * Number(averageFee) : 0,
    });

    const proposalIterator =
      pluginClient.methods.createProposal(proposalCreationData);

    trackEvent('newProposal_transaction_signed', {
      dao_address: dao,
      network: network,
      wallet_provider: provider?.connection.url,
    });

    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setCreationProcessState(TransactionState.LOADING);
    for await (const step of proposalIterator) {
      try {
        switch (step.key) {
          case ProposalCreationSteps.CREATING:
            console.log(step.txHash);
            break;
          case ProposalCreationSteps.DONE:
            console.log('proposal id', step.proposalId);
            // TODO: uncomment when sdk returns proper id
            // setProposalId(step.proposalId);
            setCreationProcessState(TransactionState.SUCCESS);
            trackEvent('newProposal_transaction_success', {
              dao_address: dao,
              network: network,
              wallet_provider: provider?.connection.url,
              proposalId: step.proposalId,
            });

            // cache proposal
            // TODO: use step.proposalId when sdk returns proper id
            handleCacheProposal(proposalId);
            break;
        }
      } catch (error) {
        console.error(error);
        setCreationProcessState(TransactionState.ERROR);
        trackEvent('newProposal_transaction_failed', {
          dao_address: dao,
          network: network,
          wallet_provider: provider?.connection.url,
          error,
        });
      }
    }
  };

  const handleCacheProposal = useCallback(
    (newProposalId: string) => {
      if (!address || !daoDetails || !pluginSettings || !proposalCreationData)
        return;

      const proposalData = {
        creatorAddress: address,
        daoAddress: daoDetails?.address,
        daoName: daoDetails?.metadata.name,
        daoToken,
        totalVotingWeight:
          // TODO: use token supply once RPC issue is resolved
          pluginType === 'erc20voting.dao.eth'
            ? BigInt('500000000000000000000000000')
            : members.length,
        pluginSettings,
        proposalCreationData,
        proposalId: newProposalId,
      };

      const cachedProposal = mapToDetailedProposal(proposalData);
      const newCache = {
        ...cachedProposals,
        [newProposalId]: {...cachedProposal},
      };
      pendingProposalsVar(newCache);

      // persist new cache if functional cookies enabled
      if (preferences?.functional) {
        localStorage.setItem(
          PENDING_PROPOSALS_KEY,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }
    },
    [
      address,
      cachedProposals,
      daoDetails,
      daoToken,
      members.length,
      pluginSettings,
      pluginType,
      preferences?.functional,
      proposalCreationData,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading || daoDetailsLoading) {
    return <Loading />;
  }

  return (
    <>
      {children}
      <PublishModal
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showTxModal}
        onClose={handleCloseModal}
        callback={handlePublishProposal}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        tokenPrice={tokenPrice}
        title={t('TransactionModal.createProposal')}
        buttonLabel={t('TransactionModal.createProposal')}
      />
    </>
  );
};

export {CreateProposalProvider};
