import {useCallback, useEffect} from 'react';
import {ITransaction} from 'services/transactions/domain/transaction';
import {FormattedTransactionReceipt, Hash, TransactionReceipt} from 'viem';
import {SendTransactionErrorType} from '@wagmi/core';
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
  isSuccess: boolean;
  sendTransaction: () => void;
}

export enum SendTransactionStep {
  ESTIMATE_GAS = 'ESTIMATE_GAS',
  SEND_TRANSACTION = 'SEND_TRANSACTION',
  WAIT_CONFIRMATIONS = 'WAIT_CONFIRMATIONS',
}

export const useSendTransaction = (
  params: IUseSendTransactionParams
): IUseSendTransactionResult => {
  const {logContext, transaction, onError, onSuccess} = params;

  const {
    isFetching: isEstimateGasLoading,
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
  } = useSendTransactionWagmi({
    mutation: {
      onError: handleSendTransactionError(SendTransactionStep.SEND_TRANSACTION),
    },
  });

  const {
    data: txReceipt,
    error: waitTransactionError,
    isError: isWaitTransactionError,
    isFetching: isWaitTransactionLoading,
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
  }, [isSuccess, txReceipt, onSuccess]);

  // Handle estimate gas transaction error
  useEffect(() => {
    if (isEstimateGasError) {
      handleSendTransactionError(SendTransactionStep.ESTIMATE_GAS)(
        estimateGasError
      );
    }
  }, [isEstimateGasError, estimateGasError, handleSendTransactionError]);

  // Handle estimate gas transaction error
  useEffect(() => {
    if (isWaitTransactionError) {
      handleSendTransactionError(SendTransactionStep.WAIT_CONFIRMATIONS)(
        waitTransactionError
      );
    }
  }, [
    isWaitTransactionError,
    waitTransactionError,
    handleSendTransactionError,
  ]);

  const sendTransaction = useCallback(() => {
    if (transaction == null) {
      return;
    }

    sendTransactionWagmi(transaction);
  }, [sendTransactionWagmi, transaction]);

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
    isSuccess,
    sendTransaction,
  };
};
