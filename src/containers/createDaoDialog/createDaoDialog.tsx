import React, {useEffect, useMemo, useState} from 'react';
import {ModalProps} from '@aragon/ods-old';
import {TransactionDialog} from 'containers/transactionDialog';
import {usePinDaoMetadata} from './hooks/usePinDaoMetadata';
import {AlertInline, Button} from '@aragon/ods';

export interface ICreateDaoDialogProps extends ModalProps {}

export const CreateDaoDialog: React.FC<ICreateDaoDialogProps> = props => {
  const {isOpen, ...otherProps} = props;

  const [, setMetadataCid] = useState<string>();

  const {
    pinDaoMetadata,
    isPending: isPinMetadataLoading,
    isError: isPinMetadataError,
    isSuccess: isPinMetadataSuccess,
  } = usePinDaoMetadata({
    onSuccess: setMetadataCid,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    pinDaoMetadata();
  });

  const isLoading = isPinMetadataLoading;
  const isError = isPinMetadataError;

  const alertMessage = useMemo(() => {
    if (isPinMetadataError) {
      return 'Unable to pin data to IPFS';
    } else if (isPinMetadataSuccess) {
      return 'Successfully pinned IPFS data';
    }
  }, [isPinMetadataError, isPinMetadataSuccess]);

  const alertVariant = isError ? 'critical' : 'info';

  const buttonAction = isPinMetadataError ? pinDaoMetadata : () => null;
  const buttonLabel = isPinMetadataLoading
    ? 'Pinning IPFS data'
    : isPinMetadataError
    ? 'Retry'
    : 'Confirming';

  return (
    <TransactionDialog isOpen={isOpen} {...otherProps}>
      <Button isLoading={isLoading} onClick={buttonAction}>
        {buttonLabel}
      </Button>
      {alertMessage && (
        <AlertInline message={alertMessage} variant={alertVariant} />
      )}
    </TransactionDialog>
  );
};
