import React, {useState} from 'react';
import {ModalProps} from '@aragon/ods-old';
import {TransactionDialog} from 'containers/transactionDialog';
import {useNetwork} from 'context/network';
import {useVoteOrApprovalTransaction} from 'services/transactions/queries/useVoteOrApprovalTransaction';
import {VoteOrApprovalUtils} from './utils/index';
import {useFormContext} from 'react-hook-form';
import {CreateDaoFormData} from 'utils/types';
import {IBuildVoteOrApprovalTransactionParams} from 'services/transactions/transactionsService.api';
import {generatePath, useNavigate} from 'react-router-dom';
import {Dashboard} from 'utils/paths';
import {useSendVoteOrApprovalTransaction} from './hooks';
import {useTranslation} from 'react-i18next';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';

export interface IVoteOrApprovalDialogProps extends ModalProps {
  pluginType: PluginTypes;
}

const VoteOrApprovalProcess = 'VOTE_OR_APPROVAL';

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

  const VoteOrApprovalParams =
    VoteOrApprovalUtils.buildVoteOrApprovalParams(pluginType);

  const {data: transaction, isInitialLoading: isTransactionLoading} =
    useVoteOrApprovalTransaction(
      {
        ...VoteOrApprovalParams,
        pluginClient,
      } as IBuildVoteOrApprovalTransactionParams,
      {enabled: VoteOrApprovalParams != null && pluginClient != null}
    );

  const sendTransactionResults = useSendVoteOrApprovalTransaction({
    process: VoteOrApprovalProcess,
    transaction,
    VoteOrApprovalParams,
  });

  const onSuccessButtonClick = () => {};

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
