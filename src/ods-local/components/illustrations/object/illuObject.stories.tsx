import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {IlluObject, type IlluObjectProps} from './illuObject';

export default {
  title: 'Components/Illustration/Object',
  component: IlluObject,
} as Meta;

const Template: Story<IlluObjectProps> = args => <IlluObject {...args} />;

export const Default = Template.bind({});
Default.args = {
  object: 'magnifying_glass',
};
