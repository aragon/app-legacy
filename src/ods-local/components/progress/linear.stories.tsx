import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {LinearProgress} from './linear';

export default {
  title: 'Components/Progress/Linear',
  component: LinearProgress,
} as Meta;

const Template: Story = args => <LinearProgress {...args} />;

export const Default = Template.bind({});
Default.args = {
  max: 3,
  value: 2,
};
