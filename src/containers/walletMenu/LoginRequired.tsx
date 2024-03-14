import React from 'react';
import {Button, IconType} from '@aragon/ods';
import {useWallet} from 'hooks/useWallet';
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
import WalletIcon from 'assets/images/wallet.svg';

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
          <Button
            variant="tertiary"
            iconLeft={IconType.CLOSE}
            size="sm"
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
        <Button onClick={handleConnectClick} size="lg" variant="primary">
          {t('alert.loginRequired.buttonLabel')}
        </Button>
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const ModalHeader = styled.div.attrs({
  className:
    'flex justify-between items-center p-6 bg-neutral-0 rounded-xl gap-4 sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const WarningDescription = styled.p.attrs({
  className: 'text-base leading-normal text-neutral-500 text-center',
})``;
