import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {DateInput, type DateInputProps} from './dateInput';

export default {
  title: 'Components/Input/Date',
  component: DateInput,
} as Meta;

const Template: Story<DateInputProps> = args => <DateInput {...args} />;

export const Date = Template.bind({});
Date.args = {
  disabled: false,
  value: '2022-04-20',
};
