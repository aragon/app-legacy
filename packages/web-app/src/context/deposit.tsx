import {DaoDepositSteps, IDepositParams} from '@aragon/sdk-client';
import {useFormContext} from 'react-hook-form';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useState,
} from 'react';

import {Finance} from 'utils/paths';
import {useClient} from 'hooks/useClient';
import {useWallet} from 'hooks/useWallet';
import {useNetwork} from './network';
import DepositModal from 'containers/transactionModals/DepositModal';
import {DepositFormData} from 'pages/newDeposit';
import {TransactionState} from 'utils/constants';
import {isNativeToken} from 'utils/tokens';
import {useStepper} from 'hooks/useStepper';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useGlobalModalContext} from './globalModals';
import {useReactiveVar} from '@apollo/client';
import {pendingDeposits} from './apolloClient';

interface IDepositContextType {
  handleOpenModal: () => void;
}

export type modalParamsType = {
  tokenSymbol?: string;
};

const DepositContext = createContext<IDepositContextType | null>(null);

const DepositProvider = ({children}: {children: ReactNode}) => {
  const {dao} = useParams();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isOnWrongNetwork} = useWallet();

  const [showModal, setShowModal] = useState<boolean>(false);
  const {open, close, isNetworkOpen} = useGlobalModalContext();
  const [includeApproval, setIncludeApproval] = useState<boolean>(true);

  const {getValues} = useFormContext<DepositFormData>();
  const [depositState, setDepositState] = useState<TransactionState>();
  const [depositParams, setDepositParams] = useState<IDepositParams>();
  const [modalParams, setModalParams] = useState<modalParamsType>({});
  const pendingDepositsTxs = useReactiveVar(pendingDeposits);

  const {client} = useClient();
  const {setStep: setModalStep, currentStep} = useStepper(2);

  const shouldPoll = useMemo(
    () =>
      depositParams !== undefined && depositState === TransactionState.WAITING,
    [depositParams, depositState]
  );

  const depositIterator = useMemo(() => {
    if (client && depositParams) return client.methods.deposit(depositParams);
  }, [client, depositParams]);

  const estimateDepositFees = useCallback(async () => {
    if (client && depositParams) {
      if (
        currentStep === 2 ||
        isNativeToken(depositParams.tokenAddress as string)
      ) {
        return client?.estimation.deposit(depositParams as IDepositParams);
      } else
        return client?.estimation.updateAllowance(
          depositParams as IDepositParams
        );
    }
  }, [client, currentStep, depositParams]);

  const {tokenPrice, maxFee, averageFee, stopPolling} = usePollGasFee(
    estimateDepositFees,
    shouldPoll
  );

  const handleOpenModal = useCallback(() => {
    // get deposit data from
    const {amount, tokenAddress, to, reference, tokenSymbol} = getValues();

    // validate and set deposit data
    if (!to) {
      setDepositState(TransactionState.ERROR);
      return;
    }

    setDepositParams({
      daoAddress: to,
      amount: BigInt(Number(amount) * Math.pow(10, 18)),
      tokenAddress,
      reference,
    });

    //add more information that aren't in the form
    setModalParams({
      tokenSymbol,
    });

    // determine whether to include approval step and show modal
    if (isNativeToken(tokenAddress)) {
      setIncludeApproval(false);
      setModalStep(2);
    } else {
      setIncludeApproval(true);
      setModalStep(1);
    }

    setDepositState(TransactionState.WAITING);
    setShowModal(true);
  }, [getValues, setModalStep]);

  // Handler for modal close; don't close modal if transaction is still running
  const handleCloseModal = useCallback(() => {
    switch (depositState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(generatePath(Finance, {network, dao}), {
          state: {refetch: true},
        });
        break;
      default: {
        setShowModal(false);
        stopPolling();
        setDepositState(TransactionState.WAITING);
      }
    }
  }, [dao, depositState, navigate, network, stopPolling]);

  /*************************************************
   *               Lifecycle hooks                 *
   *************************************************/
  useEffect(() => {
    // resolve network mismatch when transaction is
    // ready to execute or loading. Why user would change
    // network while loading is anyone's guess really.
    // Also, should probably extract into a hook for other flows
    if (
      isOnWrongNetwork &&
      (depositState === TransactionState.WAITING ||
        depositState === TransactionState.LOADING)
    ) {
      open('network');
      handleCloseModal();
      return;
    }

    // close switch network modal and continue with flow
    if (!isOnWrongNetwork && isNetworkOpen) {
      close('network');
      handleOpenModal();
    }
  }, [
    close,
    depositState,
    handleCloseModal,
    handleOpenModal,
    isNetworkOpen,
    isOnWrongNetwork,
    open,
  ]);

  const handleApproval = async () => {
    // Check if SDK initialized properly
    if (!client) {
      throw new Error('SDK client is not initialized correctly');
    }

    // Check if deposit function is initialized
    if (!depositIterator) {
      throw new Error('deposit function is not initialized correctly');
    }

    try {
      setDepositState(TransactionState.LOADING);

      // run approval steps
      for (let step = 0; step < 3; step++) {
        await depositIterator.next();
      }

      // update modal button and transaction state
      setModalStep(2);
      setDepositState(TransactionState.WAITING);
    } catch (error) {
      console.error(error);
      setDepositState(TransactionState.ERROR);
    }
  };

  const handleDeposit = async () => {
    const {amount, from, reference, tokenAddress, tokenName, tokenSymbol} =
      getValues();

    let transactionHash = '';

    // Check if SDK initialized properly
    if (!client) {
      throw new Error('SDK client is not initialized correctly');
    }

    // Check if deposit function is initialized
    if (!depositIterator) {
      throw new Error('deposit function is not initialized correctly');
    }

    try {
      setDepositState(TransactionState.LOADING);

      for await (const step of depositIterator) {
        if (step.key === DaoDepositSteps.DEPOSITING) {
          transactionHash = step.txHash;
          const depositTxs = [
            ...pendingDepositsTxs,
            {
              transactionId: transactionHash,
              from,
              amount,
              reference,
              type: isNativeToken(tokenAddress) ? 'native' : 'erc20',
              address: tokenAddress,
              name: tokenName,
              symbol: tokenSymbol,
              // TODO: Fix the decimals value
              decimals: '18',
            },
          ];

          pendingDeposits(depositTxs);
          localStorage.setItem('pendingDeposits', JSON.stringify(depositTxs));
        }
      }

      setDepositState(TransactionState.SUCCESS);
      console.log(transactionHash);
    } catch (error) {
      console.error(error);
      setDepositState(TransactionState.ERROR);
    }
  };

  /*************************************************
   *                   Render                      *
   *************************************************/
  return (
    <DepositContext.Provider value={{handleOpenModal}}>
      {children}
      <DepositModal
        {...{
          currentStep,
          includeApproval,
          handleDeposit,
          handleApproval,
          maxFee,
          averageFee,
          modalParams,
          handleOpenModal,
        }}
        state={depositState || TransactionState.WAITING}
        isOpen={showModal}
        onClose={handleCloseModal}
        handleDeposit={handleDeposit}
        handleApproval={handleApproval}
        closeOnDrag={depositState !== TransactionState.LOADING}
        depositAmount={depositParams?.amount as bigint}
        tokenAddress={depositParams?.tokenAddress as string}
        ethPrice={tokenPrice}
      />
    </DepositContext.Provider>
  );
};

function useDepositDao(): IDepositContextType {
  return useContext(DepositContext) as IDepositContextType;
}

export {useDepositDao, DepositProvider};
