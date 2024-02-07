import React from 'react';
import {styled} from 'styled-components';

import type {ButtonBaseProps} from './buttonBase';
import {ButtonBase} from './buttonBase';

// Omit label to make it required
export type ButtonTextProps = Omit<ButtonBaseProps, 'label' | 'iconOnly'> & {
  bgWhite?: boolean;
  label: string;
  isActive?: boolean;
  className?: string;
};

export const ButtonText = React.forwardRef<HTMLButtonElement, ButtonTextProps>(
  (
    {
      bgWhite = false,
      label,
      isActive = false,
      mode = 'primary',
      size = 'medium',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        {...props}
        bgWhite={bgWhite}
        label={label}
        isActive={isActive}
        mode={mode}
        size={size}
        inputClassName={className}
      />
    );
  }
);

ButtonText.displayName = 'ButtonText';

const paddingStyles = {
  small: 'py-1 px-4',
  medium: 'py-3 px-4',
  large: 'py-3 px-4',
};

type StyledButtonProps = {
  bgWhite: boolean;
  isActive: boolean;
  mode: ButtonBaseProps['mode'];
  size: ButtonBaseProps['size'];
  inputClassName?: string;
};
const StyledButton = styled(ButtonBase).attrs<StyledButtonProps>(
  ({bgWhite, isActive, mode, size = 'medium', inputClassName}) => {
    let className: string | undefined;

    switch (mode) {
      case 'secondary':
        className = `${bgWhite ? 'bg-neutral-50' : 'bg-neutral-0'} ${
          isActive ? 'text-neutral-800 bg-neutral-200' : 'text-neutral-600'
        } ${
          paddingStyles[size]
        } hover:text-neutral-800 hover:bg-neutral-100 active:text-neutral-800 active:bg-neutral-200 disabled:text-neutral-300 disabled:bg-neutral-100`;
        break;

      case 'ghost':
        className = `${
          bgWhite
            ? `${
                isActive ? 'bg-primary-50' : 'bg-neutral-0'
              } active:bg-primary-50`
            : `${
                isActive ? 'bg-neutral-0' : 'bg-[transparent]'
              }  active:bg-neutral-0`
        } ${isActive ? 'text-primary-500' : 'text-neutral-600'} ${
          paddingStyles[size]
        } hover:text-primary-500 active:text-primary-500 disabled:text-neutral-300 disabled:bg-[transparent]`;
        break;

      default:
        className = `${isActive ? 'bg-primary-700' : 'bg-primary-400'} ${
          paddingStyles[size]
        } text-neutral-0 hover:bg-primary-500 active:bg-primary-700 disabled:text-primary-300 disabled:bg-primary-100`;
    }

    return {className: `${className} ${inputClassName}`};
  }
)<StyledButtonProps>``;
