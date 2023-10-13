import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {IconAdd} from '../icons';
import {ButtonText, type ButtonTextProps} from './buttonText';

export default {
  title: 'Components/Buttons/Text',
  component: ButtonText,
} as Meta;

const Template: Story<ButtonTextProps> = args => <ButtonText {...args} />;

export const Label = Template.bind({});
Label.args = {
  label: 'Button with label',
  onClick: () => alert('clicked'),
  disabled: false,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  label: 'Button Text',
  disabled: true,
  iconLeft: <IconAdd />,
  iconRight: <IconAdd />,
};
