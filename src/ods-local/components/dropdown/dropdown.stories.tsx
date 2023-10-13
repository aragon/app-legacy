import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {ButtonIcon, ButtonText} from '../button/';
import {IconChevronRight, IconMenuVertical} from '../icons';
import {ListItemAction} from '../listItem';
import {Dropdown, type DropdownProps, type ListItemProps} from './dropdown';

export default {
  title: 'Components/Dropdown',
  component: Dropdown,
} as Meta;

const Template: Story<DropdownProps> = args => (
  <div className="flex h-96 items-center justify-center">
    <div>
      <Dropdown {...args} />
    </div>
  </div>
);

const items: ListItemProps[] = [
  {
    component: (
      <ListItemAction iconRight={<IconChevronRight />} title="first item" />
    ),
    callback: () => {
      alert('first item selected');
    },
  },
  {
    component: (
      <ListItemAction iconRight={<IconChevronRight />} title="second item" />
    ),
    callback: () => {
      alert('second item selected');
    },
  },
];

export const Default = Template.bind({});
Default.args = {
  side: 'bottom',
  trigger: <ButtonText label="Trigger" mode="primary" />,
  listItems: items,
};

export const MenuButtonWithIcon = Template.bind({});
MenuButtonWithIcon.args = {
  side: 'bottom',
  trigger: <ButtonIcon mode="secondary" icon={<IconMenuVertical />} />,
  listItems: items,
};
