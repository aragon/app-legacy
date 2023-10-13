import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {IconAdd} from '../icons';
import {ButtonIcon, type ButtonIconProps} from './buttonIcon';

export default {
  title: 'Components/Buttons/Icon',
  component: ButtonIcon,
} as Meta;

const Template: Story<ButtonIconProps> = args => <ButtonIcon {...args} />;

export const Default = Template.bind({});
Default.args = {
  icon: <IconAdd />,
  children: 'abc',
  onClick: () => alert('clicked'),
};
