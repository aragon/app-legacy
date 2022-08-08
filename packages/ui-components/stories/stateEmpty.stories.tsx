import React from 'react';
import {Meta, Story} from '@storybook/react';
import {StateEmpty, StateEmptyProps} from '../src';

export default {
  title: 'Components/StateEmpty',
  component: StateEmpty,
} as Meta;

const Template: Story<StateEmptyProps> = args => <StateEmpty {...args} />;

export const Default = Template.bind({});
Default.args = {
  type: 'Human',
  mode: 'card',
  object: 'archive',
  body: 'voting',
  expression: 'casual',
  hair: 'middle',
  sunglass: 'big_rounded',
  accessory: 'earrings_rhombus',
  title: 'title',
  description: 'description',
  primaryButton: {
    label: 'Primary text',
    onClick: () => {
      alert('You clicked the primary button');
    },
  },
  secondaryButton: {
    label: 'Secondary text',
    onClick: () => {
      alert('You clicked the secondary button');
    },
  },
  width: 800,
  height: 450,
};
