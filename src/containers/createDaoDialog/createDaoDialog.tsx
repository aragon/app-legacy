import React, {useEffect, useMemo, useState} from 'react';
import {ModalProps} from '@aragon/ods-old';
import {TransactionDialog} from 'containers/transactionDialog';
import {usePinDaoMetadata} from './hooks';
import {AlertInline, Button} from '@aragon/ods';
import {useNetwork} from 'context/network';
import {useCreateDaoTransaction} from 'services/transactions/queries/useCreateDaoTransaction';
import {useSendTransaction} from 'hooks/useSendTransaction';
import {createDaoUtils} from './utils';
import {useFormContext} from 'react-hook-form';
import {CreateDaoFormData} from 'utils/types';
import {IBuildCreateDaoTransactionParams} from 'services/transactions/transactionsService.api';
import {generatePath, useNavigate} from 'react-router-dom';
import {Dashboard} from 'utils/paths';
import {useClient} from 'hooks/useClient';

export interface ICreateDaoDialogProps extends ModalProps {}

export const CreateDaoDialog: React.FC<ICreateDaoDialogProps> = props => {
  const {isOpen, ...otherProps} = props;

  const {network} = useNetwork();
  const {client} = useClient();
  const navigate = useNavigate();
  const {getValues} = useFormContext<CreateDaoFormData>();

  const [metadataCid, setMetadataCid] = useState<string>();

  const {
    pinDaoMetadata,
    isPending: isPinMetadataLoading,
    isError: isPinMetadataError,
    isSuccess: isPinMetadataSuccess,
  } = usePinDaoMetadata({
    onSuccess: setMetadataCid,
  });

  const createDaoParams = createDaoUtils.buildCreateDaoParams(
    getValues(),
    metadataCid
  );

  const {data: transaction} = useCreateDaoTransaction(
    {...createDaoParams, client} as IBuildCreateDaoTransactionParams,
    {enabled: createDaoParams != null && client != null}
  );

  const sendTransactionResults = useSendTransaction({transaction});

  const newDaoAddress = createDaoUtils.getDaoAddressFromReceipt(
    sendTransactionResults.txReceipt
  );

  const onSuccessButtonClick = () => {
    const daoPathParams = {network, dao: newDaoAddress};
    const daoPath = generatePath(Dashboard, daoPathParams);
    navigate(daoPath);

    if (network === 'ethereum') {
      open('poapClaim');
    }
  };

  useEffect(() => {
    if (
      isOpen &&
      !isPinMetadataError &&
      !isPinMetadataLoading &&
      !isPinMetadataSuccess
    ) {
      pinDaoMetadata();
    }
  }, [
    isOpen,
    pinDaoMetadata,
    isPinMetadataError,
    isPinMetadataSuccess,
    isPinMetadataLoading,
  ]);

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
    <TransactionDialog
      title="Deploy your DAO"
      isOpen={isOpen}
      sendTransactionResult={sendTransactionResults}
      displayTransactionStatus={transaction != null}
      successButton={{
        label: 'Launch DAO Dashboard',
        onClick: onSuccessButtonClick,
      }}
      {...otherProps}
    >
      <Button isLoading={isLoading} onClick={buttonAction}>
        {buttonLabel}
      </Button>
      {alertMessage && (
        <AlertInline message={alertMessage} variant={alertVariant} />
      )}
    </TransactionDialog>
  );
};
