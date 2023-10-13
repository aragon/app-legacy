import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {ButtonText} from '../button';
import {IconChevronDown} from '../icons';
import {Tag} from '../tag';
import {TableCell, type TableCellProps} from './tableCell';

export default {
  title: 'Components/Table/Cell',
  component: TableCell,
} as Meta;

const Template: Story<TableCellProps> = args => <TableCell {...args} />;
export const Default = Template.bind({});
Default.args = {
  type: 'text',
  text: 'CellText',
  subtext: 'Subtext',
  rightAligned: false,
  bgWhite: false,
};

const TagTemplate: Story<TableCellProps> = args => (
  <TableCell {...args}>
    <Tag label="Tag" colorScheme="critical" />
  </TableCell>
);
export const Tagged = TagTemplate.bind({});

const LinkTemplate: Story<TableCellProps> = args => (
  <TableCell {...args}>
    <ButtonText
      mode="ghost"
      label={args.text as string}
      bgWhite={args.bgWhite}
      isActive
      iconRight={<IconChevronDown />}
    />
  </TableCell>
);
export const Link = LinkTemplate.bind({});
Link.args = {
  type: 'link',
  text: 'Load More',
  rightAligned: false,
  bgWhite: false,
};
