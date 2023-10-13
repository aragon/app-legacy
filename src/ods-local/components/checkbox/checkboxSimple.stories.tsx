import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {CheckboxSimple, type CheckboxSimpleProps} from './checkboxSimple';

export default {
  title: 'Components/Checkbox/Simple',
  component: CheckboxSimple,
} as Meta;

const Template: Story<CheckboxSimpleProps> = args => (
  <CheckboxSimple {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: 'Label',
  iconLeft: true,
  multiSelect: true,
  disabled: false,
  state: 'default',
  onClick: () => alert('checkbox clicked'),
};
