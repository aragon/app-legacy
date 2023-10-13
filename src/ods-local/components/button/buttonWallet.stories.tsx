import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {ButtonWallet, type ButtonWalletProps} from './buttonWallet';

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

export const NotConnected = Template.bind({});
NotConnected.args = {
  label: 'Login',
  isConnected: false,
  src: '0x6720000000000000000000000000000000007739',
};
