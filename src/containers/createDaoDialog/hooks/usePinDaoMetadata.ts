import {useUploadIpfsData} from 'hooks/useUploadIpfsData';
import {useCallback} from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateDaoFormData} from 'utils/types';
import {createDaoUtils} from '../utils';

export interface IUsePinDaoMetadataParams {
  /**
   * Process name for logging.
   */
  process: string;
  /**
   * Callback called on pin dao metadata success.
   */
  onSuccess?: (cid: string) => void;
  /**
   * Callback called on pin dao metadata error.
   */
  onError?: (error: unknown) => void;
}

export const usePinDaoMetadata = (params: IUsePinDaoMetadataParams) => {
  const {process, onSuccess, onError} = params;

  const {getValues} = useFormContext<CreateDaoFormData>();

  const formValues = getValues();
  const {daoLogo} = formValues;

  const {
    uploadIpfsData: uploadMetadata,
    isPending: isUploadingMetadata,
    isError: isUploadMetadataError,
    isSuccess,
  } = useUploadIpfsData({
    logContext: {stack: [process, 'PIN_METADATA'], data: formValues},
    onError,
    onSuccess,
  });

  const handleUploadLogoSuccess = (logoCid: string) => {
    const daoMetadata = createDaoUtils.formValuesToDaoMetadata(
      formValues,
      logoCid
    );
    uploadMetadata(JSON.stringify(daoMetadata));
  };

  const {
    uploadIpfsData: uploadLogo,
    isPending: isUploadingLogo,
    isError: isUploadLogoError,
  } = useUploadIpfsData({
    logContext: {stack: [process, 'PIN_LOGO'], data: formValues},
    onSuccess: handleUploadLogoSuccess,
    onError,
  });

  const pinDaoMetadata = useCallback(async () => {
    if (daoLogo) {
      uploadLogo(daoLogo as Blob);
    } else {
      const daoMetadata = createDaoUtils.formValuesToDaoMetadata(formValues);
      uploadMetadata(JSON.stringify(daoMetadata));
    }
  }, [daoLogo, uploadLogo, formValues, uploadMetadata]);

  const isPending = isUploadingLogo || isUploadingMetadata;
  const isError = isUploadLogoError || isUploadMetadataError;

  return {pinDaoMetadata, isPending, isSuccess, isError};
};
