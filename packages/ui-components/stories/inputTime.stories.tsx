import React, {useState} from 'react';
import {Meta, Story} from '@storybook/react';
import {TimeInput, TimeInputProps} from '../src';

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
