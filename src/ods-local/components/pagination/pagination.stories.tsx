import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {Pagination, type PaginationProps} from './pagination';

export default {
  title: 'Components/Pagination',
  component: Pagination,
} as Meta;

const Template: Story<PaginationProps> = args => <Pagination {...args} />;

export const Default = Template.bind({});
Default.args = {
  bgWhite: false,
};
