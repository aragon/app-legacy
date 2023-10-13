import {type Meta, type Story} from '@storybook/react';
import React from 'react';
import {TextareaWYSIWYG, type TextareaWYSIWYGProps} from './wysiwyg';

export default {
  title: 'Components/TextArea/WYSIWYG',
  component: TextareaWYSIWYG,
} as Meta;

const Template: Story<TextareaWYSIWYGProps> = args => (
  <div style={{width: '60%'}}>
    <TextareaWYSIWYG {...args} />
  </div>
);

export const WYSIWYG = Template.bind({});
WYSIWYG.args = {
  placeholder: 'Write something...',
  disabled: false,
};
