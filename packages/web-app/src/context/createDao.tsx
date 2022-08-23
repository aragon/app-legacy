import {
  ICreateDaoERC20Voting,
  ICreateDaoWhitelistVoting,
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
import {trackEvent} from 'services/analytics';

type DAOCreationSettings = ICreateDaoERC20Voting | ICreateDaoWhitelistVoting;

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
  const [showModal, setShowModal] = useState(false);

  const [daoCreationData, setDaoCreationData] = useState<DAOCreationSettings>();
  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>();

  // Form values
  const {getValues, control} = useFormContext<CreateDaoFormData>();
  const [membership] = useWatch({name: ['membership'], control});

  const {createErc20, createWhitelist} = useDao();
  const {erc20, whitelist} = useClient();

  const shouldPoll = useMemo(
    () =>
      daoCreationData !== undefined &&
      creationProcessState === TransactionState.WAITING,
    [creationProcessState, daoCreationData]
  );

  // estimate creation fees
  const estimateCreationFees = useCallback(async () => {
    return membership === 'token'
      ? erc20?.estimate.create(daoCreationData as ICreateDaoERC20Voting)
      : whitelist?.estimate.create(
          daoCreationData as ICreateDaoWhitelistVoting
        );
  }, [daoCreationData, erc20?.estimate, membership, whitelist?.estimate]);

  const {tokenPrice, maxFee, averageFee, stopPolling} = usePollGasFee(
    estimateCreationFees,
    shouldPoll
  );

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handlePublishDao = () => {
    switch (membership) {
      case 'token':
        setDaoCreationData(getERC20VotingDaoSettings());
        break;
      case 'wallet':
        setDaoCreationData(getWhiteListVotingDaoSettings());
        break;
      default:
        throw new Error(`Unknown dao type: ${membership}`);
    }
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
      wallet_provider: provider,
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

  /*************************************************
   *                   Helpers                     *
   *************************************************/
  // get dao configurations
  const getDaoConfig = useCallback(() => {
    const {daoName} = getValues();
    return {
      name: daoName,
      metadata: constants.AddressZero,
    };
  }, [getValues]);

  // get voting configuration
  const getVotingConfig = useCallback(() => {
    const {
      minimumApproval,
      minimumParticipation,
      durationDays,
      durationHours,
      durationMinutes,
    } = getValues();

    return {
      minParticipation: parseInt(minimumParticipation) || 0,
      minSupport: parseInt(minimumApproval) || 0,
      minDuration: getSecondsFromDHM(
        parseInt(durationDays),
        parseInt(durationHours),
        parseInt(durationMinutes)
      ),
    };
  }, [getValues]);

  // get settings for erc20 voting DAOs
  const getERC20VotingDaoSettings = useCallback((): ICreateDaoERC20Voting => {
    const values = getValues();

    return {
      daoConfig: getDaoConfig(),
      votingConfig: getVotingConfig(),
      gsnForwarder: constants.AddressZero,

      // token configuration
      tokenConfig: {
        address: values.isCustomToken
          ? constants.AddressZero
          : values.tokenAddress,
        name: values.tokenName,
        symbol: values.tokenSymbol,
      },

      // mint configuration
      mintConfig: values.wallets.map(wallet => ({
        address: wallet.address,
        balance: BigInt(parseUnits(wallet.amount, 18).toBigInt()),
      })),
    };
  }, [getDaoConfig, getValues, getVotingConfig]);

  // get settings for whitelist voting DAOs
  const getWhiteListVotingDaoSettings =
    useCallback((): ICreateDaoWhitelistVoting => {
      const values = getValues();

      return {
        daoConfig: getDaoConfig(),
        votingConfig: getVotingConfig(),
        gsnForwarder: constants.AddressZero,

        whitelistVoters: values.whitelistWallets.map(wallet => wallet.address),
      };
    }, [getDaoConfig, getValues, getVotingConfig]);

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
      trackEvent('daoCreation_transaction_success', {
        network: getValues('blockchain')?.network,
        wallet_provider: provider,
        governance_type: getValues('membership'),
      });

      setDaoCreationData(undefined);
      setCreationProcessState(TransactionState.SUCCESS);
    } catch (error) {
      // unsuccessful execution, keep creation data for retry
      console.log(error);
      trackEvent('daoCreation_transaction_failed', {
        network: getValues('blockchain')?.network,
        wallet_provider: provider,
        governance_type: getValues('membership'),
        error,
      });

      setCreationProcessState(TransactionState.ERROR);
    }
  }, [
    membership,
    createErc20,
    daoCreationData,
    createWhitelist,
    getValues,
    provider,
  ]);

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
