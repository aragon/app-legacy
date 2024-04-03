import React, {useEffect} from 'react';
import {AlertInline, Button} from '@aragon/ods';
import {usePinDaoMetadata} from './hooks/usePinDaoMetadata';
import {useTranslation} from 'react-i18next';

export interface ICreateDaoDialogStepsProps {
  /**
   * Name of the process to log eventual errors.
   */
  process: string;
  /**
   * Boolean to trigger the DAO metadata pinning.
   */
  pinMetadata?: boolean;
  /**
   * Displays the custom step button as loading when set to true.
   */
  isLoading?: boolean;
  /**
   * Callback called on pin DAO metadata success.
   */
  onPinDaoMetadataSuccess: (cid: string) => void;
}

export const CreateDaoDialogSteps: React.FC<
  ICreateDaoDialogStepsProps
> = props => {
  const {process, isLoading, pinMetadata, onPinDaoMetadataSuccess} = props;

  const {t} = useTranslation();

  const {
    pinDaoMetadata,
    isPending: isPinMetadataLoading,
    isError: isPinMetadataError,
    isSuccess: isPinMetadataSuccess,
  } = usePinDaoMetadata({
    process,
    onSuccess: onPinDaoMetadataSuccess,
  });

  useEffect(() => {
    const shouldPinMetadata =
      pinMetadata &&
      !isPinMetadataError &&
      !isPinMetadataLoading &&
      !isPinMetadataSuccess;

    if (shouldPinMetadata) {
      pinDaoMetadata();
    }
  }, [
    pinMetadata,
    pinDaoMetadata,
    isPinMetadataError,
    isPinMetadataSuccess,
    isPinMetadataLoading,
  ]);

  const alertMessage = isPinMetadataError
    ? 'createDaoDialog.error.pinMetadata'
    : undefined;

  const buttonAction = isPinMetadataError ? pinDaoMetadata : () => null;
  const buttonLabel = isPinMetadataLoading
    ? 'createDaoDialog.button.pinning'
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
