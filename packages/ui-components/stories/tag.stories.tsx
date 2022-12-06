import React from 'react';
import {Meta, Story} from '@storybook/react';
import {Tag, TagProps} from '../src';

export default {
  title: 'Components/Tag',
  component: Tag,
} as Meta;

const Template: Story<TagProps> = args => <Tag {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: '0.07%',
  colorScheme: 'neutral',
};
