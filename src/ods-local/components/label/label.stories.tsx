import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {Label, type LabelProps} from './label';

export default {
  title: 'Components/Label',
  component: Label,
} as Meta;

const Template: Story<LabelProps> = args => <Label {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Label',
  helpText: 'HelpText',
  isOptional: false,
};
