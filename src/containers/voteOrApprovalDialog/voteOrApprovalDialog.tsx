import React from 'react';
import {ModalProps} from '@aragon/ods-old';
import {TransactionDialog} from 'containers/transactionDialog';
import {useVoteOrApprovalTransaction} from 'services/transactions/queries/useVoteOrApprovalTransaction';
import {voteOrApprovalUtils} from './utils/index';
import {IBuildVoteOrApprovalTransactionParams} from 'services/transactions/transactionsService.api';
import {useSendVoteOrApprovalTransaction} from './hooks';
import {useTranslation} from 'react-i18next';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {
  MultisigProposal,
  TokenVotingProposal,
  VoteValues,
} from '@aragon/sdk-client';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';

/**
 * Represents the props for the VoteOrApprovalDialog component.
 */
export interface IVoteOrApprovalDialogProps extends ModalProps {
  tryExecution: boolean;
  vote?: VoteValues;
  replacingVote?: boolean;
  setVoteOrApprovalSubmitted: (value: boolean) => void;
  proposal: MultisigProposal | TokenVotingProposal | GaslessVotingProposal;
}

const voteOrApprovalProcess = 'VOTE_OR_APPROVAL';

export const VoteOrApprovalDialog: React.FC<
  IVoteOrApprovalDialogProps
> = props => {
  const {
    isOpen,
    onClose,
    tryExecution,
    replacingVote,
    vote,
    proposal,
    setVoteOrApprovalSubmitted,
    ...otherProps
  } = props;

  const {data: daoDetails} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {t} = useTranslation();
  const pluginClient = usePluginClient(pluginType as PluginTypes);

  const voteOrApprovalParams = voteOrApprovalUtils.buildVoteOrApprovalParams(
    pluginType,
    tryExecution,
    vote
  );

  const {data: transaction} = useVoteOrApprovalTransaction(
    {
      ...voteOrApprovalParams,
      pluginClient,
    } as IBuildVoteOrApprovalTransactionParams,
    {enabled: voteOrApprovalParams != null && pluginClient != null}
  );

  const sendTransactionResults = useSendVoteOrApprovalTransaction({
    process: voteOrApprovalProcess,
    transaction,
    replacingVote,
    vote,
    proposal,
    setVoteOrApprovalSubmitted,
  });

  const handleSuccessClick = () => onClose?.();

  const dialogType =
    pluginType === 'multisig.plugin.dao.eth' ? 'approval' : 'vote';

  const dialogContext =
    dialogType === 'approval' && tryExecution ? 'execute' : undefined;

  console.log({dialogContext});

  return (
    <TransactionDialog
      title={t(`voteOrApprovalDialog.title.${dialogType}`, {
        context: dialogContext,
      })}
      isOpen={isOpen}
      sendTransactionResult={sendTransactionResults}
      displayTransactionStatus={transaction != null}
      sendTransactionLabel={t(
        `voteOrApprovalDialog.button.${dialogType}.approve`,
        {context: dialogContext}
      )}
      successButton={{
        label: t(`voteOrApprovalDialog.button.${dialogType}.success`),
        onClick: handleSuccessClick,
      }}
      onClose={onClose}
      {...otherProps}
    />
  );
};
