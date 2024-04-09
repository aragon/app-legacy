import {useCallback, useEffect, useState} from 'react';
import {ITransaction} from 'services/transactions/domain/transaction';
import {FormattedTransactionReceipt, Hash, TransactionReceipt} from 'viem';
import {
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
} from '@wagmi/core';
import {
  useEstimateGas,
  useSendTransaction as useSendTransactionWagmi,
  useWaitForTransactionReceipt,
} from 'wagmi';
import {ILoggerErrorContext, logger} from 'services/logger';

export interface IUseSendTransactionParams {
  /**
   * Log context used to log eventual errors.
   */
  logContext?: Omit<ILoggerErrorContext, 'step'>;
  /**
   * Transaction to be sent.
   */
  transaction?: ITransaction;
  /**
   * Callback called on send transaction error.
   */
  onError?: (error: unknown) => void;
  /**
   * Callback called when the transaction is successfully sent to the blockchain.
   */
  onSuccess?: (txReceipt: TransactionReceipt) => void;
}

export interface IUseSendTransactionResult {
  isEstimateGasError: boolean;
  isEstimateGasLoading: boolean;
  txHash?: Hash;
  sendTransactionError: SendTransactionErrorType | null;
  isSendTransactionError: boolean;
  isSendTransactionLoading: boolean;
  txReceipt?: FormattedTransactionReceipt;
  isWaitTransactionError: boolean;
  isWaitTransactionLoading: boolean;
  waitTransactionError?: WaitForTransactionReceiptErrorType | null;
  isSuccess: boolean;
  sendTransaction: () => void;
  longWaitingTime?: boolean;
}

export enum SendTransactionStep {
  ESTIMATE_GAS = 'ESTIMATE_GAS',
  SEND_TRANSACTION = 'SEND_TRANSACTION',
  WAIT_CONFIRMATIONS = 'WAIT_CONFIRMATIONS',
}

const LONG_WAIT_TIMEOUT = 20_000;

export const useSendTransaction = (
  params: IUseSendTransactionParams
): IUseSendTransactionResult => {
  const {logContext, transaction, onError, onSuccess} = params;

  const [longWaitingTime, setLongWaitingTime] = useState(false);

  const {
    isLoading: isEstimateGasLoading,
    isError: isEstimateGasError,
    error: estimateGasError,
  } = useEstimateGas(transaction);

  const handleSendTransactionError = useCallback(
    (step: SendTransactionStep) => (error: unknown) => {
      if (logContext) {
        const {stack, data} = logContext;
        logger.error(error, {stack, step, data});
      }

      onError?.(error);
    },
    [logContext, onError]
  );

  const {
    data: txHash,
    sendTransaction: sendTransactionWagmi,
    error: sendTransactionError,
    isError: isSendTransactionError,
    isLoading: isSendTransactionLoading,
    reset: resetSendTransactionWagmi,
  } = useSendTransactionWagmi({
    mutation: {
      onError: handleSendTransactionError(SendTransactionStep.SEND_TRANSACTION),
    },
  });

  const {
    data: txReceipt,
    error: waitTransactionError,
    isError: isWaitTransactionError,
    isInitialLoading: isWaitTransactionLoading,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 2,
    query: {enabled: txHash != null},
  });

  // Trigger onSuccess callback on transaction success
  useEffect(() => {
    if (isSuccess && txReceipt) {
      onSuccess?.(txReceipt);
    }
    // Do not rerun effect on onSuccess change to avoid rerenders caused by eventual onSuccess side effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, txReceipt]);

  // Handle estimate gas transaction error
  useEffect(() => {
    if (isEstimateGasError) {
      handleSendTransactionError(SendTransactionStep.ESTIMATE_GAS)(
        estimateGasError
      );
    }
    // Do not rerun effect on handleSendTransactionError change to only trigger the handler once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEstimateGasError, estimateGasError]);

  // Handle wait transaction transaction error
  useEffect(() => {
    if (isWaitTransactionError) {
      handleSendTransactionError(SendTransactionStep.WAIT_CONFIRMATIONS)(
        waitTransactionError
      );
    }
    // Do not rerun effect on handleSendTransactionError change to only trigger the handler once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaitTransactionError, waitTransactionError]);

  // As soon as the transaction has been sent (txHash != null), check every second if the wait-transaction
  // is successful. Set the longWaitingTime state to true if the transaction is not successful after the
  // seconds defined in LONG_WAIT_TIMEOUT
  useEffect(() => {
    let waitTransactionInterval: NodeJS.Timer | undefined;

    if (txHash != null && !isSuccess) {
      const timerStart = new Date().getTime();
      waitTransactionInterval = setInterval(() => {
        const now = new Date().getTime();

        if (now - timerStart > LONG_WAIT_TIMEOUT) {
          setLongWaitingTime(true);
        }
      }, 1_000);
    } else {
      setLongWaitingTime(false);
    }

    return () => clearInterval(waitTransactionInterval);
  }, [txHash, isSuccess]);

  const sendTransaction = useCallback(() => {
    if (transaction == null) {
      return;
    }

    // Reset any previous state in case of retry
    resetSendTransactionWagmi();

    // Set gas to null to skip wagmi gas estimation and allow users to still
    // send the transaction to their wallet when gas-estimation fails
    const gas = isEstimateGasError ? null : undefined;
    sendTransactionWagmi({...transaction, gas});
  }, [
    sendTransactionWagmi,
    resetSendTransactionWagmi,
    transaction,
    isEstimateGasError,
  ]);

  return {
    isEstimateGasError,
    isEstimateGasLoading,
    txHash,
    sendTransactionError,
    isSendTransactionError,
    isSendTransactionLoading,
    txReceipt,
    isWaitTransactionError,
    isWaitTransactionLoading,
    waitTransactionError,
    isSuccess,
    sendTransaction,
    longWaitingTime,
  };
};
