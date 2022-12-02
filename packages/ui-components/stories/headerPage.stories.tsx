import React from 'react';
import {Meta, Story} from '@storybook/react';
import {HeaderPage, HeaderPageProps, IconFinance} from '../src';

export default {
  title: 'Components/Headers/Page',
  component: HeaderPage,
} as Meta;

const Template: Story<HeaderPageProps> = args => <HeaderPage {...args} />;

export const Page = Template.bind({});
Page.args = {
  title: 'Title',
  description: 'description',
  buttonLabel: 'buttonLabel',
  crumbs: [
    {label: 'Finance', path: '/abc'},
    {label: 'Tokens', path: '/abc'},
    {label: 'Third Level', path: '/abc'},
  ],
  onCrumbClick: path => alert(path),
  icon: <IconFinance />,
};
