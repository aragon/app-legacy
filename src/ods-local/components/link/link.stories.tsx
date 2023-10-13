import {type Meta, type StoryObj} from '@storybook/react';
import React from 'react';

import {IconLinkExternal} from '../icons';
import {LINK_VARIANTS, Link} from './link';

const meta: Meta<typeof Link> = {
  component: Link,
  title: 'Components/Link',
  tags: ['autodocs'],
  argTypes: {
    label: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    type: {
      options: LINK_VARIANTS,
      control: {type: 'select'},
      defaultValue: 'primary',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Link>;

export const Primary: Story = {
  render: args => <Link {...args} />,
  args: {
    label: 'Aragon',
    description: 'Association Website',
    href: 'https://aragon.org/',
    type: 'primary',
    iconRight: <IconLinkExternal />,
  },
};

export const Neutral: Story = {
  render: args => <Link {...args} />,
  args: {
    label: 'Aragon',
    description: 'Association Website',
    href: 'https://aragon.org/',
    type: 'neutral',
    iconRight: <IconLinkExternal />,
  },
};
