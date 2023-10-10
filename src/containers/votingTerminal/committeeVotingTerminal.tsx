import {TerminalTabs, VotingTerminal, VotingTerminalProps} from './index';
import React, {ReactNode, useEffect, useMemo, useState} from 'react';
import {TFunction, useTranslation} from 'react-i18next';
import {format, formatDistanceToNow} from 'date-fns';
import {getFormattedUtcOffset, KNOWN_FORMATS} from '../../utils/date';
import {VoterType} from '@aragon/ods';
import styled from 'styled-components';
import {AccordionItem} from '../../components/accordionMethod';
import {Accordion} from '@radix-ui/react-accordion';
import {GaslessVotingProposal} from '@vocdoni/offchain-voting';
import {GaselessPluginName, usePluginClient} from '../../hooks/usePluginClient';
import {useGaslessCommiteVotes} from '../../context/useOffchainVoting';
import {ProposalId} from '../../utils/types';
import {useWallet} from '../../hooks/useWallet';
import {useProposalTransactionContext} from '../../context/proposalTransaction';
import {VoteValues} from '@aragon/sdk-client';
import {
  ExecutionWidget,
  ExecutionWidgetProps,
} from '../../components/executionWidget';
import {getProposalExecutionStatus} from '../../utils/proposals';

type CommitteeExecutionWidgetProps = Pick<
  ExecutionWidgetProps,
  'actions' | 'onExecuteClicked'
>;

export const CommitteeVotingTerminal = ({
  votingStatusLabel,
  votingTerminal,
  proposal,
  proposalId,
  statusRef,
  actions,
  onExecuteClicked,
}: {
  votingStatusLabel: string;
  votingTerminal: ReactNode;
  proposal: GaslessVotingProposal;
  proposalId: ProposalId | undefined;
  statusRef: React.MutableRefObject<{
    wasNotLoggedIn: boolean;
    wasOnWrongNetwork: boolean;
  }>;
} & CommitteeExecutionWidgetProps) => {
  const {t} = useTranslation();
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('breakdown');
  const pluginClient = usePluginClient(GaselessPluginName);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [intervalInMills, setIntervalInMills] = useState(0);

  const {isOnWrongNetwork} = useWallet();

  const {address} = proposalId!.stripPlgnAdrFromProposalId();

  const {
    canApprove,
    approved,
    isApproved,
    canBeExecuted,
    nextVoteWillApprove,
    proposalCanBeApproved,
    isApprovalPeriod,
    executed,
    notBegan,
  } = useGaslessCommiteVotes(address, proposal);

  const {handleSubmitVote, transactionHash, pluginType, executionFailed} =
    useProposalTransactionContext();

  const mappedProps = useMemo(() => {
    if (!proposal) return;

    const endDate = `${format(
      proposal.parameters.expirationDate,
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
      // The voters list is not on the proposal object
      // voters: proposal.approvers.map(([approver, _]) => ({wallet: approver, option: 'yes'} as VoterType)),
      voters,
      minApproval: proposal.settings.minTallyApprovals,
      // voters: [...mappedMembers.values()],
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
        t
      );
    }
  }, [proposal, executed, notBegan, approved, canBeExecuted, canApprove, t]);

  // vote button state and handler
  const {voteNowDisabled, onClick} = useMemo(() => {
    // disable voting on non-active proposals
    // if (proposal?.executed || proposal?.status === ProposalStatus.DEFEATED) {
    if (!isApprovalPeriod) {
      return {voteNowDisabled: true};
    }

    // disable approval on when wallet has voted or can't vote
    if (!canApprove || approved) return {voteNowDisabled: true};

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
          handleSubmitVote(VoteValues.YES);
        },
      };
    } else return {voteNowDisabled: true};
  }, [
    address,
    canApprove,
    handleSubmitVote,
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
  // todo(kon): this is a copy paste from src/pages/proposal.tsx
  useEffect(() => {
    if (proposal) {
      // set the very first time
      setApprovalStatus(getApproveStatusLabel(proposal, isApprovalPeriod, t));

      const interval = setInterval(async () => {
        const v = getApproveStatusLabel(proposal, isApprovalPeriod, t);

        // remove interval timer once the proposal has started
        if (proposal.startDate.valueOf() <= new Date().valueOf()) {
          clearInterval(interval);
          setIntervalInMills(PROPOSAL_STATUS_INTERVAL);
          setApprovalStatus(v);
        } else if (proposal.status === 'Pending') {
          setApprovalStatus(v);
        }
      }, PENDING_PROPOSAL_STATUS_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [proposal, t]);

  const CommitteeVotingTerminal = () => {
    return (
      <VotingTerminal
        status={proposal.status}
        statusLabel={approvalStatus} // todo(kon): implement committee vote status
        selectedTab={terminalTab}
        // alertMessage={alertMessage} // todo(kon): implement
        onTabSelected={setTerminalTab}
        onVoteClicked={onClick} // todo(kon): implement
        // onCancelClicked={() => setVotingInProcess(false)}
        voteButtonLabel={buttonLabel}
        voteNowDisabled={voteNowDisabled}
        // votingInProcess={votingInProcess} // Only for token voting
        // onVoteSubmitClicked={() => {
        //   console.log('onVoteSubmitClicked');
        //   // todo(kon): implement
        //   // handleSubmitVote(
        //   //   vote,
        //   //   (proposal as TokenVotingProposal).token?.address
        //   // )
        // }}
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
          <Title>Voting</Title>
          <Summary>
            Proposal must pass with a community vote and then committee
            approval.
          </Summary>
        </Header>
        <Accordion type={'multiple'}>
          <AccordionItem
            name={'community-voting'}
            type={'action-builder'}
            methodName={'Community Voting'}
            alertLabel={votingStatusLabel}
          >
            {votingTerminal}
          </AccordionItem>
          <AccordionItem
            name={'actions-approval'}
            type={'action-builder'}
            methodName={'Actions approval'}
            alertLabel={approvalStatus} // todo(kon): implement committee vote status
          >
            <CommitteeVotingTerminal />
          </AccordionItem>
        </Accordion>
      </Container>
      <ExecutionWidget
        pluginType={pluginType}
        actions={actions}
        status={executionStatus}
        onExecuteClicked={onExecuteClicked}
        txhash={transactionHash || proposal?.executionTxHash || undefined}
      />
    </>
  );
};

// todo(kon): move this somewhere?
function getCommitteVoteButtonLabel(
  executed: boolean,
  notBegan: boolean,
  voted: boolean,
  canApprove: boolean,
  t: TFunction
) {
  if (executed) {
    return t('offchainVotingTerminal.btnLabel.executed');
  } else if (notBegan) {
    return t('offchainVotingTerminal.btnLabel.approve');
  } else if (voted) {
    return t('offchainVotingTerminal.btnLabel.voted');
  } else if (canApprove) {
    return t('offchainVotingTerminal.btnLabel.approve');
  }
  return t('offchainVotingTerminal.btnLabel.concluded');
}

const PROPOSAL_STATUS_INTERVAL = 1000 * 60;
const PENDING_PROPOSAL_STATUS_INTERVAL = 1000 * 10;

// todo(kon): this is a copy paste from src/pages/proposal.tsx. we could modify the function to receive
// endate start date and status
function getApproveStatusLabel(
  proposal: GaslessVotingProposal,
  isApprovalPeriod: boolean,
  t: TFunction
) {
  let label = '';

  if (proposal.status === 'Pending' || proposal.status === 'Active') {
    // Uncomment line below is causing SyntaxError: ambiguous indirect export: default 🤷‍♀️
    // const locale = (Locales as Record<string, Locale>)[i18n.language];

    if (!isApprovalPeriod) {
      const timeUntilNow = formatDistanceToNow(proposal.endDate, {
        includeSeconds: true,
        // locale,
      });
      label = t('votingTerminal.status.pending', {timeUntilNow});
    } else {
      const timeUntilEnd = formatDistanceToNow(proposal.expirationDate, {
        includeSeconds: true,
        // locale,
      });
      label = t('votingTerminal.status.active', {timeUntilEnd});
    }
  } else if (proposal.status === 'Succeeded') {
    label = t('votingTerminal.status.succeeded');
  } else if (proposal.status === 'Executed') {
    label = t('votingTerminal.status.executed');
  } else if (proposal.status === 'Defeated') {
    label = t('votingTerminal.status.defeated');
  }
  return label;
}

const Header = styled.div.attrs({
  className: 'flex flex-col tablet:justify-between space-y-2 my-2',
})``;
const Title = styled.h1.attrs({
  className: 'ft-text-xl font-bold text-ui-800 flex-grow',
})``;
const Summary = styled.h1.attrs({
  className: 'ft-text-md text-ui-500 flex-grow',
})``;

const Container = styled.div.attrs({
  className: 'tablet:p-3 py-2.5 px-2 rounded-xl bg-ui-0 border border-ui-100',
})``;
