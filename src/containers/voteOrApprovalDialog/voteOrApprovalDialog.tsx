import React from 'react';
import {ModalProps} from '@aragon/ods-old';
import {TransactionDialog} from 'containers/transactionDialog';
import {useVoteOrApprovalTransaction} from 'services/transactions/queries/useVoteOrApprovalTransaction';
import {voteOrApprovalUtils} from './utils/index';
import {IBuildVoteOrApprovalTransactionParams} from 'services/transactions/transactionsService.api';
import {useSendVoteOrApprovalTransaction} from './hooks';
import {useTranslation} from 'react-i18next';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {VoteValues} from '@aragon/sdk-client';
import {BigNumber} from 'ethers';

/**
 * Represents the props for the VoteOrApprovalDialog component.
 */
export interface IVoteOrApprovalDialogProps extends ModalProps {
  pluginType: PluginTypes;
  tryExecution: boolean;
  vote?: VoteValues;
  votingPower?: BigNumber;
  replacingVote?: boolean;
  voteTokenAddress?: string;
  setVoteOrApprovalSubmitted: (value: boolean) => void;
}

const VoteOrApprovalProcess = 'VOTE_OR_APPROVAL';

export const VoteOrApprovalDialog: React.FC<
  IVoteOrApprovalDialogProps
> = props => {
  const {
    isOpen,
    onClose,
    pluginType,
    tryExecution,
    replacingVote,
    vote,
    votingPower,
    setVoteOrApprovalSubmitted,
    ...otherProps
  } = props;

  const DialogTexts =
    pluginType === 'multisig.plugin.dao.eth' ? 'approval' : 'vote';

  const {t} = useTranslation();
  const pluginClient = usePluginClient(pluginType as PluginTypes);

  const VoteOrApprovalParams = voteOrApprovalUtils.buildVoteOrApprovalParams(
    pluginType,
    tryExecution,
    vote
  );

  const {data: transaction} = useVoteOrApprovalTransaction(
    {
      ...VoteOrApprovalParams,
      pluginClient,
    } as IBuildVoteOrApprovalTransactionParams,
    {enabled: VoteOrApprovalParams != null && pluginClient != null}
  );

  const sendTransactionResults = useSendVoteOrApprovalTransaction({
    process: VoteOrApprovalProcess,
    pluginType,
    transaction,
    votingPower,
    replacingVote,
    vote,
    setVoteOrApprovalSubmitted,
  });

  return (
    <TransactionDialog
      title={t(`voteOrApprovalDialog.title.${DialogTexts}`)}
      isOpen={isOpen}
      sendTransactionResult={sendTransactionResults}
      displayTransactionStatus={transaction != null}
      sendTransactionLabel={t(
        `voteOrApprovalDialog.button.${DialogTexts}.approve`
      )}
      successButton={{
        label: t(`voteOrApprovalDialog.button.${DialogTexts}.success`),
        onClick: () => {
          onClose?.();
        },
      }}
      onClose={onClose}
      {...otherProps}
    />
  );
};
