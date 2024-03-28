import {useCallback} from 'react';
import {ITransaction} from 'services/transactions/domain/transaction';
import {FormattedTransactionReceipt, Hash} from 'viem';
import {SendTransactionErrorType} from '@wagmi/core';
import {
  useEstimateGas,
  useSendTransaction as useSendTransactionWagmi,
  useWaitForTransactionReceipt,
} from 'wagmi';

export interface IUseSendTransactionParams {
  /**
   * Transaction to be sent.
   */
  transaction?: ITransaction;
  /**
   * Callback called on send transaction error.
   */
  onError?: (error: unknown) => void;
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

export const useSendTransaction = (
  params: IUseSendTransactionParams
): IUseSendTransactionResult => {
  const {transaction, onError} = params;

  const {isLoading: isEstimateGasLoading, isError: isEstimateGasError} =
    useEstimateGas(transaction);

  const handleSendTransactionError = (error: unknown) => {
    console.log('Error sending transaction');
    onError?.(error);
  };

  const {
    data: txHash,
    sendTransaction: sendTransactionWagmi,
    error: sendTransactionError,
    isError: isSendTransactionError,
    isLoading: isSendTransactionLoading,
  } = useSendTransactionWagmi({
    mutation: {onError: handleSendTransactionError},
  });

  const {
    data: txReceipt,
    isError: isWaitTransactionError,
    isLoading: isWaitTransactionLoading,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 3,
    query: {enabled: txHash != null},
  });

  console.log({isWaitTransactionLoading});

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
