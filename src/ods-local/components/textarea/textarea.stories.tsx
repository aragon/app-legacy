import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {TextareaSimple, type TextareaSimpleProps} from './textarea';

export default {
  title: 'Components/TextArea/Simple',
  component: TextareaSimple,
} as Meta;

const Template: Story<TextareaSimpleProps> = args => (
  <TextareaSimple {...args} />
);

export const Simple = Template.bind({});
Simple.args = {
  placeholder: 'Placeholder',
  disabled: false,
};
