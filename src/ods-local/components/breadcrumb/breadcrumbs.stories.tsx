import {type Meta, type StoryFn} from '@storybook/react';
import React from 'react';
import {IconFinance} from '../icons';
import {Tag} from '../tag';
import {Breadcrumb, type BreadcrumbProps} from './breadcrumb';

export default {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
} as Meta;

const Template: StoryFn<BreadcrumbProps> = (args: BreadcrumbProps) => (
  <Breadcrumb {...args} />
);

export const Default = Template.bind({});
export const NoTag = Template.bind({});
export const Process = Template.bind({});

Default.args = {
  crumbs: [
    {label: 'Finance', path: '/abc'},
    {label: 'Tokens', path: '/abc'},
    {label: 'Third Level', path: '/abc'},
  ],
  tag: <Tag label="Tagging" />,
  icon: <IconFinance />,
};

NoTag.args = {
  crumbs: [
    {label: 'Finance', path: '/abc'},
    {label: 'Tokens', path: '/abc'},
  ],
  icon: <IconFinance />,
};

Process.args = {
  crumbs: [{label: 'New Proposal', path: '/abc'}],
  tag: <Tag label="Draft" />,
};
