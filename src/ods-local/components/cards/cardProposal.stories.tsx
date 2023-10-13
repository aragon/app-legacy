import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {CardProposal, type CardProposalProps} from './cardProposal';

export default {
  title: 'Components/Cards/Proposal',
  component: CardProposal,
} as Meta;

const Template: Story<CardProposalProps> = args => <CardProposal {...args} />;

export const Default = Template.bind({});
Default.args = {
  process: 'pending',
  title: 'Title',
  description: 'Description',
  voteTitle: 'Winning Option',
  voteProgress: 70,
  voteLabel: 'Yes',
  tokenAmount: '3.5M',
  tokenSymbol: 'DNT',
  publishLabel: 'Published by',
  publisherAddress: '0x374d444487A4602750CA00EFdaC5d22B21F130E1',
  alertMessage: 'Starts in x days y hours',
  stateLabel: [
    'Draft',
    'Pending',
    'Active',
    'Executed',
    'Succeeded',
    'Defeated',
  ],
  bannerContent: 'Verified Aragon App Update',
};

export const Explore = Template.bind({});
Explore.args = {
  type: 'explore',
  process: 'active',
  title: 'Title',
  description:
    'I think the current DAO name doesn’t match our mission and purpose, therefore we should do this, that, and whatever else.',
  voteTitle: 'Winning Option',
  voteProgress: 70,
  voteLabel: 'Yes',
  tokenAmount: '3.5M',
  tokenSymbol: 'DNT',
  publishLabel: 'Published by',
  daoName: 'Bob DAO',
  publisherAddress: '0x374d444487A4602750CA00EFdaC5d22B21F130E1',
  alertMessage: 'Starts in x days y hours',
  stateLabel: [
    'Draft',
    'Pending',
    'Active',
    'Executed',
    'Succeeded',
    'Defeated',
  ],
  bannerContent: 'Verified Aragon App Update',
};
