import {
  ButtonIcon,
  IconHome,
  IconChevronRight,
  IconClose,
} from '@aragon/ui-components';
import React from 'react';
import styled from 'styled-components';

type DesktopModalHeaderProps = {
  onClose?: () => void;
  selectedContract?: string;
};

const DesktopModalHeader: React.FC<DesktopModalHeaderProps> = props => {
  return (
    <Container>
      <LeftContent>
        <ButtonIcon icon={<IconHome />} mode="secondary" bgWhite />
        <IconChevronRight />
        {props.selectedContract && (
          <>
            <SelectedContract>{props.selectedContract}</SelectedContract>
            <IconChevronRight />
          </>
        )}
        <p className="border">Type to find any action...</p>
      </LeftContent>
      <ButtonIcon
        mode="secondary"
        icon={<IconClose />}
        onClick={props.onClose}
        bgWhite
      />
    </Container>
  );
};

export default DesktopModalHeader;

const Container = styled.div.attrs({
  className:
    'flex sticky top-0 justify-between items-center py-2.5 px-3 bg-ui-0 border-b border-ui-100',
})``;

const LeftContent = styled.div.attrs({
  className: 'flex gap-x-1 items-center text-ui-300 ft-text-base',
})``;

const SelectedContract = styled.p.attrs({
  className: 'font-bold text-ui-600 ft-text-base',
})``;
