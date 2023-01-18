import {TextareaHTMLAttributes} from 'react';
import styled from 'styled-components';

export type TextareaSimpleProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
>;

export const TextareaSimple = styled.textarea.attrs({
  className: `py-1.5 px-2 rounded-xl resize-none w-full border-2 border-ui-100 hover:border-ui-300 
    disabled:bg-ui-100 disabled:border-ui-200 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white text-ui-600 active:border-primary-500 active:ring-0`,
})`
  min-height: 144px;

  ::-webkit-input-placeholder {
    color: #9aa5b1;
  }
  ::-moz-placeholder {
    color: #9aa5b1;
  }
  :-ms-input-placeholder {
    color: #9aa5b1;
  }
  :-moz-placeholder {
    color: #9aa5b1;
  }
`;
