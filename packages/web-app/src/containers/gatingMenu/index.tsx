import React from 'react';
import {ButtonText} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import WalletIcon from 'public/wallet.svg';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {
  ModalBody,
  StyledImage,
  WarningContainer,
  WarningTitle,
} from 'containers/networkErrorMenu';
import {useDaoToken} from 'hooks/useDaoToken';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import {Governance} from 'utils/paths';
import {useNetwork} from 'context/network';

const TokenContainer = ({dao}: {dao: string}) => {
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(dao!);
  const {data: daoToken, isLoading: daoTokenLoading} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress as string
  );
  const {t} = useTranslation();

  return (
    <WarningContainer>
      <WarningTitle>{t('alert.gatingUsers.tokenTitle')}</WarningTitle>
      <WarningDescription>
        {t('alert.gatingUsers.tokenDescription', {
          tokenName:
            !daoTokenLoading && !detailsAreLoading ? daoToken?.name : '',
        })}
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

export const GatingMenu = ({pluginType}: {pluginType: PluginTypes}) => {
  const {close, isGatingOpen} = useGlobalModalContext();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {data: dao} = useDaoParam();

  return (
    <ModalBottomSheetSwitcher isOpen={isGatingOpen}>
      <ModalBody>
        <StyledImage src={WalletIcon} />
        {pluginType === 'erc20voting.dao.eth' ? (
          <TokenContainer dao={dao} />
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
