import {type Meta, type Story} from '@storybook/react';
import React, {useState} from 'react';
import {CheckboxListItem, type CheckboxListItemProps} from './checkboxListItem';

export default {
  title: 'Components/Checkbox/ListItem',
  component: CheckboxListItem,
} as Meta;

const Template: Story<CheckboxListItemProps> = args => (
  <CheckboxListItem {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: 'Label',
  helptext: 'Helptext',
  multiSelect: true,
  disabled: false,
  type: 'default',
  onClick: () => alert('click'),
};

export const ListGroup = () => {
  const [selectedIndex, setIndex] = useState<number>(1);

  const handleOnClick = (index: number) => {
    if (index !== selectedIndex) {
      setIndex(index);
    }
  };

  return (
    <div className="space-y-1">
      <CheckboxListItem
        label="Label One"
        helptext="HelpText One"
        multiSelect={false}
        onClick={() => handleOnClick(1)}
        type={selectedIndex === 1 ? 'active' : 'default'}
      />
      <CheckboxListItem
        label="Label Two"
        helptext="HelpText Two"
        multiSelect={false}
        onClick={() => handleOnClick(2)}
        type={selectedIndex === 2 ? 'active' : 'default'}
      />
    </div>
  );
};
