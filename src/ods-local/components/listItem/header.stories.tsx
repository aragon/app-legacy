import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {IconFinance} from '../icons';
import {ListItemHeader, type ListItemHeaderProps} from './header';

export default {
  title: 'Components/ListItem/Header',
  component: ListItemHeader,
} as Meta;

const Template: Story<ListItemHeaderProps> = args => (
  <ListItemHeader {...args} />
);

export const Default = Template.bind({});
Default.args = {
  buttonText: 'New Transfer',
  icon: <IconFinance />,
  label: 'Treasury Volume',
  value: '$1,000,000.00',
};
