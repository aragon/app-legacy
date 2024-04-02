import React, {useEffect} from 'react';
import {AlertInline, Button} from '@aragon/ods';
import {usePinDaoMetadata} from './hooks/usePinDaoMetadata';

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
    ? 'Unable to pin data to IPFS'
    : undefined;

  const buttonAction = isPinMetadataError ? pinDaoMetadata : () => null;
  const buttonLabel = isPinMetadataLoading
    ? 'Pinning IPFS data'
    : isPinMetadataError
    ? 'Retry'
    : 'Preparing transaction';

  return (
    <>
      <Button
        isLoading={isPinMetadataLoading || isLoading}
        onClick={buttonAction}
        className="self-stretch"
      >
        {buttonLabel}
      </Button>
      {alertMessage && (
        <AlertInline message={alertMessage} variant="critical" />
      )}
    </>
  );
};
