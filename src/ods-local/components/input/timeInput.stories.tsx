import {type Meta, type Story} from '@storybook/react';
import React, {useState} from 'react';
import {TimeInput, type TimeInputProps} from './timeInput';

export default {
  title: 'Components/Input/Time',
  component: TimeInput,
} as Meta;

const Template: Story<TimeInputProps> = args => {
  const [value, setValue] = useState('12:23');
  return (
    <TimeInput
      {...args}
      value={value}
      onChange={nextValue => setValue(nextValue)}
    />
  );
};

export const Time = Template.bind({});
Time.args = {
  mode: 'default',
};
