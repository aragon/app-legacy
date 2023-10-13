import {type Meta, type Story} from '@storybook/react';
import React, {useState} from 'react';
import {SearchInput, type SearchInputProps} from './searchInput';

export default {
  title: 'Components/Input/Search',
  component: SearchInput,
} as Meta;

const Template: Story<SearchInputProps> = args => {
  const [value, setValue] = useState<string>('');
  return (
    <SearchInput
      {...args}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
};

export const Search = Template.bind({});
Search.args = {
  mode: 'default',
  placeholder: 'Placeholder',
  disabled: false,
};
