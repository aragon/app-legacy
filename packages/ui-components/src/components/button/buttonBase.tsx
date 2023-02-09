import React, {ButtonHTMLAttributes, CSSProperties} from 'react';
import styled from 'styled-components';

import {IconType} from '../icons';

export type ButtonBaseProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  iconOnly?: boolean; // Guard against passing label to ButtonIcon
  iconLeft?: React.FunctionComponentElement<IconType>;
  iconRight?: React.FunctionComponentElement<IconType>;
  label?: string;
  mode?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
};

/**
 * Button to be used as base for other button components.
 * This button should not be exported with the library.
 * Height, font, focus, and border-radius are included.
 *
 * Note: Even if both iconRight and iconLeft are passed,
 * ONLY the iconLeft will be shown.
 */
export const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  (
    {iconRight, iconLeft, iconOnly = false, size = 'medium', label, ...props},
    ref
  ) => {
    return (
      <BaseStyledButton {...props} size={size} ref={ref}>
        {iconLeft && <IconContainer size={size}>{iconLeft}</IconContainer>}
        {!iconOnly && (
          <Label visible={label ? true : false}>{label && label}</Label>
        )}
        {!iconLeft && iconRight && (
          <IconContainer size={size}>{iconRight}</IconContainer>
        )}
      </BaseStyledButton>
    );
  }
);

ButtonBase.displayName = 'ButtonBase';

/**********************************
 *             STYLES             *
 **********************************/
const sizeClassNames = {
  small: 'h-4 space-x-1 rounded-lg',
  medium: 'h-5 space-x-1.5 rounded-larger',
  large: 'h-6 space-x-1.5 rounded-xl',
};

const sizeStyles = {
  small: {minWidth: '64px'},
  medium: {minWidth: '80px'},
  large: {minWidth: '112px'},
};

const fontStyles = {
  small: 'ft-text-sm',
  medium: 'ft-text-base',
  large: 'ft-text-base',
};

const iconStyles = {
  small: 'w-1.5 h-1.5',
  medium: 'w-2 h-2',
  large: 'w-2 h-2',
};

/**********************************
 *        Styled-Components       *
 **********************************/
type SizeProps = {
  size: ButtonBaseProps['size'];
};

const BaseStyledButton = styled.button.attrs(({size = 'medium'}: SizeProps) => {
  const className = `${sizeClassNames[size]} ${fontStyles[size]} 
  flex justify-center items-center focus:outline-none focus-visible:ring-2 
  focus-visible:ring-primary-500`;

  const style = sizeStyles[size] as CSSProperties;

  return {className, style};
})<SizeProps>``;

type LabelProps = {
  visible: boolean;
};

const Label = styled.span.attrs(({visible}: LabelProps) => {
  let className = 'font-bold';
  if (!visible) className += ' hidden';
  return {className};
})<LabelProps>``;

const IconContainer = styled.span.attrs(({size = 'medium'}: SizeProps) => {
  const className = `flex items-center ${iconStyles[size]}`;
  return {className};
})<SizeProps>``;
