import React, {useEffect} from 'react';
import {usePinProposalMetadata} from './hooks';
import {AlertInline, Button} from '@aragon/ods';
import {useTranslation} from 'react-i18next';

export interface ICreateProposalDialogStepsProps {
  /**
   * Name of the process to log eventual errors.
   */
  process: string;
  /**
   * Boolean to trigger the Proposal metadata pinning.
   */
  pinMetadata?: boolean;
  /**
   * Displays the custom step button as loading when set to true.
   */
  isLoading?: boolean;
  /**
   * Callback called on pin proposal metadata success.
   */
  onPinProposalMetadataSuccess: (cid: string) => void;
}

export const CreateProposalDialogSteps: React.FC<
  ICreateProposalDialogStepsProps
> = props => {
  const {process, pinMetadata, isLoading, onPinProposalMetadataSuccess} = props;

  const {t} = useTranslation();

  const {
    pinProposalMetadata,
    isPending: isPinMetadataLoading,
    isError: isPinMetadataError,
    isSuccess: isPinMetadataSuccess,
  } = usePinProposalMetadata({
    process,
    onSuccess: onPinProposalMetadataSuccess,
  });

  useEffect(() => {
    const shouldPinMetadata =
      pinMetadata &&
      !isPinMetadataError &&
      !isPinMetadataLoading &&
      !isPinMetadataSuccess;

    if (shouldPinMetadata) {
      pinProposalMetadata();
    }
  }, [
    pinMetadata,
    pinProposalMetadata,
    isPinMetadataError,
    isPinMetadataSuccess,
    isPinMetadataLoading,
  ]);

  const alertMessage = isPinMetadataError
    ? 'createProposalDialog.error.pinMetadata'
    : undefined;

  const buttonAction = isPinMetadataError ? pinProposalMetadata : () => null;
  const buttonLabel = isPinMetadataLoading
    ? 'createProposalDialog.button.pinning'
    : isPinMetadataError
    ? 'transactionDialog.button.retry'
    : 'transactionDialog.button.preparing';

  return (
    <>
      <Button
        isLoading={isPinMetadataLoading || isLoading}
        onClick={buttonAction}
        className="self-stretch"
      >
        {t(buttonLabel)}
      </Button>
      {alertMessage && (
        <AlertInline message={t(alertMessage)} variant="critical" />
      )}
    </>
  );
};
