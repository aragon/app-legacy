import React, {ReactComponentElement} from 'react';
import styled, {css} from 'styled-components';

import {IconCheckmark, IconType} from '../icons';

export type AlertChipProps = {
  /** Chip Label */
  label: string;
  /** Icon component */
  icon?: ReactComponentElement<IconType>;
  /** control Icon visibility */
  showIcon?: boolean;
  /** Is chip visible */
  isOpen: boolean;
};

export const AlertChip: React.FC<AlertChipProps> = ({
  label,
  icon = <IconCheckmark />,
  showIcon = false,
  isOpen = false,
}) => {
  return (
    <Wrapper data-testid="alertChip" {...{isOpen}}>
      <BadgeContainer>
        {showIcon &&
          React.cloneElement(icon, {
            height: 10,
            width: 10,
            className: 'text-ui-300',
          })}
        <Label>{label}</Label>
      </BadgeContainer>
    </Wrapper>
  );
};

type ContainerProps = Pick<AlertChipProps, 'isOpen'>;

const WrapperAnimationCSS = css`
  animation: ${({isOpen}: ContainerProps) =>
    isOpen ? 'fadein 0.3s' : 'fadeout 0.3s'};

  @-webkit-keyframes fadein {
    from {
      top: 0;
      opacity: 0;
      z-index: 0;
    }
    to {
      top: 24px;
      opacity: 1;
      z-index: 50;
    }
  }

  @keyframes fadein {
    from {
      top: 0;
      opacity: 0;
      z-index: 0;
    }
    to {
      top: 24px;
      opacity: 1;
      z-index: 50;
    }
  }

  @-webkit-keyframes fadeout {
    from {
      top: 24px;
      opacity: 1;
      z-index: 50;
    }
    to {
      top: 0;
      opacity: 0;
      z-index: 0;
    }
  }

  @keyframes fadeout {
    from {
      top: 24px;
      opacity: 1;
      z-index: 50;
    }
    to {
      top: 0;s
      opacity: 0;
      z-index: 0;
    }
  }
`;

const Wrapper = styled.div.attrs(({isOpen}: ContainerProps) => ({
  className: `fixed w-full flex items-center justify-center top-3 ${
    isOpen ? 'opacity-100 fixed z-50' : 'opacity-0 none z-0'
  }`,
}))`
  ${WrapperAnimationCSS}
`;

const BadgeContainer = styled.div.attrs(() => ({
  className:
    'flex items-center bg-ui-800 rounded-full px-3 py-2 space-x-1 cursor-default',
}))``;

const Label = styled.span.attrs({
  className: 'text-ui-100 ft-text-sm',
})``;
