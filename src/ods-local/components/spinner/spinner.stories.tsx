import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {Spinner, type SpinnerProps} from './spinner';

export default {
  title: 'Components/Spinner',
  component: Spinner,
} as Meta;

const Template: Story<SpinnerProps> = args => <Spinner {...args} />;

export const Default = Template.bind({});
