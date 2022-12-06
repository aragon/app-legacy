import React from 'react';
import {Meta, Story} from '@storybook/react';
import {Avatar, AvatarProps} from '../src';

export default {
  title: 'Components/Avatar',
  component: Avatar,
} as Meta;

const Template: Story<AvatarProps> = args => <Avatar {...args} />;

export const Square = Template.bind({});
Square.args = {
  src: 'https://cdn.discordapp.com/icons/672466989217873929/a_51c83f18bd98ca37916f540b3ecf40f7.webp?size=1024',
  mode: 'square',
};

export const Circle = Template.bind({});
Circle.args = {
  src: 'https://cdn.discordapp.com/icons/672466989217873929/a_51c83f18bd98ca37916f540b3ecf40f7.webp?size=1024',
  mode: 'circle',
};

export const Initials = Template.bind({});
Initials.args = {
  src: 'https://eu.ui-avatars.com/api/?name=Dao+Name+three&background=0037D2&color=fff',
  mode: 'circle',
};

export const Identicon = Template.bind({});
Identicon.args = {
  src: '0x6720000000000000000000000000000000007739',
  mode: 'circle',
};
