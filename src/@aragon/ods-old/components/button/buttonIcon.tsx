import React from 'react';
import {styled} from 'styled-components';

import type {IconType} from '../icons';
import type {ButtonBaseProps} from './buttonBase';
import {ButtonBase} from './buttonBase';

export type ButtonIconProps = Omit<
  ButtonBaseProps,
  'label' | 'iconRight' | 'iconLeft' | 'iconOnly'
> & {
  bgWhite?: boolean;
  icon: React.FunctionComponentElement<IconType>;
  isActive?: boolean;
};

export const ButtonIcon = React.forwardRef<HTMLButtonElement, ButtonIconProps>(
  (
    {
      bgWhite = false,
      icon,
      isActive = false,
      mode = 'primary',
      size = 'medium',
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        {...props}
        iconLeft={icon}
        bgWhite={bgWhite}
        isActive={isActive}
        mode={mode}
        size={size}
        iconOnly={true}
      />
    );
  }
);

ButtonIcon.displayName = 'ButtonIcon';

const paddingStyles = {
  small: 'w-8 p-2',
  medium: 'w-10 p-3',
  large: 'w-12 p-4',
};

type StyledButtonProps = {
  bgWhite: boolean;
  isActive: boolean;
  mode: ButtonBaseProps['mode'];
  size: ButtonBaseProps['size'];
};

const StyledButton = styled(ButtonBase).attrs<StyledButtonProps>(
  ({bgWhite, isActive, mode, size = 'medium'}) => {
    let className: string | undefined;

    switch (mode) {
      case 'secondary':
        className = `${
          bgWhite
            ? 'bg-neutral-50 disabled:bg-neutral-50'
            : 'bg-neutral-0 disabled:bg-neutral-100'
        } ${
          isActive ? 'text-neutral-800 bg-neutral-200' : 'text-neutral-600'
        } ${
          paddingStyles[size]
        } hover:text-neutral-800 hover:bg-neutral-100 active:text-neutral-800 active:bg-neutral-200 disabled:text-neutral-300`;
        break;

      case 'ghost':
        className = `${
          bgWhite
            ? `${
                isActive ? 'bg-primary-50' : 'bg-neutral-0'
              } active:bg-primary-50`
            : `${
                isActive ? 'bg-neutral-0' : 'bg-[transparent]'
              } active:bg-neutral-0`
        } ${isActive ? 'text-primary-500' : 'text-neutral-500'} ${
          paddingStyles[size]
        } focus:text-primary-400 hover:text-primary-500 active:text-primary-500 disabled:text-neutral-300 disabled:bg-[transparent]`;
        break;

      default:
        className = `${isActive ? 'bg-primary-700' : 'bg-primary-400'} ${
          paddingStyles[size]
        } text-neutral-0 hover:bg-primary-500 active:bg-primary-700 disabled:text-primary-300 disabled:bg-primary-100`;
        break;
    }

    return {className};
  }
)<StyledButtonProps>``;
