import {TerminalTabs, VotingTerminal, VotingTerminalProps} from './index';
import React, {ReactNode, useEffect, useMemo, useState} from 'react';
import {TFunction, useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {getFormattedUtcOffset, KNOWN_FORMATS} from '../../utils/date';
import {VoterType} from '@aragon/ods';
import styled from 'styled-components';
import {AccordionItem} from '../../components/accordionMethod';
import {Accordion} from '@radix-ui/react-accordion';
import {GaslessVotingProposal} from '@vocdoni/offchain-voting';
import {GaselessPluginName, usePluginClient} from '../../hooks/usePluginClient';
import {useOffchainCommitteVotes} from '../../context/useOffchainVoting';
import {ProposalId} from '../../utils/types';

export const OffchainVotingTerminal = ({
  votingStatusLabel,
  votingTerminal,
  proposal,
  proposalId,
}: {
  votingStatusLabel: string;
  votingTerminal: ReactNode;
  proposal: GaslessVotingProposal;
  proposalId: ProposalId | undefined;
}) => {
  const {t} = useTranslation();
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('breakdown');
  const pluginClient = usePluginClient(GaselessPluginName);

  const {address} = proposalId!.stripPlgnAdrFromProposalId();

  const {voted, canVote, isApproved} = useOffchainCommitteVotes(
    address,
    proposal
  );

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

  const mappedProps = useMemo(() => {
    if (!proposal) return;

    // const mappedMembers = new Map(
    //   // map multisig members to voterType
    //   proposal.approvers?.map(member => [
    //     member,
    //     {wallet: member, option: 'none'} as VoterType,
    //   ])
    // );
    const endDate = `${format(
      proposal.parameters.endDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`;

    const startDate = `${format(
      proposal.parameters.startDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`;

    return {
      approvals: proposal.approvers,
      // The voters list is not on the proposal object
      voters: new Array<VoterType>(proposal.settings.minTallyApprovals),
      minApproval: proposal.settings.minTallyApprovals,
      // voters: [...mappedMembers.values()],
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

  const buttonLabel = useMemo(() => {
    if (proposal) {
      return getCommitteVoteButtonLabel(
        proposal,
        canVote,
        voted,
        isApproved,
        t
      );
    }
  }, [proposal, voted, canVote, t]);

  const CommitteeVotingTerminal = () => {
    return (
      <VotingTerminal
        status={proposal.status}
        statusLabel={votingStatusLabel} // todo(kon): implement committee vote status
        selectedTab={terminalTab}
        // alertMessage={alertMessage} // todo(kon): implement
        onTabSelected={setTerminalTab}
        onVoteClicked={() => {
          console.log('onVoteClicked');
        }} // todo(kon): implement
        // onCancelClicked={() => setVotingInProcess(false)}
        voteButtonLabel={buttonLabel} // todo(kon): implement getVoteButtonLabel
        voteNowDisabled={!canVote} // todo(kon): implement
        // votingInProcess={votingInProcess} // Only for token voting
        onVoteSubmitClicked={() => {
          console.log('onVoteSubmitClicked');
          // todo(kon): implement
          // handleSubmitVote(
          //   vote,
          //   (proposal as TokenVotingProposal).token?.address
          // )
        }}
        {...mappedProps}
      />
    );
  };

  return (
    <Container>
      <Header>
        <Title>Voting</Title>
        <Summary>
          Proposal must pass with a community vote and then committee approval.
        </Summary>
      </Header>
      <Accordion type={'multiple'}>
        {/*<AccordionItem*/}
        {/*  name={'community-voting'}*/}
        {/*  type={'action-builder'}*/}
        {/*  methodName={'Community Voting'}*/}
        {/*  alertLabel={votingStatusLabel}*/}
        {/*>*/}
        {/*  {votingTerminal}*/}
        {/*</AccordionItem>*/}
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
function getCommitteVoteButtonLabel(
  proposal: GaslessVotingProposal,
  canVoteOrApprove: boolean,
  votedOrApproved: boolean,
  approved: boolean,
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
