import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {AvatarToken, type AvatarTokenProps} from './avatarToken';

export default {
  title: 'Components/Avatar/Token',
  component: AvatarToken,
} as Meta;

const Template: Story<AvatarTokenProps> = args => <AvatarToken {...args} />;

export const WithIcon = Template.bind({});
WithIcon.args = {
  src: 'https://eu.ui-avatars.com/api/?name=Dao+Name+three&background=0037D2&color=fff',
  size: 'small',
};

export const WithFallback = Template.bind({});
WithFallback.args = {};
