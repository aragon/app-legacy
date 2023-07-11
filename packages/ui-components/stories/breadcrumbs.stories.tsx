import React from 'react';
import {Meta, Story} from '@storybook/react';
import {Tag} from '@aragon/ods';
import {Breadcrumb, BreadcrumbProps, IconFinance} from '../src';

export default {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
} as Meta;

const Template: Story<BreadcrumbProps> = args => <Breadcrumb {...args} />;

export const Default = Template.bind({});
export const NoTag = Template.bind({});
export const Process = Template.bind({});

Default.args = {
  crumbs: [
    {label: 'Finance', to: '/abc'},
    {label: 'Tokens', to: '/abc'},
    {label: 'Third Level', to: '/abc'},
  ],
  tag: <Tag>Tagging</Tag>,
  icon: <IconFinance />,
};

NoTag.args = {
  crumbs: [
    {label: 'Finance', to: '/abc'},
    {label: 'Tokens', to: '/abc'},
  ],
  icon: <IconFinance />,
};

Process.args = {
  crumbs: {label: 'New Proposal', to: '/abc'},
  tag: <Tag>Draft</Tag>,
};
