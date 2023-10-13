import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {TextInput, type TextInputProps} from './textInput';

export default {
  title: 'Components/Input/Text',
  component: TextInput,
} as Meta;

const Template: Story<TextInputProps> = args => <TextInput {...args} />;

export const Text = Template.bind({});
Text.args = {
  mode: 'default',
  placeholder: 'Placeholder',
};
