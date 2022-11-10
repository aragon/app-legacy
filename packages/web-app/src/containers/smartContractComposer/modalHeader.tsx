import {ButtonIcon, IconChevronLeft, IconClose} from '@aragon/ui-components';
import React from 'react';
import styled from 'styled-components';

type Props = {
  title: string;
  onBackButtonClicked: () => void;
  onClose?: () => void;
};

// NOTE: While this header is technically a ui-component,
// keeping it here so we can progressively build it up as needed
// Also, because this will be ui-component, it is encouraged for now
// to use classNames to hide if necessary instead of useScreen and JS
const Header: React.FC<Props> = props => {
  return (
    <ModalHeader>
      <ButtonIcon
        mode="secondary"
        size="small"
        icon={<IconChevronLeft />}
        onClick={props.onBackButtonClicked}
        bgWhite
      />
      <Title>{props.title}</Title>
      <ButtonWrapper className="w-4 h-4">
        <ButtonIcon
          mode="secondary"
          size="small"
          icon={<IconClose />}
          onClick={props.onClose}
          bgWhite
          className="hidden desktop:block"
        />
      </ButtonWrapper>
    </ModalHeader>
  );
};

export default Header;

const ModalHeader = styled.div.attrs({
  className:
    'flex items-center rounded-xl space-x-2 desktop:space-x-3 p-2 desktop:p-3',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Title = styled.div.attrs({
  className: 'flex-1 font-bold text-ui-800 text-center desktop:text-left',
})``;

const ButtonWrapper = styled.div.attrs({className: 'w-4 h-4'})``;
