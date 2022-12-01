import React from 'react';
import {Meta, Story} from '@storybook/react';

import {ButtonWallet, ButtonWalletProps} from '../src';

export default {
  title: 'Components/Buttons/Wallet',
  component: ButtonWallet,
} as Meta;

const Template: Story<ButtonWalletProps> = args => <ButtonWallet {...args} />;

export const Default = Template.bind({});
Default.args = {
  disabled: true,
  label: '0x6720000000000000000000000000000000007739',
  isConnected: true,
  src: '0x6720000000000000000000000000000000007739',
};

export const Active = Template.bind({});
Active.args = {
  isSelected: true,
  isConnected: true,
  label: '0x6720000000000000000000000000000000007739',
  src: '0x6720000000000000000000000000000000007739',
};

export const notConnected = Template.bind({});
notConnected.args = {
  label: 'Login',
  isConnected: false,
  src: '0x6720000000000000000000000000000000007739',
};
