import {ProposalMetadata} from '@aragon/sdk-client-common';
import {useUploadIpfsData} from 'hooks/useUploadIpfsData';
import {useCallback} from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateProposalFormData, ProposalResource} from 'utils/types';

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
  const {process, onError, onSuccess} = params;

  const {getValues} = useFormContext<CreateProposalFormData>();
  const formValues = getValues();
  const {proposal, proposalSummary, proposalTitle, links} = formValues;

  const {uploadIpfsData, isPending, isError, isSuccess} = useUploadIpfsData({
    logContext: {stack: [process, 'PIN_METADATA'], data: formValues},
    onError,
    onSuccess,
  });

  const pinProposalMetadata = useCallback(() => {
    const metadata: ProposalMetadata = {
      title: proposalTitle,
      summary: proposalSummary,
      description: proposal,
      resources: links.filter((r: ProposalResource) => r.name && r.url),
    };

    uploadIpfsData(JSON.stringify(metadata));
  }, [proposalTitle, proposalSummary, proposal, links, uploadIpfsData]);

  return {pinProposalMetadata, isPending, isError, isSuccess};
};
