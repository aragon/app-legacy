import React, {ReactComponentElement} from 'react';
import styled, {css} from 'styled-components';

import {IconCheckmark, IconType} from '../icons';

export type AlertChipProps = {
  /** Chip Label */
  label: string;
  /** Icon component */
  icon?: ReactComponentElement<IconType>;
  /** Icon visibility */
  showIcon?: boolean;
  /** chip visibility */
  isOpen: boolean;
};

export const AlertChip: React.FC<AlertChipProps> = ({
  label,
  icon = <IconCheckmark />,
  showIcon = false,
  isOpen,
}) => {
  return (
    <Container {...{isOpen}}>
      {showIcon &&
        React.cloneElement(icon, {
          height: 10,
          width: 10,
          className: 'text-ui-300',
        })}
      <Label>{label}</Label>
    </Container>
  );
};

type ContainerProps = Pick<AlertChipProps, 'isOpen'>;

const myCSS = css`
  animation: ${({isOpen}: ContainerProps) =>
    isOpen ? 'fadein 0.5s' : 'fadeout 0.5s'};
`;

const Container = styled.div.attrs(({isOpen}: ContainerProps) => ({
  className: `flex items-center bg-ui-800 rounded-full px-3 py-2 fixed space-x-1 cursor-default right-1/2 z-50 ${
    isOpen ? 'visible' : 'hidden'
  }`,
}))`
  top: 30px;
  ${myCSS}

  @-webkit-keyframes fadein {
    from {
      top: 0;
      opacity: 0;
    }
    to {
      top: 30px;
      opacity: 1;
    }
  }

  @keyframes fadein {
    from {
      top: 0;
      opacity: 0;
    }
    to {
      top: 30px;
      opacity: 1;
    }
  }

  @-webkit-keyframes fadeout {
    from {
      top: 30px;
      opacity: 1;
    }
    to {
      top: 0;
      opacity: 0;
    }
  }

  @keyframes fadeout {
    from {
      top: 30px;
      opacity: 1;
    }
    to {
      top: 0;
      opacity: 0;
    }
  }
`;

const Label = styled.span.attrs({
  className: 'text-ui-100 ft-text-sm',
})``;
