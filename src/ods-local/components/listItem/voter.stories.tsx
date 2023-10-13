import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {ListItemVoter, type ListItemVoterProps} from './voter';

export default {
  title: 'Components/ListItem/Voter',
  component: ListItemVoter,
} as Meta;

const Template: Story<ListItemVoterProps> = args => <ListItemVoter {...args} />;

export const Default = Template.bind({});
Default.args = {
  src: '0x8367dc645e31321CeF3EeD91a10a5b7077e21f70',
  label: '0x8367dc645e31321CeF3EeD91a10a5b7077e21f70',
  option: 'yes',
  tokenInfo: {
    amount: 0.1,
    symbol: 'ETH',
    percentage: 0.1,
  },
  walletTag: {
    label: 'Your delegate',
    colorScheme: 'info',
  },
  voteReplaced: true,
  voteReplacedLabel: 'Vote was changed',
};
