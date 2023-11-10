import {TerminalTabs, VotingTerminal, VotingTerminalProps} from './index';
import React, {PropsWithChildren, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {getFormattedUtcOffset, KNOWN_FORMATS} from '../../utils/date';
import {VoterType} from '@aragon/ods-old';
import styled from 'styled-components';
import {AccordionItem} from '../../components/accordionMethod';
import {Accordion} from '@radix-ui/react-accordion';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import {useGaslessCommiteVotes} from '../../context/useGaslessVoting';
import {useWallet} from '../../hooks/useWallet';
import {useProposalTransactionContext} from '../../context/proposalTransaction';
import {VoteValues} from '@aragon/sdk-client';
import {
  ExecutionWidget,
  ExecutionWidgetProps,
} from '../../components/executionWidget';
import {getProposalExecutionStatus} from '../../utils/proposals';
import {
  PENDING_PROPOSAL_STATUS_INTERVAL,
  // PROPOSAL_STATUS_INTERVAL,
} from '../../pages/proposal';
import {
  getApproveStatusLabel,
  getCommitteVoteButtonLabel,
} from '../../utils/committeeVoting';
import {PluginTypes} from '../../hooks/usePluginClient';

type CommitteeExecutionWidgetProps = Pick<
  ExecutionWidgetProps,
  'actions' | 'onExecuteClicked'
>;

type CommitteeVotingTerminalProps = {
  votingStatusLabel: string;
  proposal: GaslessVotingProposal;
  pluginAddress: string;
  statusRef: React.MutableRefObject<{
    wasNotLoggedIn: boolean;
    wasOnWrongNetwork: boolean;
  }>;
  pluginType: PluginTypes;
} & CommitteeExecutionWidgetProps &
  PropsWithChildren;

export const CommitteeVotingTerminal: React.FC<
  CommitteeVotingTerminalProps
> = ({
  votingStatusLabel,
  proposal,
  pluginAddress,
  statusRef,
  actions,
  onExecuteClicked,
  pluginType,
  children,
}) => {
  const {t, i18n} = useTranslation();
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('breakdown');
  const [approvalStatus, setApprovalStatus] = useState('');
  // const [intervalInMills, setIntervalInMills] = useState(0);

  const {address, isOnWrongNetwork} = useWallet();

  const {
    canApprove,
    approved,
    isApproved,
    canBeExecuted,
    isApprovalPeriod,
    executed,
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

    const voters = new Array<VoterType>(
      proposal.settings.minTallyApprovals
    ).map((_, i) => {
      if (proposal.approvers[i]) {
        return {wallet: proposal.approvers[i], option: 'yes'} as VoterType;
      }
    });

    return {
      approvals: proposal.approvers,
      voters,
      minApproval: proposal.settings.minTallyApprovals,
      strategy: t('votingTerminal.multisig'),
      voteOptions: t('votingTerminal.approve'),
      startDate,
      endDate,
    } as VotingTerminalProps;
  }, [proposal, t]);

  const buttonLabel = useMemo(() => {
    if (proposal) {
      return getCommitteVoteButtonLabel(
        executed,
        notBegan,
        approved,
        canApprove,
        isApproved,
        t
      );
    }
  }, [proposal, executed, notBegan, approved, canApprove, isApproved, t]);

  // vote button state and handler
  const {voteNowDisabled, onClick} = useMemo(() => {
    // disable voting on non-active proposals or when wallet has voted or can't vote
    if (!isApprovalPeriod || !canApprove || approved) {
      return {voteNowDisabled: true};
    }

    // not logged in
    if (!address) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('wallet');
          statusRef.current.wasNotLoggedIn = true;
        },
      };
    }

    // wrong network
    else if (isOnWrongNetwork) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('network');
          statusRef.current.wasOnWrongNetwork = true;
        },
      };
    }

    // member, not yet voted
    else if (canApprove) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          handleExecutionMultisigApprove({vote: VoteValues.YES});
        },
      };
    } else return {voteNowDisabled: true};
  }, [
    address,
    canApprove,
    handleExecutionMultisigApprove,
    isApprovalPeriod,
    isOnWrongNetwork,
    statusRef,
    approved,
  ]);

  /**
   * It sets the approval status label.
   *
   * Uses an interval to update the label every 10 seconds.
   */
  useEffect(() => {
    if (proposal) {
      // set the very first time
      setApprovalStatus(
        getApproveStatusLabel(proposal, isApprovalPeriod, t, i18n.language)
      );

      const interval = setInterval(async () => {
        const v = getApproveStatusLabel(
          proposal,
          isApprovalPeriod,
          t,
          i18n.language
        );

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

  // alert message, only shown when not eligible to vote
  const alertMessage = useMemo(() => {
    if (!isApprovalPeriod) {
      return t('votingTerminal.vocdoni.cannotApproveYet');
    } else if (
      proposal &&
      isApprovalPeriod && // active proposal
      address && // logged in
      !isOnWrongNetwork && // on proper network
      !canApprove && // cannot vote
      !approved // Already voted
    ) {
      return t('votingTerminal.vocdoni.notInCommittee');
    }
  }, [
    isApprovalPeriod,
    proposal,
    address,
    isOnWrongNetwork,
    canApprove,
    approved,
    t,
  ]);

  const ApprovalVotingTerminal = () => {
    return (
      <VotingTerminal
        title={t('votingTerminal.vocdoni.titleActionsApproval')}
        status={proposal.status}
        pluginType={pluginType}
        statusLabel={approvalStatus}
        selectedTab={terminalTab}
        alertMessage={alertMessage}
        onTabSelected={setTerminalTab}
        onVoteClicked={onClick}
        voteButtonLabel={buttonLabel}
        voteNowDisabled={voteNowDisabled}
        {...mappedProps}
      />
    );
  };

  // proposal execution status
  const executionStatus = useMemo(() => {
    return getProposalExecutionStatus(
      proposal?.status,
      false,
      executionFailed,
      canBeExecuted
    );
  }, [canBeExecuted, executionFailed, proposal?.status]);

  return (
    <>
      <Container>
        <Header>
          <Title>{t('votingTerminal.vocdoni.title')}</Title>
          <Summary>{t('votingTerminal.vocdoni.desc')}</Summary>
        </Header>
        <Accordion type={'multiple'}>
          <AccordionItem
            name={'community-voting'}
            type={'action-builder'}
            methodName={'Community Voting'}
            alertLabel={votingStatusLabel}
          >
            {children}
          </AccordionItem>
          <AccordionItem
            name={'actions-approval'}
            type={'action-builder'}
            methodName={'Actions approval'}
            alertLabel={approvalStatus}
          >
            <ApprovalVotingTerminal />
          </AccordionItem>
        </Accordion>
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
