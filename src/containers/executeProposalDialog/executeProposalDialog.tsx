import React from 'react';
import {ModalProps} from '@aragon/ods-old';
import {TransactionDialog} from 'containers/transactionDialog';
import {useTranslation} from 'react-i18next';
import {useSendExecuteProposalTransaction} from './hooks';
import {useCreateExecuteTransactionProposal} from './hooks/useCreateExecuteProposalTransaction';
import {Button} from '@aragon/ods';

export interface IExecuteProposalDialogProps extends ModalProps {}

const executeProposalProcess = 'EXECUTE_PROPOSAL';

export const ExecuteProposalDialog: React.FC<
  IExecuteProposalDialogProps
> = props => {
  const {isOpen, onClose, ...otherProps} = props;

  const {t} = useTranslation();

  const {transaction, isLoading: isTransactionLoading} =
    useCreateExecuteTransactionProposal();

  const sendTransactionResults = useSendExecuteProposalTransaction({
    process: executeProposalProcess,
    transaction,
  });

  const onSuccessButtonClick = () => {
    //
  };

  return (
    <TransactionDialog
      title={t('executeTransactionDialog.title')}
      isOpen={isOpen}
      sendTransactionResult={sendTransactionResults}
      displayTransactionStatus={transaction != null}
      sendTransactionLabel="executeTransactionDialog.button.approve"
      successButton={{
        label: 'executeTransactionDialog.button.success',
        onClick: onSuccessButtonClick,
      }}
      onClose={onClose}
      {...otherProps}
    >
      <Button isLoading={isTransactionLoading} className="self-stretch">
        {t('transactionDialog.button.preparing')}
      </Button>
    </TransactionDialog>
  );
};
