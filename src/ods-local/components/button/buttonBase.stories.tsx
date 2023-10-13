// TODO: remove story when publishing storybook
import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {IconAdd} from '../icons';
import {ButtonBase, type ButtonBaseProps} from './buttonBase';

export default {
  title: 'Components/Buttons/Base',
  component: ButtonBase,
} as Meta;

const Template: Story<ButtonBaseProps> = args => <ButtonBase {...args} />;

export const ButtonText = Template.bind({});
ButtonText.args = {
  label: 'Button Text',
  disabled: false,
};

export const ButtonIcon = Template.bind({});
ButtonIcon.args = {
  label: 'Button Text',
  disabled: true,
  iconRight: <IconAdd />,
};
