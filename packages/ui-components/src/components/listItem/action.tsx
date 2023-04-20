import styled from 'styled-components';
import React, {ButtonHTMLAttributes} from 'react';

import {AvatarDao} from '../avatar';

type CustomButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled'
>;
export type ListItemActionProps = CustomButtonProps & {
  /**
   * Parent background color
   */
  bgWhite?: boolean;
  /**
   * State that can be explicitly set by the client. These are mutually
   * exclusive. Default behaves like a normal UI element and will hover, focus,
   * etc. automatically. Disabled will disable the ui component, selected will
   * mark it selected.
   */
  mode?: 'default' | 'disabled' | 'selected';
  /**
   * Bold text, left aligned. Mandatory
   */
  title: string;
  /**
   * Normal font, small. Optional. Displayed below the title, left aligned
   */
  subtitle?: string;
  /** Left aligned. Both left and right icon can be present simultaneously */
  iconLeft?: React.ReactElement | string;
  /** Right aligned. Both left and right icon can be present simultaneously */
  iconRight?: React.ReactElement;
};

export const ListItemAction: React.FC<ListItemActionProps> = ({
  title,
  subtitle,
  iconLeft,
  iconRight,
  mode = 'default',
  ...props
}) => {
  return (
    <Container {...props} mode={mode} data-testid="listItem-action">
      <LeftContent>
        <RenderIconLeft icon={iconLeft} label={title} />
        {/* This could be done with label. However, I can't get the label's text
         to inherit the color (for example, when selected mode is on) */}
        <LabelContainer>
          <p className="font-bold truncate ft-text-base">{title}</p>
          {subtitle && <p className="truncate ft-text-sm">{subtitle}</p>}
        </LabelContainer>
      </LeftContent>
      {iconRight && <span>{iconRight}</span>}
    </Container>
  );
};

// NOTE: Temporary, to be refactored with new version of ODS
const RenderIconLeft: React.FC<{
  icon?: ListItemActionProps['iconLeft'];
  label?: string;
}> = ({icon, label}) => {
  if (!icon) {
    return null;
  }

  return typeof icon === 'string' ? (
    <AvatarDao daoName={label || icon} src={icon} size="small" />
  ) : (
    <span>{icon}</span>
  );
};

type InputContainerProps = Pick<ListItemActionProps, 'mode' | 'bgWhite'>;

const Container = styled.button.attrs(
  ({mode, bgWhite = false}: InputContainerProps) => {
    const baseLayoutClasses = 'flex items-center gap-x-1.5 w-full';
    const baseStyleClasses = 'py-1.5 px-2 rounded-xl font-normal';
    let className:
      | string
      | undefined = `${baseLayoutClasses} ${baseStyleClasses}`;

    switch (mode) {
      case 'disabled':
        className += ' text-ui-300 border-ui-200';
        className += bgWhite ? ' bg-ui-0' : ' bg-ui-50';
        break;
      case 'selected':
        className += ' text-primary-500 border-primary-500';
        className += bgWhite ? ' bg-primary-50' : ' bg-ui-0';
        break;
      default:
        {
          const focusClasses =
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';
          const hoverClasses = 'hover:text-primary-500';
          let activeClasses = 'active:outline-none active:ring-0';
          activeClasses += bgWhite
            ? ' active:bg-primary-50'
            : ' active:bg-ui-0';

          className += bgWhite ? ' bg-ui-0' : ' bg-ui-50';
          className += ` text-ui-600 ${activeClasses} ${focusClasses} ${hoverClasses}`;
        }
        break;
    }
    const disabled: boolean | undefined = mode === 'disabled';
    return {className, disabled};
  }
)<InputContainerProps>``;

const LabelContainer = styled.div.attrs({
  className: 'text-left overflow-hidden',
})``;
const LeftContent = styled.div.attrs({
  className: 'flex items-center space-x-1.5 flex-1 overflow-hidden',
})``;
