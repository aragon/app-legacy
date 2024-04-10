import React, {useState} from 'react';
import {ModalProps} from '@aragon/ods-old';
import {TransactionDialog} from 'containers/transactionDialog';
import {useNetwork} from 'context/network';
import {useVoteOrApprovalTransaction} from 'services/transactions/queries/useVoteOrApprovalTransaction';
import {createDaoUtils} from './utils';
import {useFormContext} from 'react-hook-form';
import {CreateDaoFormData} from 'utils/types';
import {IBuildVoteOrApprovalTransactionParams} from 'services/transactions/transactionsService.api';
import {generatePath, useNavigate} from 'react-router-dom';
import {Dashboard} from 'utils/paths';
import {useClient} from 'hooks/useClient';
import {useSendCreateDaoTransaction} from './hooks';
import {useTranslation} from 'react-i18next';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';

export interface IVoteOrApprovalDialogProps extends ModalProps {
  pluginType: PluginTypes;
}

const createDaoProcess = 'CREATE_DAO';

export const VoteOrApprovalDialog: React.FC<
  IVoteOrApprovalDialogProps
> = props => {
  const {isOpen, onClose, pluginType, ...otherProps} = props;

  const {t} = useTranslation();
  const {network} = useNetwork();
  const pluginClient = usePluginClient(pluginType as PluginTypes);
  const navigate = useNavigate();

  const {getValues} = useFormContext<CreateDaoFormData>();
  const formValues = getValues();

  const createDaoParams = createDaoUtils.buildCreateDaoParams(
    formValues,
    metadataCid
  );

  const {data: transaction, isInitialLoading: isTransactionLoading} =
    useVoteOrApprovalTransaction(
      {
        ...createDaoParams,
        pluginClient,
      } as IBuildVoteOrApprovalTransactionParams,
      {enabled: createDaoParams != null && pluginClient != null}
    );

  const sendTransactionResults = useSendCreateDaoTransaction({
    process: createDaoProcess,
    transaction,
    metadataCid,
    createDaoParams,
  });

  const onSuccessButtonClick = () => {
    const {daoAddress} = createDaoUtils.getDaoAddressesFromReceipt(
      sendTransactionResults.txReceipt
    )!;
    const daoPathParams = {network, dao: daoAddress};
    const daoPath = generatePath(Dashboard, daoPathParams);
    navigate(daoPath);
    onClose?.();

    if (network === 'ethereum') {
      open('poapClaim');
    }
  };

  return (
    <TransactionDialog
      title={t('createDaoDialog.title')}
      isOpen={isOpen}
      sendTransactionResult={sendTransactionResults}
      displayTransactionStatus={transaction != null}
      sendTransactionLabel="createDaoDialog.button.approve"
      successButton={{
        label: 'createDaoDialog.button.success',
        onClick: onSuccessButtonClick,
      }}
      onClose={onClose}
      {...otherProps}
    />
  );
};
