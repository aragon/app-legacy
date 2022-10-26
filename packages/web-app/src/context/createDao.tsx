import {
  ClientAddressList,
  ClientErc20,
  DaoCreationSteps,
  IAddressListPluginInstall,
  ICreateParams,
  IErc20PluginInstall,
  IPluginSettings,
} from '@aragon/sdk-client';
import {IPluginInstallItem} from '@aragon/sdk-client/dist/internal/interfaces/common';
import {parseUnits} from 'ethers/lib/utils';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import {useFormContext} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {CreateDaoFormData} from 'pages/createDAO';
import {useTranslation} from 'react-i18next';
import {trackEvent} from 'services/analytics';
import {TransactionState} from 'utils/constants';
import {getSecondsFromDHM} from 'utils/date';
import {Landing} from 'utils/paths';
import {useGlobalModalContext} from './globalModals';

type CreateDaoContextType = {
  /** Prepares the creation data and awaits user confirmation to start process */
  handlePublishDao: () => void;
};

type Props = Record<'children', ReactNode>;

const CreateDaoContext = createContext<CreateDaoContextType | null>(null);

const CreateDaoProvider: React.FC<Props> = ({children}) => {
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {isOnWrongNetwork, provider} = useWallet();
  const {t} = useTranslation();
  const {getValues} = useFormContext<CreateDaoFormData>();
  const {client} = useClient();

  const [showModal, setShowModal] = useState(false);
  const [daoCreationData, setDaoCreationData] = useState<ICreateParams>();
  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>();

  const shouldPoll =
    daoCreationData !== undefined &&
    creationProcessState === TransactionState.WAITING;

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handlePublishDao = () => {
    setDaoCreationData(getDaoSettings());
    setCreationProcessState(TransactionState.WAITING);
    setShowModal(true);
  };

  // Handler for modal button click
  const handleExecuteCreation = async () => {
    // if DAO has been created, we don't need to do anything
    // do not execute it again, close the modal
    // TODO: navigate to new dao when available
    trackEvent('daoCreation_publishDAONow_clicked', {
      network: getValues('blockchain')?.network,
      wallet_provider: provider?.connection.url,
      governance_type: getValues('membership'),
      estimated_gwei_fee: averageFee,
      total_usd_cost: averageFee ? tokenPrice * Number(averageFee) : 0,
    });

    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    // if no creation data is set, or transaction already running, do nothing.
    if (!daoCreationData || creationProcessState === TransactionState.LOADING) {
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
    await createDao();
  };

  // Handler for modal close; don't close modal if transaction is still running
  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(Landing);
        break;
      default: {
        setShowModal(false);
        stopPolling();
      }
    }
  };

  const getPluginSettings: () => IPluginSettings = useCallback(() => {
    const {
      minimumApproval,
      minimumParticipation,
      durationDays,
      durationHours,
      durationMinutes,
    } = getValues();
    return {
      minDuration: getSecondsFromDHM(
        parseInt(durationDays),
        parseInt(durationHours),
        parseInt(durationMinutes)
      ),
      minTurnout: parseInt(minimumParticipation) / 100,
      minSupport: parseInt(minimumApproval) / 100,
    };
  }, [getValues]);

  const getErc20PluginParams: () => IErc20PluginInstall['newToken'] =
    useCallback(() => {
      const {tokenName, tokenSymbol, wallets} = getValues();
      return {
        name: tokenName,
        symbol: tokenSymbol,
        decimals: 18,
        // minter: '0x...', // optionally, define a minter
        balances: wallets?.map(wallet => ({
          address: wallet.address,
          balance: BigInt(parseUnits(wallet.amount, 18).toBigInt()),
        })),
      };
    }, [getValues]);

  // get whiteList Plugin configuration
  const getAddresslistPluginParams: () => IAddressListPluginInstall['addresses'] =
    useCallback(() => {
      const {whitelistWallets} = getValues();
      return whitelistWallets?.map(wallet => wallet.address);
    }, [getValues]);

  // Get dao setting configuration for creation process
  const getDaoSettings = useCallback(() => {
    const {membership, daoName, daoSummary, daoLogo, links} = getValues();
    const plugins: IPluginInstallItem[] = [];
    const pluginSettings = getPluginSettings();

    switch (membership) {
      case 'token': {
        const erc20Params = getErc20PluginParams();
        const pluginInstallParams: IErc20PluginInstall = {
          settings: pluginSettings,
          newToken: erc20Params,
        };
        plugins.push(
          ClientErc20?.encoding?.getPluginInstallItem(pluginInstallParams)
        );
        break;
      }
      case 'wallet': {
        const addressListParams = getAddresslistPluginParams();
        const pluginInstallParams: IAddressListPluginInstall = {
          settings: pluginSettings,
          addresses: addressListParams,
        };
        plugins.push(
          ClientAddressList?.encoding?.getPluginInstallItem(pluginInstallParams)
        );
        break;
      }
      default:
        throw new Error(`Unknown dao type: ${membership}`);
    }

    return {
      metadata: {
        name: daoName,
        description: daoSummary,
        avatar: daoLogo,
        links: links,
      },
      // TODO: We're using dao name without spaces for ens, We need to add alert to inform this to user
      ensSubdomain: daoName?.replace(/ /g, '_'),
      plugins: plugins,
    };
  }, [
    getValues,
    getPluginSettings,
    getErc20PluginParams,
    getAddresslistPluginParams,
  ]);

  // estimate creation fees
  const estimateCreationFees = useCallback(async () => {
    if (daoCreationData) return client?.estimation.create(daoCreationData);
  }, [client?.estimation, daoCreationData]);

  const {tokenPrice, maxFee, averageFee, stopPolling} = usePollGasFee(
    estimateCreationFees,
    shouldPoll
  );

  // run dao creation transaction
  const createDao = async () => {
    setCreationProcessState(TransactionState.LOADING);

    // Check if SDK initialized properly
    if (!client || !daoCreationData) {
      throw new Error('SDK client is not initialized correctly');
    }

    const createDaoIterator = client?.methods.create(daoCreationData);

    // Check if createDaoIterator function is initialized
    if (!createDaoIterator) {
      throw new Error('deposit function is not initialized correctly');
    }

    for await (const step of createDaoIterator) {
      try {
        switch (step.key) {
          case DaoCreationSteps.CREATING:
            console.log(step.txHash);
            break;
          case DaoCreationSteps.DONE:
            console.log('Newly created DAO address', step.address);
            trackEvent('daoCreation_transaction_success', {
              network: getValues('blockchain')?.network,
              wallet_provider: provider?.connection.url,
              governance_type: getValues('membership'),
            });
            setDaoCreationData(undefined);
            setCreationProcessState(TransactionState.SUCCESS);
            break;
        }
      } catch (err) {
        // unsuccessful execution, keep creation data for retry
        console.log(err);
        trackEvent('daoCreation_transaction_failed', {
          network: getValues('blockchain')?.network,
          wallet_provider: provider?.connection.url,
          governance_type: getValues('membership'),
          err,
        });
        setCreationProcessState(TransactionState.ERROR);
      }
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <CreateDaoContext.Provider value={{handlePublishDao}}>
      {children}
      <PublishModal
        subtitle={t('TransactionModal.publishDaoSubtitle')}
        buttonLabelSuccess={t('TransactionModal.launchDaoDashboard')}
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteCreation}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        tokenPrice={tokenPrice}
      />
    </CreateDaoContext.Provider>
  );
};

function useCreateDaoContext(): CreateDaoContextType {
  return useContext(CreateDaoContext) as CreateDaoContextType;
}

export {useCreateDaoContext, CreateDaoProvider};
