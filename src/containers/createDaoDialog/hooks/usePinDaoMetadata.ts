import {DaoMetadata} from '@aragon/sdk-client';
import {UploadIpfsDataStep, useUploadIpfsData} from 'hooks/useUploadIpfsData';
import {useCallback} from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateDaoFormData} from 'utils/types';
import {CreateDaoProcess} from '../createDaoDialogDefinitions';

export interface IUsePinDaoMetadataParams {
  /**
   * Callback called on pin dao metadata success.
   */
  onSuccess?: (cid: string) => void;
  /**
   * Callback called on pin dao metadata error.
   */
  onError?: (error: unknown) => void;
}

const formValuesToDaoMetadata = (
  values: Omit<CreateDaoFormData, 'daoLogo'>,
  logoCid?: string
): DaoMetadata => ({
  name: values.daoName,
  description: values.daoSummary,
  links: values.links.filter(({name, url}) => name != null && url != null),
  avatar: `ipfs://${logoCid}`,
});

export const usePinDaoMetadata = (params: IUsePinDaoMetadataParams = {}) => {
  const {onSuccess, onError} = params;

  const {getValues} = useFormContext<CreateDaoFormData>();

  const formValues = getValues();
  const {daoLogo} = formValues;

  const handlePinDaoMetadataError =
    (metadataStep: string) => (step: UploadIpfsDataStep, error: unknown) => {
      const logData = {CreateDaoProcess, metadataStep, step, error};
      console.log('Error pinning DAO metadata', logData); // TODO log to Sentry
      onError?.(error);
    };

  const {
    uploadIpfsData: uploadMetadata,
    isPending: isUploadingMetadata,
    isError: isUploadMetadataError,
    isSuccess,
  } = useUploadIpfsData({
    onError: handlePinDaoMetadataError('PIN_METADATA'),
    onSuccess,
  });

  const handleUploadLogoSuccess = (logoCid: string) => {
    const daoMetadata = formValuesToDaoMetadata(formValues, logoCid);
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
      const daoMetadata = formValuesToDaoMetadata(formValues);
      uploadMetadata(JSON.stringify(daoMetadata));
    }
  }, [daoLogo, uploadLogo, formValues, uploadMetadata]);

  const isPending = isUploadingLogo || isUploadingMetadata;
  const isError = isUploadLogoError || isUploadMetadataError;

  return {pinDaoMetadata, isPending, isSuccess, isError};
};
