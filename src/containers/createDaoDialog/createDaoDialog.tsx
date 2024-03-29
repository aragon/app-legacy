import React, {useEffect, useMemo, useState} from 'react';
import {ModalProps} from '@aragon/ods-old';
import {TransactionDialog} from 'containers/transactionDialog';
import {usePinDaoMetadata} from './hooks';
import {AlertInline, Button} from '@aragon/ods';
import {useNetwork} from 'context/network';
import {useCreateDaoTransaction} from 'services/transactions/queries/useCreateDaoTransaction';
import {createDaoUtils} from './utils';
import {useFormContext} from 'react-hook-form';
import {CreateDaoFormData} from 'utils/types';
import {IBuildCreateDaoTransactionParams} from 'services/transactions/transactionsService.api';
import {generatePath, useNavigate} from 'react-router-dom';
import {Dashboard} from 'utils/paths';
import {useClient} from 'hooks/useClient';
import {useSendCreateDaoTransaction} from './hooks/useSendCreateDaoTransaction';

export interface ICreateDaoDialogProps extends ModalProps {}

export const CreateDaoDialog: React.FC<ICreateDaoDialogProps> = props => {
  const {isOpen, ...otherProps} = props;

  const {network} = useNetwork();
  const {client} = useClient();
  const navigate = useNavigate();

  const {getValues} = useFormContext<CreateDaoFormData>();
  const formValues = getValues();

  const [metadataCid, setMetadataCid] = useState<string>();

  const {
    pinDaoMetadata,
    isPending: isPinMetadataLoading,
    isError: isPinMetadataError,
    isSuccess: isPinMetadataSuccess,
  } = usePinDaoMetadata({
    process: 'CREATE_DAO',
    onSuccess: setMetadataCid,
  });

  const createDaoParams = createDaoUtils.buildCreateDaoParams(
    formValues,
    metadataCid
  );

  const {data: transaction, isFetching: isTransactionLoading} =
    useCreateDaoTransaction(
      {...createDaoParams, client} as IBuildCreateDaoTransactionParams,
      {enabled: createDaoParams != null && client != null}
    );

  const sendTransactionResults = useSendCreateDaoTransaction({
    process: 'CREATE_DAO',
    transaction,
    metadataCid,
    createDaoParams,
  });

  const onSuccessButtonClick = () => {
    const {daoAddress} =
      createDaoUtils.getDaoAddressesFromReceipt(
        sendTransactionResults.txReceipt
      ) ?? {};
    const daoPathParams = {network, dao: daoAddress};
    const daoPath = generatePath(Dashboard, daoPathParams);
    navigate(daoPath);

    if (network === 'ethereum') {
      open('poapClaim');
    }
  };

  useEffect(() => {
    const shouldPinMetadata =
      isOpen &&
      !isPinMetadataError &&
      !isPinMetadataLoading &&
      !isPinMetadataSuccess;

    if (shouldPinMetadata) {
      pinDaoMetadata();
    }
  }, [
    isOpen,
    pinDaoMetadata,
    isPinMetadataError,
    isPinMetadataSuccess,
    isPinMetadataLoading,
  ]);

  const isLoading = isPinMetadataLoading || isTransactionLoading;
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
    : 'Preparing transaction';

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
      <Button
        isLoading={isLoading}
        onClick={buttonAction}
        className="self-stretch"
      >
        {buttonLabel}
      </Button>
      {alertMessage && (
        <AlertInline message={alertMessage} variant={alertVariant} />
      )}
    </TransactionDialog>
  );
};
