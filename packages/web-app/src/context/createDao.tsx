import {
  ClientAddressList,
  ClientErc20,
  IAddressListPluginInstall,
  ICreateParams,
  IErc20PluginInstall,
} from '@aragon/sdk-client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import {constants} from 'ethers';
import {parseUnits} from 'ethers/lib/utils';
import {useNavigate} from 'react-router-dom';
import {useFormContext, useWatch} from 'react-hook-form';

import {useDao} from 'hooks/useCachedDao';
import PublishModal from 'containers/transactionModals/publishModal';
import {TransactionState} from 'utils/constants';
import {getSecondsFromDHM} from 'utils/date';
import {CreateDaoFormData} from 'pages/createDAO';
import {Landing} from 'utils/paths';
import {useWallet} from 'hooks/useWallet';
import {useGlobalModalContext} from './globalModals';
import {useClient} from 'hooks/useClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {IPluginListItem} from '@aragon/sdk-client/dist/internal/interfaces/common';

type CreateDaoContextType = {
  /** Prepares the creation data and awaits user confirmation to start process */
  handlePublishDao: () => void;
};

type Props = Record<'children', ReactNode>;

const CreateDaoContext = createContext<CreateDaoContextType | null>(null);

const CreateDaoProvider: React.FC<Props> = ({children}) => {
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {isOnWrongNetwork} = useWallet();
  const [showModal, setShowModal] = useState(false);

  const [daoCreationData, setDaoCreationData] = useState<ICreateParams>();
  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>();

  // Form values
  const {getValues, control} = useFormContext<CreateDaoFormData>();
  const [membership] = useWatch({name: ['membership'], control});

  const {createErc20, createWhitelist} = useDao();
  const {client, context} = useClient();

  const shouldPoll = useMemo(
    () =>
      daoCreationData !== undefined &&
      creationProcessState === TransactionState.WAITING,
    [creationProcessState, daoCreationData]
  );

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

  /*************************************************
   *                   Helpers                     *
   *************************************************/
  // get dao configurations
  const erc20PluginParams: IErc20PluginInstall = useMemo(() => {
    const {
      minimumApproval,
      minimumParticipation,
      durationDays,
      durationHours,
      durationMinutes,
      tokenName,
      tokenSymbol,
      wallets,
    } = getValues();
    return {
      proposals: {
        minDuration: getSecondsFromDHM(
          parseInt(durationDays),
          parseInt(durationHours),
          parseInt(durationMinutes)
        ),
        minTurnout: parseInt(minimumParticipation) || 0,
        minSupport: parseInt(minimumApproval) || 0,
      },
      newToken: {
        name: tokenName,
        symbol: tokenSymbol,
        decimals: 18,
        // minter: '0x...', // optionally, define a minter
        balances: wallets.map(wallet => ({
          address: wallet.address,
          balance: BigInt(parseUnits(wallet.amount, 18).toBigInt()),
        })),
      },
    };
  }, [getValues]);

  const whiteListPluginParams: IAddressListPluginInstall = useMemo(() => {
    const {
      minimumApproval,
      minimumParticipation,
      durationDays,
      durationHours,
      durationMinutes,
      whitelistWallets,
    } = getValues();
    return {
      proposals: {
        minDuration: getSecondsFromDHM(
          parseInt(durationDays),
          parseInt(durationHours),
          parseInt(durationMinutes)
        ),
        minTurnout: parseInt(minimumParticipation) || 0,
        minSupport: parseInt(minimumApproval) || 0,
      },
      addresses: whitelistWallets.map(wallet => wallet.address),
    };
  }, [getValues]);

  // get settings for erc20 voting DAOs
  const getDaoSettings = useCallback((): ICreateParams => {
    const values = getValues();
    let plugins: IPluginListItem;

    switch (membership) {
      case 'token':
        plugins = ClientErc20.encoding.installEntry(erc20PluginParams);
        break;
      case 'wallet':
        plugins = ClientAddressList.encoding.installEntry(
          whiteListPluginParams
        );
        break;
      default:
        throw new Error(`Unknown dao type: ${membership}`);
    }

    return {
      metadata: {
        name: values.daoName,
        description: values.daoSummary,
        avatar: values.daoLogo,
        links: values.links,
      },
      ensSubdomain: 'my-org', // my-org.dao.eth
      plugins: [plugins],
    };
  }, [erc20PluginParams, getValues, membership, whiteListPluginParams]);

  // estimate creation fees
  const estimateCreationFees = useCallback(async () => {
    return client?.estimation.create(getDaoSettings());
  }, [client?.estimation, getDaoSettings]);

  const {tokenPrice, maxFee, averageFee, stopPolling} = usePollGasFee(
    estimateCreationFees,
    shouldPoll
  );

  // run dao creation transaction
  const createDao = useCallback(async () => {
    setCreationProcessState(TransactionState.LOADING);

    try {
      const address =
        membership === 'token'
          ? await createErc20(daoCreationData as ICreateDaoERC20Voting)
          : await createWhitelist(daoCreationData as ICreateDaoWhitelistVoting);

      // temporary, considering once transaction is successfully executed,
      // we can navigate to the new dao
      console.log('Newly created DAO address', address);
      setDaoCreationData(undefined);
      setCreationProcessState(TransactionState.SUCCESS);
    } catch (error) {
      // unsuccessful execution, keep creation data for retry
      console.log(error);
      setCreationProcessState(TransactionState.ERROR);
    }
  }, [createErc20, createWhitelist, membership, daoCreationData]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <CreateDaoContext.Provider value={{handlePublishDao}}>
      {children}
      <PublishModal
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
