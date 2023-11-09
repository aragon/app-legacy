/* eslint-disable no-case-declarations */
import {
  MultisigPluginPrepareUpdateParams,
  PrepareUpdateParams,
  PrepareUpdateStep,
  TokenVotingPluginPrepareUpdateParams,
} from '@aragon/sdk-client';
import {VersionTag} from '@aragon/sdk-client-common';
import React, {
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {TransactionState} from 'utils/constants';
import {CreateProposalFormData} from 'utils/types';
import {
  isGaslessVotingClient,
  PluginTypes,
  usePluginClient,
} from 'hooks/usePluginClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';

type PrepareUpdateContextType = {
  /** Prepares the creation data and awaits user confirmation to start process */
  handlePreparePlugin: (type: string) => void;
};

const PrepareUpdateContext = createContext<PrepareUpdateContextType | null>(
  null
);

const PrepareUpdateProvider: React.FC<{children: ReactElement}> = ({
  children,
}) => {
  const [showModal, setShowModal] = useState({
    open: false,
    type: '',
  });
  const {isOnWrongNetwork} = useWallet();
  const {t} = useTranslation();
  const {getValues} = useFormContext<CreateProposalFormData>();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType);
  const [osxSelectedVersion, pluginSelectedVersion] = getValues([
    'osxSelectedVersion',
    'pluginSelectedVersion',
  ]);

  const [preparationProcessState, setPreparationProcessState] =
    useState<TransactionState>();
  const [daoUpdateData, setDaoUpdateData] = useState<
    | TokenVotingPluginPrepareUpdateParams
    | MultisigPluginPrepareUpdateParams
    | PrepareUpdateParams
  >();

  const shouldPoll =
    daoUpdateData !== undefined &&
    preparationProcessState === TransactionState.WAITING;

  const disableActionButton =
    !daoUpdateData && preparationProcessState !== TransactionState.SUCCESS;

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handlePreparePlugin = async (type: string) => {
    if (detailsAreLoading) return;
    setPreparationProcessState(TransactionState.WAITING);
    setDaoUpdateData({
      daoAddressOrEns: daoDetails!.address, // my-dao.dao.eth
      pluginAddress: daoDetails?.plugins?.[0]!.instanceAddress as string,
      ...(type === 'plugin' && {
        pluginRepo: '0x2345678901234567890123456789012345678901',
      }),
      ...(type === 'plugin'
        ? {
            newVersion: pluginSelectedVersion?.version as VersionTag,
          }
        : {
            newVersion: osxSelectedVersion?.version as VersionTag,
          }),

      updateParams: [],
    });
    setShowModal({
      open: true,
      type: type,
    });
  };

  // Handler for modal button click
  const handleExecuteCreation = async () => {
    if (preparationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    // if no creation data is set, or transaction already running, do nothing.
    if (
      !daoUpdateData ||
      preparationProcessState === TransactionState.LOADING
    ) {
      console.log('Transaction is running');
      return;
    }

    // if the wallet was in a wrong network user will see the wrong network warning
    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    // proceed with creation if transaction is waiting or was not successfully executed (retry);
    await preparePlugin();
  };

  // Handler for modal close; don't close modal if transaction is still running
  const handleCloseModal = () => {
    switch (preparationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
      default: {
        setShowModal({
          ...showModal,
          open: false,
        });
        stopPolling();
      }
    }
  };

  // estimate creation fees
  const estimateCreationFees = useCallback(async () => {
    if (!daoUpdateData) return;
    if (showModal.type === 'plugin') {
      // todo(kon): implement this on the min sdk
      // The propose settings flow is not currently handled by the gasless voting client
      if (pluginClient && isGaslessVotingClient(pluginClient)) {
        return;
      }

      return pluginClient?.estimation.prepareUpdate(daoUpdateData);
    } else
      client?.estimation.prepareUpdate(daoUpdateData as PrepareUpdateParams);
  }, [client?.estimation, daoUpdateData, pluginClient, showModal.type]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  // run dao creation transaction
  const preparePlugin = async () => {
    setPreparationProcessState(TransactionState.LOADING);

    // Check if SDK initialized properly
    if (!client || !daoUpdateData) {
      throw new Error('SDK client is not initialized correctly');
    }
    const preparePluginIterator =
      showModal.type === 'plugin'
        ? // todo(kon): implement this on the min sdk
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          pluginClient?.methods.prepareUpdate(daoUpdateData)
        : client?.methods.prepareUpdate(daoUpdateData as PrepareUpdateParams);

    // Check if preparePluginIterator function is initialized
    if (!preparePluginIterator) {
      throw new Error('deposit function is not initialized correctly');
    }

    try {
      for await (const step of preparePluginIterator) {
        switch (step.key) {
          case PrepareUpdateStep.PREPARING:
            console.log(step.txHash);
            break;
          case PrepareUpdateStep.DONE:
            console.log({
              permissions: step.permissions,
              pluginAddress: step.pluginAddress,
              pluginRepo: step.pluginRepo,
              versionTag: step.versionTag,
              initData: step.initData,
              helpers: step.helpers,
            });
            setDaoUpdateData(undefined);
            setPreparationProcessState(TransactionState.SUCCESS);
            break;
        }
      }
    } catch (err) {
      // unsuccessful execution, keep creation data for retry
      console.log(err);
      setPreparationProcessState(TransactionState.ERROR);
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  const buttonLabels = {
    [TransactionState.SUCCESS]: t('TransactionModal.launchDaoDashboard'),
  };

  return (
    <PrepareUpdateContext.Provider value={{handlePreparePlugin}}>
      {children}
      <PublishModal
        subtitle={t('TransactionModal.publishDaoSubtitle')}
        buttonStateLabels={buttonLabels}
        state={preparationProcessState || TransactionState.WAITING}
        isOpen={showModal.open}
        onClose={handleCloseModal}
        callback={handleExecuteCreation}
        closeOnDrag={preparationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        disabledCallback={disableActionButton}
      />
    </PrepareUpdateContext.Provider>
  );
};

function usePrepareUpdateContext(): PrepareUpdateContextType {
  return useContext(PrepareUpdateContext) as PrepareUpdateContextType;
}

export {PrepareUpdateProvider, usePrepareUpdateContext};
