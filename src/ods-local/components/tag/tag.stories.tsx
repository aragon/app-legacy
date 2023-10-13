import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';

import {Tag} from './tag';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
} satisfies Meta<typeof Tag>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    label: 'Default label',
  },
};

export const ColorSchemes: StoryObj<typeof Tag> = {
  render: () => (
    <div className="flex gap-1">
      <Tag colorScheme="critical" label="Critical" />
      <Tag colorScheme="info" label="Info" />
      <Tag colorScheme="neutral" label="Neutral" />
      <Tag colorScheme="primary" label="Primary" />
      <Tag colorScheme="success" label="Success" />
      <Tag colorScheme="warning" label="Warning" />
    </div>
  ),
};
