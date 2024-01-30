import {ButtonText} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {
  ModalBody,
  StyledImage,
  WarningContainer,
  WarningTitle,
} from 'containers/networkErrorMenu';
import {useGlobalModalContext} from 'context/globalModals';
import WalletIcon from 'public/wallet.svg';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';

export const CannotDelegateModal: React.FC = () => {
  const {close, isOpen} = useGlobalModalContext('cannotDelegate');

  const {t} = useTranslation();

  const {data: daoDetails} = useDaoDetailsQuery();
  const {plugins} = daoDetails ?? {};
  const daoName = daoDetails?.metadata.name;

  const {data: daoToken} = useDaoToken(plugins?.[0].instanceAddress);

  const handleCloseMenu = () => {
    close();
  };

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={handleCloseMenu}>
      <ModalBody>
        <StyledImage src={WalletIcon} />

        <WarningContainer>
          <WarningTitle>
            {t('alert.gatingUsers.cannotDelegateTitle')}
          </WarningTitle>
          <WarningDescription>
            {t('alert.gatingUsers.cannotDelegateDescription', {
              daoName: daoName,
              tokenName: daoToken?.name,
            })}
          </WarningDescription>
        </WarningContainer>

        <ButtonText
          label={t('alert.gatingUsers.buttonLabel')}
          onClick={handleCloseMenu}
          size="large"
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const WarningDescription = styled.p.attrs({
  className: 'text-base text-neutral-500 text-center',
})``;
