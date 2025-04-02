import {useCallback} from 'react';
import {usePinData} from 'services/ipfs/mutations/usePinData';
import {useClient} from './useClient';
import {IPinDataProps, IPinDataResult} from 'services/ipfs/ipfsService.api';

interface IUseUploadIpfsDataParams {
  /**
   * Callback called on ipfs upload success.
   */
  onSuccess?: (cid: string) => void;
  /**
   * Callback called on ipfs upload error.
   */
  onError?: (error: unknown) => void;
}

export const useUploadIpfsData = (params: IUseUploadIpfsDataParams = {}) => {
  const {onSuccess, onError} = params;

  const {client} = useClient();

  const handleUploadIpfsError = (error: unknown) => {
    onError?.(error);
  };

  const {
    isPending,
    isError,
    isSuccess,
    mutate: pinData,
    reset: resetPinData,
  } = usePinData({
    onSuccess: (_data: IPinDataResult) => {
      onSuccess?.(_data.IpfsHash);
    },
    onError: handleUploadIpfsError,
  });

  const uploadIpfsData = useCallback(
    (data: IPinDataProps) => {
      if (client == null) {
        return;
      }

      // Reset previous states in case of retries
      resetPinData();

      pinData(data);
    },
    [client, resetPinData, pinData]
  );

  return {uploadIpfsData, isPending, isSuccess, isError};
};
