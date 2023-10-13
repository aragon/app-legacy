import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {CardText, type CardTextProps} from './cardText';

export default {
  title: 'Components/Cards/Text',
  component: CardText,
} as Meta;

const Template: Story<CardTextProps> = args => <CardText {...args} />;

export const Text = Template.bind({});
Text.args = {
  type: 'label',
  title: 'Title',
  content: 'Copy',
  bgWhite: true,
};
