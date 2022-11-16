import {ButtonText} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {
  ModalBody,
  StyledImage,
  WarningContainer,
  WarningTitle,
} from 'containers/networkErrorMenu';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useDaoParam} from 'hooks/useDaoParam';
import WalletIcon from 'public/wallet.svg';
import {Governance} from 'utils/paths';

const TokenContainer = ({tokenName}: {tokenName: string}) => {
  const {t} = useTranslation();

  return (
    <WarningContainer>
      <WarningTitle>{t('alert.gatingUsers.tokenTitle')}</WarningTitle>
      <WarningDescription>
        {t('alert.gatingUsers.tokenDescription', {tokenName})}
      </WarningDescription>
    </WarningContainer>
  );
};

const WalletContainer = () => {
  const {t} = useTranslation();
  return (
    <WarningContainer>
      <WarningTitle>{t('alert.gatingUsers.walletTitle')}</WarningTitle>
      <WarningDescription>
        {t('alert.gatingUsers.walletDescription')}
      </WarningDescription>
    </WarningContainer>
  );
};

export const GatingMenu = ({tokenName}: {tokenName?: string}) => {
  const {close, isGatingOpen} = useGlobalModalContext();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {data: dao} = useDaoParam();

  return (
    <ModalBottomSheetSwitcher isOpen={isGatingOpen}>
      <ModalBody>
        <StyledImage src={WalletIcon} />
        {tokenName ? (
          <TokenContainer tokenName={tokenName} />
        ) : (
          <WalletContainer />
        )}
        <ButtonText
          label={t('alert.gatingUsers.buttonLabel')}
          onClick={() => {
            navigate(generatePath(Governance, {network, dao}));
            close('gating');
          }}
          size="large"
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const WarningDescription = styled.p.attrs({
  className: 'text-base text-ui-500 text-center',
})``;
