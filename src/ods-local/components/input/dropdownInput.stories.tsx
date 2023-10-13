import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {DropdownInput, type DropDownInputProps} from './dropdownInput';

export default {
  title: 'Components/Input/Dropdown',
  component: DropdownInput,
} as Meta;

const Template: Story<DropDownInputProps> = args => <DropdownInput {...args} />;

export const Dropdown = Template.bind({});
Dropdown.args = {
  mode: 'default',
  disabled: false,
};
