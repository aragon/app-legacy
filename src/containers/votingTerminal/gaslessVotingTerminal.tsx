import {TerminalTabs, VotingTerminal, VotingTerminalProps} from './index';
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {getFormattedUtcOffset, KNOWN_FORMATS} from '../../utils/date';
import {VoterType} from '@aragon/ods-old';
import styled from 'styled-components';
import {AccordionMultiple} from '../../components/accordionMethod';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import {useGaslessCommiteVotes} from '../../context/useGaslessVoting';
import {useWallet} from '../../hooks/useWallet';
import {useProposalTransactionContext} from '../../context/proposalTransaction';
import {
  ExecutionWidget,
  ExecutionWidgetProps,
} from '../../components/executionWidget';
import {getProposalExecutionStatus} from '../../utils/proposals';
import {PENDING_PROPOSAL_STATUS_INTERVAL} from '../../pages/proposal';
import {
  getApproveStatusLabel,
  getCommitteVoteButtonLabel,
} from '../../utils/committeeVoting';
import {PluginTypes} from '../../hooks/usePluginClient';
import {VotingTerminalAccordionItem} from './accordionItem';
import {ProposalStatus} from '@aragon/sdk-client-common';

type GaslessExecutionWidgetProps = Pick<
  ExecutionWidgetProps,
  'actions' | 'onExecuteClicked'
>;

type GaslessVotingTerminalProps = {
  votingStatusLabel: string;
  proposal: GaslessVotingProposal;
  pluginAddress: string;
  statusRef: React.MutableRefObject<{
    wasNotLoggedIn: boolean;
    wasOnWrongNetwork: boolean;
  }>;
  connectedToRightNetwork: boolean;
  pluginType: PluginTypes;
} & GaslessExecutionWidgetProps &
  PropsWithChildren;

export const GaslessVotingTerminal: React.FC<GaslessVotingTerminalProps> = ({
  votingStatusLabel,
  proposal,
  pluginAddress,
  statusRef,
  actions,
  onExecuteClicked,
  connectedToRightNetwork,
  pluginType,
  children,
}) => {
  const {t, i18n} = useTranslation();
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('breakdown');
  const [approvalStatus, setApprovalStatus] = useState('');

  const {address, isOnWrongNetwork} = useWallet();

  const {
    canApprove,
    isUserApproved,
    isProposalApproved,
    canBeExecuted,
    executableWithNextApproval,
    isApprovalPeriod,
    notBegan,
  } = useGaslessCommiteVotes(pluginAddress, proposal);

  const {handleExecutionMultisigApprove, executionFailed, executionTxHash} =
    useProposalTransactionContext();

  const mappedProps = useMemo(() => {
    if (!proposal) return;

    const endDate = `${format(
      proposal.parameters.tallyEndDate!,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`;

    const startDate = `${format(
      proposal.parameters.endDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`;

    const voters: VoterType[] = proposal.settings.executionMultisigMembers!.map(
      member => {
        if (
          proposal.approvers
            .map(string => string.toLowerCase())
            .includes(member.toLowerCase())
        ) {
          return {wallet: member, option: 'approved'} as VoterType;
        }
        return {wallet: member, option: 'none'} as VoterType;
      }
    );

    return {
      approvals: proposal.approvers,
      voters,
      minApproval: proposal.settings.minTallyApprovals,
      strategy: t('votingTerminal.multisig.strategy'),
      voteOptions: t('votingTerminal.approve'),
      startDate,
      endDate,
    } as VotingTerminalProps;
  }, [proposal, t]);

  const buttonLabel = useMemo(() => {
    if (proposal) {
      return getCommitteVoteButtonLabel(
        notBegan,
        isUserApproved,
        isProposalApproved,
        isApprovalPeriod,
        executableWithNextApproval,
        t
      );
    }
  }, [
    proposal,
    notBegan,
    isUserApproved,
    isProposalApproved,
    isApprovalPeriod,
    executableWithNextApproval,
    t,
  ]);

  const voteNowDisabled =
    // can only vote on active proposals
    proposal?.status !== ProposalStatus.ACTIVE ||
    // when disconnected or on wrong network,
    // login and network modals should be shown respectively
    (connectedToRightNetwork && !canApprove);

  const handleApprovalClick = useCallback(
    (tryExecution: boolean) => {
      if (address == null) {
        open('wallet');
        statusRef.current.wasNotLoggedIn = true;
      } else if (isOnWrongNetwork) {
        open('network');
        statusRef.current.wasOnWrongNetwork = true;
      } else if (canApprove) {
        handleExecutionMultisigApprove({
          proposalId: proposal.id,
          tryExecution,
        });
      }
    },
    [
      address,
      canApprove,
      handleExecutionMultisigApprove,
      isOnWrongNetwork,
      proposal.id,
      statusRef,
    ]
  );

  /**
   * It sets the approval status label.
   *
   * Uses an interval to update the label every 10 seconds.
   */
  useEffect(() => {
    if (proposal) {
      // set the very first time
      setApprovalStatus(getApproveStatusLabel(proposal, t, i18n.language));

      const interval = setInterval(async () => {
        const v = getApproveStatusLabel(proposal, t, i18n.language);

        // remove interval timer once the proposal has started
        if (proposal.startDate.valueOf() <= new Date().valueOf()) {
          clearInterval(interval);
          // setIntervalInMills(PROPOSAL_STATUS_INTERVAL);
          setApprovalStatus(v);
        } else if (proposal.status === 'Pending') {
          setApprovalStatus(v);
        }
      }, PENDING_PROPOSAL_STATUS_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [i18n.language, isApprovalPeriod, proposal, t]);

  const displayAlertMessage =
    isApprovalPeriod && // active proposal
    address && // logged in
    !isOnWrongNetwork && // on proper network
    !canApprove; // cannot approve

  const alertMessage = displayAlertMessage
    ? t('votingTerminal.status.ineligibleWhitelist')
    : undefined;

  // proposal execution status
  const executionStatus = useMemo(() => {
    return getProposalExecutionStatus(
      proposal?.status,
      false,
      executionFailed,
      canBeExecuted
    );
  }, [canBeExecuted, executionFailed, proposal?.status]);

  let defaultAccordion = '';
  if (new Date() < proposal?.parameters.endDate) {
    defaultAccordion = 'community-voting';
  } else if (new Date() < proposal.parameters.tallyEndDate!) {
    defaultAccordion = 'actions-approval';
  }

  return (
    <>
      <Container>
        <Header>
          <Title>{t('votingTerminal.vocdoni.title')}</Title>
          <Summary>{t('votingTerminal.vocdoni.desc')}</Summary>
        </Header>
        <AccordionMultiple defaultValue={defaultAccordion}>
          <VotingTerminalAccordionItem
            name={'community-voting'}
            methodName={t('votingTerminal.vocdoni.titleCommunityVoting')}
            alertLabel={votingStatusLabel}
          >
            {children}
          </VotingTerminalAccordionItem>
          <VotingTerminalAccordionItem
            name={'actions-approval'}
            methodName={t('votingTerminal.vocdoni.titleActionsApproval')}
            alertLabel={approvalStatus}
          >
            <VotingTerminal
              status={proposal.status}
              pluginType={pluginType}
              selectedTab={terminalTab}
              alertMessage={alertMessage}
              onTabSelected={setTerminalTab}
              onApprovalClicked={handleApprovalClick}
              voteButtonLabel={buttonLabel}
              voteNowDisabled={voteNowDisabled}
              executableWithNextApproval={executableWithNextApproval}
              className={
                'border border-t-0 border-neutral-100 bg-neutral-0 px-4 py-5 md:p-6'
              }
              {...mappedProps}
            />
          </VotingTerminalAccordionItem>
        </AccordionMultiple>
      </Container>
      <ExecutionWidget
        pluginType={pluginType}
        actions={actions}
        status={executionStatus}
        onExecuteClicked={onExecuteClicked}
        txhash={executionTxHash || proposal?.executionTxHash || undefined}
      />
    </>
  );
};

const Header = styled.div.attrs({
  className: 'flex flex-col tablet:justify-between space-y-2 my-2',
})``;
const Title = styled.h1.attrs({
  className: 'ft-text-xl font-semibold text-neutral-800 grow',
})``;
const Summary = styled.h1.attrs({
  className: 'text-neutral-800 text-sm md:text-base leading-normal',
})``;

const Container = styled.div.attrs({
  className:
    'md:p-6 py-5 px-4 rounded-xl bg-neutral-0 border border-neutral-100',
})``;
