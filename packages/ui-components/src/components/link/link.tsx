import React from 'react';
import styled from 'styled-components';

import {IconType} from '../icons';

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  disabled?: boolean;
  /** whether link should open new tab to external location */
  external?: boolean;
  iconRight?: React.FunctionComponentElement<IconType>;
  iconLeft?: React.FunctionComponentElement<IconType>;
  /** optional label for the link, defaults to the href if value not provided */
  label?: string;
  /** link variants */
  type?: 'primary' | 'secondary' | 'neutral';
};

/** Default link component */
export const Link: React.FC<LinkProps> = ({
  disabled = false,
  external = true,
  type = 'primary',
  iconLeft,
  iconRight,
  label,
  href,
  ...props
}) => {
  return (
    <StyledLink
      href={disabled ? undefined : href}
      rel="noopener noreferrer"
      type={type}
      disabled={disabled}
      {...(external ? {target: '_blank'} : {})}
      {...props}
      data-testid="link"
    >
      {iconLeft && <div>{iconLeft}</div>}
      <Label>{label || href}</Label>
      {!iconLeft && iconRight && <div>{iconRight}</div>}
    </StyledLink>
  );
};

type StyledLinkProps = Pick<LinkProps, 'disabled'> & {
  type: NonNullable<LinkProps['type']>;
};

const StyledLink = styled.a.attrs(({disabled, type}: StyledLinkProps) => {
  let className =
    'inline-flex items-center space-x-1.5 max-w-full rounded cursor-pointer ';

  className += variants[type];

  className += disabled ? disabledColors[type] : defaultColors[type];

  return {className};
})<StyledLinkProps>`
  outline: 0; // forcefully setting to remove default Chrome black outline
`;

const Label = styled.div.attrs({
  className: 'font-bold truncate',
})``;

const variants = {
  primary:
    'hover:text-primary-700 active:text-primary-800 focus-visible:ring-2 focus-visible:ring-primary-500 ',
  secondary:
    'hover:text-primary-100 active:text-primary-900 focus-visible:ring-2 focus-visible:ring-ui-0 ',
  neutral:
    'hover:text-primary-700 active:text-primary-800 focus-visible:ring-2 focus-visible:ring-primary-500 ',
};

const disabledColors = {
  primary: 'text-ui-300 pointer-events-none ',
  secondary: 'text-primary-300 pointer-events-none ',
  neutral: 'text-ui-300 pointer-events-none ',
};

const defaultColors = {
  primary: 'text-primary-500 ',
  secondary: 'text-ui-0 ',
  neutral: 'text-ui-500 ',
};
