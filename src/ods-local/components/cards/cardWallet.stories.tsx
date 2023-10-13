import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {CardWallet, type CardWalletProps} from './cardWallet';

export default {
  title: 'Components/Cards/Wallet',
  component: CardWallet,
} as Meta;

const Template: Story<CardWalletProps> = args => <CardWallet {...args} />;

export const Default = Template.bind({});
Default.args = {
  src: 'https://place-hold.it/150x150',
  name: 'ens-name.eth',
  address: '0x6720000000000000000000000000000000007739',
};
