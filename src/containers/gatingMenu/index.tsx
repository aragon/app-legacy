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
import {GaselessPluginName, PluginTypes} from 'hooks/usePluginClient';
import WalletIcon from 'public/wallet.svg';
import {Community, Governance} from 'utils/paths';
import {
  Erc20WrapperTokenDetails,
  MajorityVotingSettings,
} from '@aragon/sdk-client';
import {formatUnits, toDisplayEns} from 'utils/library';
import {useExistingToken} from 'hooks/useExistingToken';
import {htmlIn} from 'utils/htmlIn';
import {useGovTokensWrapping} from 'context/govTokensWrapping';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import {Button} from '@aragon/ods';

export const GatingMenu: React.FC = () => {
  const {close, isOpen} = useGlobalModalContext('gating');

  const {t} = useTranslation();
  const navigate = useNavigate();
  const {networkUrlSegment: network} = useNetwork();
  const {handleOpenModal} = useGovTokensWrapping();

  const {data: daoDetails} = useDaoDetailsQuery();
  const {plugins, ensDomain, address} = daoDetails ?? {};
  const daoDisplayName =
    toDisplayEns(ensDomain) !== '' ? toDisplayEns(ensDomain) : address;
  const daoName = daoDetails?.metadata.name;

  const {data: daoToken} = useDaoToken(plugins?.[0].instanceAddress);
  const {isDAOTokenWrapped} = useExistingToken({daoDetails, daoToken});

  const {data: votingSettings} = useVotingSettings({
    pluginAddress: plugins?.[0].instanceAddress,
    pluginType: plugins?.[0].id as PluginTypes,
  });

  const handleCloseMenu = () => {
    const governancePath = generatePath(Governance, {
      network,
      dao: daoDisplayName,
    });
    navigate(governancePath);
    close();
  };

  const handleWrapTokens = () => {
    const communityPath = generatePath(Community, {
      network,
      dao: daoDisplayName,
    });
    navigate(communityPath);
    close();
    handleOpenModal();
  };

  const pluginType = plugins?.[0].id as PluginTypes;
  const isTokenBasedDao =
    pluginType === 'token-voting.plugin.dao.eth' ||
    pluginType === GaselessPluginName;

  const displayWrapToken = isTokenBasedDao && isDAOTokenWrapped;
  const wrapTokenSymbol =
    (daoToken as Erc20WrapperTokenDetails | undefined)?.underlyingToken
      ?.symbol || '';

  const minProposalThreshold = Number(
    formatUnits(
      (votingSettings as MajorityVotingSettings)?.minProposerVotingPower ?? 0,
      daoToken?.decimals as number
    )
  );

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={handleCloseMenu}>
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
                daoName: daoName,
                tokenName: daoToken?.name,
                amount: minProposalThreshold,
                tokenSymbol: daoToken?.symbol,
              })}
            </WarningDescription>
          </WarningContainer>
        )}
        {!isTokenBasedDao && (
          <WarningContainer>
            <WarningTitle>{t('alert.gatingUsers.walletTitle')}</WarningTitle>
            <WarningDescription>
              {t('alert.gatingUsers.walletDescription', {
                daoName: daoName,
              })}
            </WarningDescription>
          </WarningContainer>
        )}
        {displayWrapToken ? (
          <div className="grid grid-cols-2 gap-6">
            <Button onClick={handleWrapTokens} size="lg" variant="primary">
              {t('modalAlert.wrapToken.ctaLabel')}
            </Button>
            <Button variant="tertiary" onClick={handleCloseMenu} size="lg">
              {t('modalAlert.wrapToken.cancleLabel')}
            </Button>
          </div>
        ) : (
          <Button onClick={handleCloseMenu} size="lg" variant="primary">
            {t('alert.gatingUsers.buttonLabel')}
          </Button>
        )}
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const WarningDescription = styled.p.attrs({
  className: 'text-base text-neutral-500 text-center',
})``;
