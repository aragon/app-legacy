import React, {type ButtonHTMLAttributes, type CSSProperties} from 'react';
import {styled} from 'styled-components';

import {type IconType} from '../icons';

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
  small: 'h-8 space-x-2 rounded-lg',
  medium: 'h-10 space-x-3 rounded-[10px]',
  large: 'h-12 space-x-3 rounded-xl',
};

const sizeStyles = {
  small: {minWidth: '32px'},
  medium: {minWidth: '40px'},
  large: {minWidth: '48px'},
};

const fontStyles = {
  small: 'ft-text-sm',
  medium: 'ft-text-base',
  large: 'ft-text-base',
};

const iconStyles = {
  small: 'w-3 h-3',
  medium: 'w-4 h-4',
  large: 'w-4 h-4',
};

/**********************************
 *        Styled-Components       *
 **********************************/
type SizeProps = {
  size: ButtonBaseProps['size'];
};

const BaseStyledButton = styled.button.attrs<SizeProps>(({size = 'medium'}) => {
  const className = `${sizeClassNames[size]} ${fontStyles[size]}
  flex justify-center items-center focus:outline-none focus-visible:ring
  focus-visible:ring-primary`;

  const style = sizeStyles[size] as CSSProperties;

  return {className, style};
})<SizeProps>``;

type LabelProps = {
  visible: boolean;
};

const Label = styled.span.attrs<LabelProps>(({visible}) => {
  let className = 'font-semibold';
  if (!visible) {
    className += ' hidden';
  }
  return {className};
})<LabelProps>``;

const IconContainer = styled.span.attrs<SizeProps>(({size = 'medium'}) => {
  const className = `flex items-center ${iconStyles[size]}`;
  return {className};
})<SizeProps>``;
