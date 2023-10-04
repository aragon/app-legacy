import {ButtonIcon, ButtonText, IconClose} from '@aragon/ods';
import {useWallet} from 'hooks/useWallet';
import React, {useCallback} from 'react';
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

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};

export const LoginRequired: React.FC<Props> = props => {
  const {close, isOpen} = useGlobalModalContext('wallet');
  const {t} = useTranslation();
  const {isDesktop} = useScreen();
  const {methods} = useWallet();

  // allow modal to be used both via global modal context &&
  // as individually controlled component.
  const showModal = props.isOpen ?? isOpen;

  const handleClose = useCallback(() => {
    if (props.onClose) props.onClose();
    else close();
  }, [close, props]);

  return (
    <ModalBottomSheetSwitcher isOpen={showModal} onClose={handleClose}>
      <ModalHeader>
        <Title>{t('alert.loginRequired.headerTitle')}</Title>
        {isDesktop && (
          <ButtonIcon
            mode="ghost"
            icon={<IconClose />}
            size="small"
            onClick={handleClose}
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
          onClick={() => {
            close();
            methods.selectWallet().catch((err: Error) => {
              // To be implemented: maybe add an error message when
              // the error is different from closing the window
              console.error(err);
            });
          }}
          size="large"
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const ModalHeader = styled.div.attrs({
  className:
    'flex justify-between items-center p-3 bg-ui-0 rounded-xl gap-2 sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const WarningDescription = styled.p.attrs({
  className: 'text-base text-ui-500 text-center',
})``;
