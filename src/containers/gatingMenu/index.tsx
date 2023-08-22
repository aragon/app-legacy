import {ButtonText} from '@aragon/ods';
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
import {PluginTypes} from 'hooks/usePluginClient';
import WalletIcon from 'public/wallet.svg';
import {Governance, Community} from 'utils/paths';
import {Erc20WrapperTokenDetails} from '@aragon/sdk-client';
import {toDisplayEns} from 'utils/library';
import {useExistingToken} from 'hooks/useExistingToken';
import {htmlIn} from 'utils/htmlIn';
import {useGovTokensWrapping} from 'context/govTokensWrapping';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';

export const GatingMenu: React.FC = () => {
  const {close, isGatingOpen} = useGlobalModalContext();

  const {t} = useTranslation();
  const navigate = useNavigate();
  const {networkUrlSegment: network} = useNetwork();
  const {handleOpenModal} = useGovTokensWrapping();

  const {data: daoDetails} = useDaoDetailsQuery();
  const {plugins, ensDomain, address} = daoDetails ?? {};
  const daoName =
    toDisplayEns(ensDomain) !== '' ? toDisplayEns(ensDomain) : address;

  const {data: daoToken} = useDaoToken(plugins?.[0].instanceAddress);
  const {isDAOTokenWrapped} = useExistingToken({daoDetails, daoToken});

  const handleCloseMenu = () => {
    const governancePath = generatePath(Governance, {network, dao: daoName});
    navigate(governancePath);
    close('gating');
  };

  const handleWrapTokens = () => {
    const communityPath = generatePath(Community, {network, dao: daoName});
    navigate(communityPath);
    close('gating');
    handleOpenModal();
  };

  const pluginType = plugins?.[0].id as PluginTypes;
  const isTokenBasedDao = pluginType === 'token-voting.plugin.dao.eth';

  const displayWrapToken = isTokenBasedDao && isDAOTokenWrapped;
  const wrapTokenSymbol =
    (daoToken as Erc20WrapperTokenDetails | undefined)?.underlyingToken
      ?.symbol || '';

  return (
    <ModalBottomSheetSwitcher isOpen={isGatingOpen} onClose={handleCloseMenu}>
      <ModalBody>
        <StyledImage src={WalletIcon} />

        {displayWrapToken && (
          <WarningContainer>
            <WarningTitle>{t('modalAlert.wrapToken.title')}</WarningTitle>
            <WarningDescription>
              <span
                dangerouslySetInnerHTML={{
                  __html: htmlIn(t)('modalAlert.wrapToken.desc', {
                    tokenSymbol: wrapTokenSymbol,
                  }),
                }}
              />
            </WarningDescription>
          </WarningContainer>
        )}

        {isTokenBasedDao && !isDAOTokenWrapped && (
          <WarningContainer>
            <WarningTitle>{t('alert.gatingUsers.tokenTitle')}</WarningTitle>
            <WarningDescription>
              {t('alert.gatingUsers.tokenDescription', {
                tokenName: daoToken?.name,
              })}
            </WarningDescription>
          </WarningContainer>
        )}

        {!isTokenBasedDao && (
          <WarningContainer>
            <WarningTitle>{t('alert.gatingUsers.walletTitle')}</WarningTitle>
            <WarningDescription>
              {t('alert.gatingUsers.walletDescription')}
            </WarningDescription>
          </WarningContainer>
        )}

        {displayWrapToken ? (
          <div className="grid grid-cols-2 gap-3">
            <ButtonText
              label={t('modalAlert.wrapToken.ctaLabel')}
              onClick={handleWrapTokens}
              size="large"
            />
            <ButtonText
              label={t('modalAlert.wrapToken.cancleLabel')}
              mode="secondary"
              onClick={handleCloseMenu}
              size="large"
            />
          </div>
        ) : (
          <ButtonText
            label={t('alert.gatingUsers.buttonLabel')}
            onClick={handleCloseMenu}
            size="large"
          />
        )}
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const WarningDescription = styled.p.attrs({
  className: 'text-base text-ui-500 text-center',
})``;
