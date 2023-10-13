import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {IllustrationHuman, type IlluHumanProps} from './illuHuman';

export default {
  title: 'Components/Illustration/Human',
  component: IllustrationHuman,
} as Meta;

const Template: Story<IlluHumanProps> = args => (
  <div className="absolute">
    <IllustrationHuman {...args} />
  </div>
);
export const Default = Template.bind({});
Default.args = {
  body: 'chart',
  expression: 'casual',
  width: 800,
  height: 450,
};
