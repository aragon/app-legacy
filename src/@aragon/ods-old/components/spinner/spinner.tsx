import React, {type HTMLAttributes} from 'react';
import {styled} from 'styled-components';

export type SpinnerProps = HTMLAttributes<HTMLElement> & {
  /**
   * The preferred Size of the spinner
   */
  size: 'xs' | 'small' | 'default' | 'big';
  /**
   * Styles
   */
  color?: string;
};

/**
 * Spinner UI component
 */
export const Spinner: React.FC<SpinnerProps> = ({size = 'small', color}) => {
  return <StyledSpinner data-testid="spinner" {...{size, color}} />;
};

type SizesType = Record<SpinnerProps['size'], string>;

const StyledSpinner = styled.div.attrs<SpinnerProps>(({size}) => {
  // I couldn't find information on the sizes in the design system. I think a
  // size of 2 (=16px) is badly needed, as this is the size of text-base. I
  // added it as a new size so as to avoid refactoring existing components
  // TODO clean up sizes.
  const sizes: SizesType = {
    xs: 'w-4 h-4',
    small: 'w-6 h-6',
    default: 'w-10 h-10',
    big: 'w-12 h-12',
  };
  const className = `rounded-full
        ease-linear border-2
        border-t-2 border-neutral-0
        ${sizes[size]}
    `;

  return {className};
})<SpinnerProps>`
  border-top-color: ${({color}) => color ?? '#003bf5'};
  -webkit-animation: spinner 1s linear infinite;
  animation: spinner 1s linear infinite;
  @-webkit-keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
