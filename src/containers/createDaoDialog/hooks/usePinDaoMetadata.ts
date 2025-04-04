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

export interface IUsePinDaoMetadataResult {
  /**
   * Function to initialize the pin metadata process
   */
  pinDaoMetadata: () => void;
  /**
   * The variable is set to true when pinning the DAO logo or metadata.
   */
  isPending: boolean;
  /**
   * The variable is set to true the DAO metadata pinning process is successful.
   */
  isSuccess: boolean;
  /**
   * The variable is set to true an error occurs during the pin metadata process.
   */
  isError: boolean;
}

export const usePinDaoMetadata = (
  params: IUsePinDaoMetadataParams
): IUsePinDaoMetadataResult => {
  const {onSuccess, onError} = params;

  const {getValues} = useFormContext<CreateDaoFormData>();

  const formValues = getValues();
  const {daoLogo} = formValues;

  const {
    uploadIpfsData: uploadMetadata,
    isPending: isUploadingMetadata,
    isError: isUploadMetadataError,
    isSuccess,
  } = useUploadIpfsData({
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
