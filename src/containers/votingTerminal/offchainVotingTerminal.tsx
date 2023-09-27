import {getVoteButtonLabel, getVoteStatus} from '../../utils/proposals';
import {TerminalTabs, VotingTerminal, VotingTerminalProps} from './index';
import React, {ReactNode, useMemo, useState} from 'react';
import {CreateMajorityVotingProposalParams} from '@aragon/sdk-client';
import {ProposalStatus} from '@aragon/sdk-client-common';
import {TFunction, useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {getFormattedUtcOffset, KNOWN_FORMATS} from '../../utils/date';
import {VoterType} from '@aragon/ods';
import styled from 'styled-components';
import {AccordionItem} from '../../components/accordionMethod';
import {Accordion} from '@radix-ui/react-accordion';
import {
  GaslessVotingProposal,
  OffchainVotingClient,
} from '@vocdoni/offchain-voting';
import {usePluginClient} from '../../hooks/usePluginClient';
import {ProposalId} from '../../utils/types';
import {PublishedElection} from '@vocdoni/sdk';

export const OffchainVotingTerminal = ({
  votingStatusLabel,
  votingTerminal,
  proposal,
}: {
  votingStatusLabel: string;
  votingTerminal: ReactNode;
  proposal: GaslessVotingProposal;
  // proposalId: ProposalId | undefined;
  // vocdoniElection: PublishedElection | undefined;
}) => {
  const {t} = useTranslation();
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('breakdown');
  const pluginClient = usePluginClient();
  const offChainVotingClient = pluginClient as OffchainVotingClient;

  // todo(kon): mocked data that will come from proposal info to let the committee vote
  // const members: MultisigMember[] = [
  //   {
  //     address: '0xD8fcFaa76192aa69cceDDAEc554b1d82B0166DC9',
  //   },
  //   {
  //     address: '0x39A62b289586E8F74B7F7d8934a2Dbe7c5bd9755',
  //   },
  // ];
  // const committeeProposal: MultisigProposal = {
  //   actions: [],
  //   approvals: [],
  //   creationBlockNumber: 0,
  //   creationDate: proposal.creationDate,
  //   creatorAddress: '',
  //   dao: {address: '', name: ''},
  //   endDate: new Date(proposal.creationDate.getDate() + 1),
  //   executionBlockNumber: proposal.executionBlockNumber,
  //   executionDate: new Date(proposal.creationDate.getDate()),
  //   executionTxHash: proposal.executionTxHash,
  //   id: '',
  //   metadata: proposal.metadata,
  //   startDate: proposal.startDate,
  //   status: ProposalStatus.PENDING,
  //   settings: {
  //     minApprovals: members.length,
  //     onlyListed: true,
  //   },
  // };
  // const canVote = true;
  // const voted = false;
  // const mappedMembers = new Map(
  //   // map multisig members to voterType
  //   members?.map(member => [
  //     member.address,
  //     {wallet: member.address, option: 'none'} as VoterType,
  //   ])
  // );
  //
  // const committeeVoteStatus = getVoteStatus(committeeProposal, t);

  const mappedProps = useMemo(async () => {
    if (!proposal) return;

    const meta = proposal.vochainMetadata as CreateMajorityVotingProposalParams;

    const mappedMembers = new Map(
      // map multisig members to voterType
      proposal.approvers?.map(member => [
        member,
        {wallet: member, option: 'none'} as VoterType,
      ])
    );
    const endDate = `${format(
      proposal.parameters.endDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`;

    const startDate = `${format(
      proposal.parameters.startDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`;

    return {
      // approvals: proposal.approvals,
      minApproval: proposal.settings.minTallyApprovals,
      voters: [...mappedMembers.values()],
      strategy: t('votingTerminal.multisig'),
      voteOptions: t('votingTerminal.approve'),
      startDate,
      endDate,
    } as VotingTerminalProps;
  }, [proposal, t]);

  // todo(kon): fix this to enable/disable the vote button and it message
  // const committeVoteDisabled =
  //   isCommitteMember && electionRunning && !alreadyVoted;
  // const showCommitteButton = isCommitteMember && !committeVoteDisabled;
  // const committeVoteLabel =
  //   committeVoteCount === 0
  //     ? 'Approve Now'
  //     : committeVoteCount + 1 === tally
  //     ? 'Approve and execute now'
  //     : 'Aprrove';

  const CommitteeVotingTerminal = () => (
    <VotingTerminal
      status={proposal.status}
      statusLabel={votingStatusLabel} // todo(kon): implement committee vote status
      selectedTab={terminalTab}
      // alertMessage={alertMessage}
      onTabSelected={setTerminalTab}
      // onVoteClicked={onClick}
      // onCancelClicked={() => setVotingInProcess(false)}
      // voteButtonLabel={getVoteButtonLabel(committeeProposal, canVote, voted, t)}
      voteButtonLabel={'todo'} // todo(kon): implement getVoteButtonLabel
      // voteNowDisabled={voteNowDisabled}
      // votingInProcess={votingInProcess}
      // onVoteSubmitClicked={vote =>
      //   handleSubmitVote(
      //     vote,
      //     (proposal as TokenVotingProposal).token?.address
      //   )
      // }
      {...mappedProps}
    />
  );

  return (
    <Container>
      <Header>
        <Title>Voting</Title>
        <Summary>
          Proposal must pass with a community vote and then committee approval.
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
          alertLabel={votingStatusLabel} // todo(kon): implement committee vote status
        >
          <CommitteeVotingTerminal />
        </AccordionItem>
      </Accordion>
    </Container>
  );
};

// todo(kon): move this somewhere
export function getCommitteVoteButtonLabel(
  proposal: GaslessVotingProposal,
  canVoteOrApprove: boolean,
  votedOrApproved: boolean,
  t: TFunction
) {
  const label = 'todo';

  // todo(kon): implement this
  // if(proposal. === '')

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
