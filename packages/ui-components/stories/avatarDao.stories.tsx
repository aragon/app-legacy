// TODO: combine all avatar stories
import React from 'react';
import {Meta, Story} from '@storybook/react';

import {AvatarDao, AvatarDaoProps} from '../src/components/avatar';

export default {
  title: 'Components/Avatar/Dao',
  component: AvatarDao,
} as Meta;

const Template: Story<AvatarDaoProps> = args => <AvatarDao {...args} />;

export const WithIcon = Template.bind({});
WithIcon.args = {
  src: 'https://cdn.discordapp.com/icons/672466989217873929/a_51c83f18bd98ca37916f540b3ecf40f7.webp?size=1024',
  daoName: 'DAO Name',
};

export const NoIcon = Template.bind({});
NoIcon.args = {
  daoName: 'DAO Abc',
};
