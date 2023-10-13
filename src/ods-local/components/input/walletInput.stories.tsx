import {type Meta, type Story} from '@storybook/react';
import React, {useState} from 'react';
import {
  WalletInput,
  type WalletInputProps,
  type WalletInputValue,
} from './walletInput';

export default {
  title: 'Components/Input/Wallet',
  component: WalletInput,
} as Meta;

const Template: Story<WalletInputProps> = args => {
  const [value, setValue] = useState<WalletInputValue>({
    address: '',
    ensName: '',
  });

  return <WalletInput {...args} value={value} onValueChange={setValue} />;
};

export const Default = Template.bind({});
Default.args = {
  placeholder: 'ENS or 0x…',
  blockExplorerURL: 'https://etherscan.io/name-lookup-search?id=',
  resolveEnsNameFromAddress: async () => {
    new Promise(resolve => setTimeout(resolve, 2000));
    return 'sio.eth';
  },
  resolveAddressFromEnsName: async () => {
    new Promise(resolve => setTimeout(resolve, 2000));
    return '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5';
  },
};

export const AddressOnly = Template.bind({});
AddressOnly.args = {
  placeholder: '0x…',
  blockExplorerURL: 'https://etherscan.io/name-lookup-search?id=',
};

Default.args = {
  placeholder: 'ENS or 0x…',
  blockExplorerURL: 'https://etherscan.io/name-lookup-search?id=',
  resolveEnsNameFromAddress: async () => {
    new Promise(resolve => setTimeout(resolve, 2000));
    return 'sio.eth';
  },
  resolveAddressFromEnsName: async () => {
    new Promise(resolve => setTimeout(resolve, 2000));
    return '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5';
  },
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  placeholder: 'ENS or 0x…',
  blockExplorerURL: 'https://etherscan.io/name-lookup-search?id=',
  resolveEnsNameFromAddress: async () => {
    new Promise(resolve => setTimeout(resolve, 2000));
    return 'sio.eth';
  },
  resolveAddressFromEnsName: async () => {
    new Promise(resolve => setTimeout(resolve, 2000));
    return '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5';
  },
};
