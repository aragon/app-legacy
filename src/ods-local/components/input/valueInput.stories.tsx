import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {ValueInput, type ValueInputProps} from './valueInput';

export default {
  title: 'Components/Input/Value',
  component: ValueInput,
} as Meta;

const Template: Story<ValueInputProps> = args => <ValueInput {...args} />;

export const Value = Template.bind({});
Value.args = {
  adornmentText: 'Max',
  onAdornmentClick: () => alert('Button clicked'),
  mode: 'default',
  disabled: false,
  placeholder: 'Placeholder',
};
