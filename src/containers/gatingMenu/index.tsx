import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {
  ModalBody,
  Title,
  WarningContainer,
  WarningTitle,
} from 'containers/networkErrorMenu';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {GaslessPluginName, PluginTypes} from 'hooks/usePluginClient';

import {Community, Governance} from 'utils/paths';
import {
  Erc20WrapperTokenDetails,
  MajorityVotingSettings,
} from '@aragon/sdk-client';
import {formatUnits, toDisplayEns} from 'utils/library';
import {useExistingToken} from 'hooks/useExistingToken';
import {useGovTokensWrapping} from 'context/govTokensWrapping';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import {Button, IconType, IllustrationObject} from '@aragon/ods';

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
    pluginType === GaslessPluginName;

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
      <ModalHeader>
        <Title>{t('modalAlert.wrapToken.header')}</Title>
        <Button
          variant="tertiary"
          iconLeft={IconType.CLOSE}
          size="sm"
          onClick={() => handleCloseMenu()}
        />
      </ModalHeader>
      <ModalBody>
        <div className="mt-6 flex justify-end"></div>
        <IllustrationObject object="WALLET" height={160} />
        {displayWrapToken && (
          <WarningContainer>
            <WarningTitle>{t('modalAlert.wrapToken.title')}</WarningTitle>
            <WarningDescription>
              <span>
                {t('modalAlert.wrapToken.desc', {
                  tokenSymbol: wrapTokenSymbol,
                })}
              </span>
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
          <div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleWrapTokens} size="lg" variant="primary">
                {t('modalAlert.wrapToken.ctaLabel')}
              </Button>
              <Button
                href={t('modalAlert.wrapToken.descLinkURL')}
                size="lg"
                variant="secondary"
                iconRight={IconType.LINK_EXTERNAL}
                target="_blank"
              >
                {t('navLinks.guide')}
              </Button>
            </div>
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

const ModalHeader = styled.div.attrs({
  className: 'flex items-center p-6 bg-neutral-0 rounded-xl gap-4 sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;
