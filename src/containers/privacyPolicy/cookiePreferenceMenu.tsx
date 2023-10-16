import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {ButtonIcon, ButtonText, IconClose} from '@aragon/ods-old';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';

type Props = {
  show: boolean;
  onClose: () => void;
  onAccept: () => void;
};

const CookiePreferenceMenu: React.FC<Props> = ({show, onClose, onAccept}) => {
  const {t} = useTranslation();

  return (
    <ModalBottomSheetSwitcher
      isOpen={show}
      onClose={onClose}
      onOpenAutoFocus={e => e.preventDefault()}
    >
      <ModalHeader>
        <Title>{t('cookiePreferences.title')}</Title>
        <ButtonIcon
          mode="secondary"
          size="small"
          icon={<IconClose />}
          onClick={onClose}
          bgWhite
        />
      </ModalHeader>
      <BottomSheetContentContainer>
        <Text>{t('cookiePreferences.content')}</Text>
        <div className="flex space-x-2">
          <ButtonText
            className="flex-1"
            label={t('cookiePreferences.accept')}
            size="large"
            onClick={onAccept}
          />
          <ButtonText
            className="flex-1"
            label={t('cookiePreferences.cancel')}
            size="large"
            mode="secondary"
            onClick={onClose}
          />
        </div>
      </BottomSheetContentContainer>
    </ModalBottomSheetSwitcher>
  );
};

export default CookiePreferenceMenu;

const Title = styled.div.attrs({
  className: 'flex-1 font-bold text-neutral-800',
})``;

const ModalHeader = styled.div.attrs({
  className: 'flex items-center p-2 space-x-2 bg-neutral-0 rounded-xl sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const BottomSheetContentContainer = styled.div.attrs({
  className: 'py-3 px-2 space-y-3 md:w-[448px]',
})``;

const Text = styled.div.attrs({
  className: 'flex-1 xl:text-sm text-neutral-600',
})``;
