import {useUploadIpfsData} from 'hooks/useUploadIpfsData';
import {useCallback} from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateProposalFormData} from 'utils/types';
import {createProposalUtils} from '../utils';

export interface IUsePinProposalMetadataParams {
  /**
   * Process name for logging.
   */
  process: string;
  /**
   * Callback called on pin proposal metadata success.
   */
  onSuccess?: (cid: string) => void;
  /**
   * Callback called on pin proposal metadata error.
   */
  onError?: (error: unknown) => void;
}

export interface IUsePinProposalMetadataResult {
  /**
   * Function to initialize the pin metadata process
   */
  pinProposalMetadata: () => void;
  /**
   * The variable is set to true when pinning the proposal metadata
   */
  isPending: boolean;
  /**
   * The variable is set to true the proposal metadata pinning process is successful.
   */
  isSuccess: boolean;
  /**
   * The variable is set to true an error occurs during the pin metadata process.
   */
  isError: boolean;
}

export const usePinProposalMetadata = (
  params: IUsePinProposalMetadataParams
): IUsePinProposalMetadataResult => {
  const {onError, onSuccess} = params;

  const {getValues} = useFormContext<CreateProposalFormData>();
  const formValues = getValues();

  const {uploadIpfsData, isPending, isError, isSuccess} = useUploadIpfsData({
    onError,
    onSuccess,
  });

  const pinProposalMetadata = useCallback(() => {
    const metadata = createProposalUtils.formValuesToProposalMetadata(
      formValues as CreateProposalFormData
    );

    // Gasless voting store metadata using Vocdoni support
    uploadIpfsData(JSON.stringify(metadata));
  }, [formValues, uploadIpfsData]);

  return {pinProposalMetadata, isPending, isError, isSuccess};
};
