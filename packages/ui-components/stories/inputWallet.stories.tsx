import React from 'react';
import {Meta, Story} from '@storybook/react';
import {WalletInput, WalletInputProps} from '../src';

export default {
  title: 'Components/Input/Wallet',
  component: WalletInput,
} as Meta;

const Template: Story<WalletInputProps> = args => <WalletInput {...args} />;

export const Wallet = Template.bind({});
Wallet.args = {
  adornmentText: 'Paste',
  onAdornmentClick: () => alert('Button clicked'),
  mode: 'default',
  disabled: false,
  placeholder: '0x ...',
};
