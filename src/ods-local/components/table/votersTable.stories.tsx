import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {VotersTable, type VotersTableProps} from './votersTable';

export default {
  title: 'Components/Table/Voters',
  component: VotersTable,
} as Meta;

const Template: Story<VotersTableProps> = args => <VotersTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  voters: [
    {
      wallet: 'DAO XYZ',
      option: 'yes',
      votingPower: '40%',
      tokenAmount: '1,000',
      tokenSymbol: 'TN',
      src: '0x8367dc645e31321CeF3EeD91a10a5b7077e21f70',
    },
    {
      wallet: 'punk5768.eth',
      option: 'no',
      votingPower: '10%',
      tokenAmount: '200',
      tokenSymbol: 'ETH',
      src: '0x8367dc645e31321CeF3EeD91a10a5b7077e21f70',
    },
    {
      wallet: '0x8367dc645e31321CeF3EeD91a10a5b7077e21f70',
      option: 'yes',
      votingPower: '13.333%',
      tokenAmount: '250',
      tokenSymbol: 'TN',
      src: '0x8367dc645e31321CeF3EeD91a10a5b7077e21f70',
    },
  ],
  LoadMoreLabel: 'Load more',
  onLoadMore: () => alert('load more clicked'),
  showOption: true,
  showAmount: true,
  explorerURL: 'https://etherscan.io/',
};
