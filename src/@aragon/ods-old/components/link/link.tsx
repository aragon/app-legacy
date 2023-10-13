import React from 'react';
import {styled} from 'styled-components';

import {type IconType} from '../icons';

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  disabled?: boolean;
  /** Indicates whether the link should open in a new tab */
  external?: boolean;
  iconRight?: React.FunctionComponentElement<IconType>;
  /** Label for the link */
  label: string;
  /** Optional description */
  description?: string;
  /** Variants for link appearance */
  type?: LinkType;
};

export const LINK_VARIANTS = ['primary', 'neutral'] as const;
type LinkType = (typeof LINK_VARIANTS)[number];

/**
 * The Link component creates a styled anchor element with optional icon and description.
 *
 * @param {LinkProps} props - The properties of the link.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      disabled = false,
      external = true,
      type = 'primary',
      iconRight,
      description,
      label,
      href,
      ...props
    },
    ref
  ) => {
    return (
      <StyledLink
        ref={ref}
        href={disabled ? undefined : href}
        rel="noopener noreferrer"
        type={type}
        disabled={disabled}
        {...(external && {target: '_blank'})}
        {...props}
        data-testid="link"
      >
        <div className="mr-0.5 flex items-center gap-x-1">
          <Label>{label}</Label>
          {iconRight && <div>{iconRight}</div>}
        </div>
        {description && <Description>{description}</Description>}
      </StyledLink>
    );
  }
);

Link.displayName = 'Link';

type StyledLinkProps = Pick<LinkProps, 'disabled'> & {
  type: NonNullable<LinkProps['type']>;
};

const StyledLink = styled.a.attrs<StyledLinkProps>(({disabled, type}) => {
  let className =
    'inline-flex flex-col gap-y-0.25 tablet:gap-y-0.5 max-w-full rounded cursor-pointer ';
  className += variants[type];
  className += disabled ? disabledColors[type] : defaultColors[type];

  return {className};
})<StyledLinkProps>`
  outline: 0; // Remove default Chrome black outline
`;

const Label = styled.span.attrs({
  className: 'ft-text-base font-semibold truncate',
})``;

const Description = styled.p.attrs({
  className: 'ft-text-sm text-ui-600 truncate',
})``;

const variants = {
  primary: `hover:text-primary-600 active:text-primary-800
        focus-visible:ring focus-visible:ring-primary-200 focus-visible:bg-ui-50 `,

  neutral: `hover:text-ui-800 active:text-ui-800
        focus-visible:ring focus-visible:ring-primary-200 focus-visible:bg-ui-50 `,
};

const disabledColors = {
  primary: 'text-ui-300 pointer-events-none ',
  neutral: 'text-ui-300 pointer-events-none ',
};

const defaultColors = {
  primary: 'text-primary-400 ',
  neutral: 'text-ui-600 ',
};
