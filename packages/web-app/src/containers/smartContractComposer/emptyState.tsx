import {ButtonIcon, IconChevronLeft} from '@aragon/ui-components';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {t} from 'i18next';
import React from 'react';
import styled from 'styled-components';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBackClicked: () => void;
};

const EmptyState: React.FC<Props> = props => {
  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <ModalHeader>
        <ButtonIcon
          mode="secondary"
          size="small"
          bgWhite
          icon={<IconChevronLeft />}
          onClick={props.onBackClicked}
        />
        <Title>{t('sCC.emptyTitle')}</Title>
        <div role="presentation" className="w-4 h-4" />
      </ModalHeader>
    </ModalBottomSheetSwitcher>
  );
};

export default EmptyState;

const ModalHeader = styled.div.attrs({
  className: 'flex items-center p-2 space-x-2 bg-ui-0 rounded-xl sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Title = styled.div.attrs({
  className: 'flex-1 font-bold text-center text-ui-800',
})``;
