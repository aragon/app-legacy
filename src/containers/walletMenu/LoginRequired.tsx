import {ButtonIcon, ButtonText, IconClose} from '@aragon/ods-old';
import {useWallet} from 'hooks/useWallet';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {
  ModalBody,
  StyledImage,
  Title,
  WarningContainer,
  WarningTitle,
} from 'containers/networkErrorMenu';
import {useGlobalModalContext} from 'context/globalModals';
import useScreen from 'hooks/useScreen';
import WalletIcon from 'public/wallet.svg';

interface ILoginRequiredProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const LoginRequired: React.FC<ILoginRequiredProps> = props => {
  const {onClose: onCloseProp, isOpen: isOpenProp} = props;

  const {close, isOpen: isOpenContext} = useGlobalModalContext('wallet');

  const {t} = useTranslation();
  const {isDesktop} = useScreen();
  const {methods} = useWallet();

  // Combine the isOpen and onClose handler as the dialog can be used both through
  // the global modal context and standalone
  const isOpen = isOpenProp ?? isOpenContext;
  const onClose = onCloseProp ?? close;

  const handleConnectClick = async () => {
    close();
    await methods.selectWallet();
  };

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <Title>{t('alert.loginRequired.headerTitle')}</Title>
        {isDesktop && (
          <ButtonIcon
            mode="ghost"
            icon={<IconClose />}
            size="small"
            onClick={() => onClose()}
          />
        )}
      </ModalHeader>
      <ModalBody>
        <StyledImage src={WalletIcon} />
        <WarningContainer>
          <WarningTitle>{t('alert.loginRequired.title')}</WarningTitle>
          <WarningDescription>
            {t('alert.loginRequired.description')}
          </WarningDescription>
        </WarningContainer>
        <ButtonText
          label={t('alert.loginRequired.buttonLabel')}
          onClick={handleConnectClick}
          size="large"
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const ModalHeader = styled.div.attrs({
  className:
    'flex justify-between items-center p-6 bg-neutral-0 rounded-xl gap-2 sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const WarningDescription = styled.p.attrs({
  className: 'text-base text-neutral-500 text-center',
})``;
