import {useQuery} from '@apollo/client';
import {ICreateProposalParams} from '@aragon/sdk-client';
import React, {useCallback, useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Loading} from 'components/temporary';
import PublishModal from 'containers/transactionModals/publishModal';
import {useDaoParam} from 'hooks/useDaoParam';
import {usePluginClient} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {DAO_BY_ADDRESS} from 'queries/dao';
import {TransactionState} from 'utils/constants';
import {Governance} from 'utils/paths';
import {client} from './apolloClient';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
};

const CreateProposalProvider: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {getValues} = useFormContext();
  const {t} = useTranslation();
  const {isOnWrongNetwork} = useWallet();
  const {open} = useGlobalModalContext();

  const {data: dao, loading} = useDaoParam();

  const {data, loading: daoDetailsLoading} = useQuery(DAO_BY_ADDRESS, {
    variables: {id: dao},
    client: client[network],
  });

  const {__typename: type, id: pluginAddress} = data?.dao.packages[0].pkg;

  const pluginType = useMemo(
    () => (type === 'WhitelistPackage' ? 'Whitelist' : 'ERC20'),
    [type]
  );

  const pluginClient = usePluginClient(pluginType, pluginAddress);

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  const shouldPoll = useMemo(
    () => creationProcessState === TransactionState.WAITING,
    [creationProcessState]
  );

  // Because getValues does NOT get updated on each render, leaving this as
  // a function to be called when data is needed instead of a memoized value
  const getProposalCreationParams = useCallback((): ICreateProposalParams => {
    const [title, summary, description, resources] = getValues([
      'proposalTitle',
      'proposalSummary',
      'proposal',
      'links',
    ]);

    return {
      pluginAddress,
      metadata: {
        title,
        summary,
        description,
        resources,
      },
    };
  }, [getValues, pluginAddress]);

  const estimateCreationFees = useCallback(async () => {
    if (!pluginClient) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }

    return pluginClient?.estimation.createProposal(getProposalCreationParams());
  }, [getProposalCreationParams, pluginClient]);

  const {tokenPrice, maxFee, averageFee, stopPolling} = usePollGasFee(
    estimateCreationFees,
    shouldPoll
  );

  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(generatePath(Governance, {network, dao}));
        break;
      default: {
        setCreationProcessState(TransactionState.WAITING);
        setShowTxModal(false);
        stopPolling();
      }
    }
  };

  const createVotingProposal = async () => {
    if (!pluginClient) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }

    return pluginClient.methods.createProposal(getProposalCreationParams());
  };

  // TODO: add action encoding with new version of sdk
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const encodeActions = () => {
    const actions = getValues().actions;
    return actions.map((action: Record<string, string>) => {
      if (action.name === 'withdraw_assets') {
        // doesn't matter which client we use to encode actions, both are the same
        // return pluginClient?.encode.actions.withdraw(
        //   action.to,
        //   BigInt(parseUnits(action.amount, 18).toBigInt()),
        //   {
        //     to: action.to,
        //     token: action.tokenAddress,
        //     amount: BigInt(parseUnits(action.amount, 18).toBigInt()),
        //     reference: action.reference,
        //   }
        // );
      }
    });
  };

  const handlePublishProposal = async () => {
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

    try {
      await createVotingProposal();
      setCreationProcessState(TransactionState.SUCCESS);
    } catch (error) {
      console.error(error);
      setCreationProcessState(TransactionState.ERROR);
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (loading || daoDetailsLoading) {
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
        buttonLabel={t('TransactionModal.createProposalNow')}
      />
    </>
  );
};

export {CreateProposalProvider};
