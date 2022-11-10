import React from 'react';
import {Meta, Story} from '@storybook/react';
import {AlertChipProps, AlertChip, IconCheckmark} from '../src';

export default {
  title: 'Components/Alerts/Chip',
  component: AlertChip,
} as Meta;

const Template: Story<AlertChipProps> = args => <AlertChip {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Pasted',
  icon: <IconCheckmark />,
  showIcon: true,
};
