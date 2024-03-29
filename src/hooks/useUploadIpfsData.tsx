import {useCallback} from 'react';
import {useAddData} from 'services/ipfs/mutations/useAddData';
import {usePinData} from 'services/ipfs/mutations/usePinData';
import {useClient} from './useClient';
import {IAddDataProps} from 'services/ipfs/ipfsService.api';
import {ILoggerErrorContext, logger} from 'services/logger';

interface IUseUploadIpfsDataParams {
  /**
   * Data used to log eventual errors.
   */
  logContext?: Omit<ILoggerErrorContext, 'step'>;
  /**
   * Callback called on ipfs upload success.
   */
  onSuccess?: (cid: string) => void;
  /**
   * Callback called on ipfs upload error.
   */
  onError?: (error: unknown) => void;
}

export enum UploadIpfsDataStep {
  ADD_DATA = 'ADD_DATA',
  PIN_DATA = 'PIN_DATA',
}

export const useUploadIpfsData = (params: IUseUploadIpfsDataParams = {}) => {
  const {onSuccess, onError, logContext} = params;

  const {client} = useClient();

  const handleUploadIpfsError =
    (step: UploadIpfsDataStep) => (error: unknown) => {
      if (logContext) {
        const {stack, data} = logContext;
        logger.error(error, {stack, step, data});
      }

      onError?.(error);
    };

  const {
    isLoading: isPinDataLoading,
    isError: isPinDataError,
    isSuccess,
    mutate: pinData,
    reset: resetPinData,
  } = usePinData({
    onSuccess: (_data, params) => onSuccess?.(params.cid),
    onError: handleUploadIpfsError(UploadIpfsDataStep.PIN_DATA),
  });

  const handleAddDataSuccess = (cid: string) => pinData({client: client!, cid});

  const {
    isLoading: isAddDataLoading,
    isError: isAddDataError,
    mutate: addData,
    reset: resetAddData,
  } = useAddData({
    onSuccess: handleAddDataSuccess,
    onError: handleUploadIpfsError(UploadIpfsDataStep.ADD_DATA),
  });

  const uploadIpfsData = useCallback(
    (data: IAddDataProps['data']) => {
      if (client == null) {
        return;
      }

      // Reset previous states in case of retries
      resetAddData();
      resetPinData();

      addData({client, data});
    },
    [addData, resetAddData, resetPinData, client]
  );

  const isPending = isPinDataLoading || isAddDataLoading;
  const isError = isPinDataError || isAddDataError;

  return {uploadIpfsData, isPending, isSuccess, isError};
};
