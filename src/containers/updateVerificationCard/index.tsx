import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AlertCard, Link, IconLinkExternal, shortenAddress} from '@aragon/ods';
import {htmlIn} from 'utils/htmlIn';
import {Status, StatusProps} from './Status';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {validateAddress} from 'utils/validators';
import {useUpdateVerification} from 'hooks/useUpdateVerification';
import {DetailedProposal, ProposalId} from 'utils/types';
import {DaoAction} from '@aragon/sdk-client-common';
import {useClient} from 'hooks/useClient';

export interface UpdateVerificationCardProps {
  proposal?: DetailedProposal;
  proposalId?: ProposalId;
  actions?: DaoAction[];
}

export const UpdateVerificationCard: React.FC<UpdateVerificationCardProps> = ({
  proposalId,
  actions,
}) => {
  const {t} = useTranslation();
  const {client} = useClient();
  const {network} = useNetwork();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();

  const daoAddress: string = daoDetails?.address || '';
  const isDaoAddressCheckLoading = detailsAreLoading;
  const isDaoAddressVerified = validateAddress(daoAddress) === true;

  const isPluginUpdateProposal = client?.methods.isPluginUpdateProposal(
    actions as DaoAction[]
  );
  const isOsUpdateProposal = client?.methods.isPluginUpdateProposal(
    actions as DaoAction[]
  );

  const [pluginUpdateVerification, osUpdateVerification] =
    useUpdateVerification(
      proposalId as ProposalId,
      isPluginUpdateProposal,
      isOsUpdateProposal
    );

  /** @todo Figure put how to get plugin registry update */
  const pluginRegistryAddress = daoDetails?.address || '';
  const isPluginRegistryCheckLoading =
    pluginUpdateVerification.isLoading || detailsAreLoading;
  const isPluginRegistryVerified = !!osUpdateVerification.data;

  /** @todo Figure put how to get plugin setup processor update */
  const pluginSetupProcessorAddress = daoDetails?.address || '';
  const isPluginSetupProcessorCheckLoading =
    pluginUpdateVerification.isLoading || detailsAreLoading;
  const isPluginSetupProcessorVerified = !!osUpdateVerification.data;

  const isVerificationFailed =
    (!isDaoAddressCheckLoading && !isDaoAddressVerified) ||
    (!isPluginRegistryCheckLoading && !isPluginRegistryVerified) ||
    (!isPluginSetupProcessorCheckLoading && !isPluginSetupProcessorVerified);

  function getStatusMode(
    isLoading: boolean,
    isVerified: boolean
  ): StatusProps['mode'] {
    if (isLoading) return 'loading';
    return isVerified ? 'success' : 'error';
  }

  if (!isPluginUpdateProposal && !isOsUpdateProposal) return null;

  return (
    <Container>
      <Header>
        <Heading1>{t('update.securityCheck.title')}</Heading1>
        <Description
          dangerouslySetInnerHTML={{
            __html: htmlIn(t)('update.securityCheck.desc'),
          }}
        />
      </Header>
      <div>
        <Row>
          <Status
            mode={getStatusMode(isDaoAddressCheckLoading, isDaoAddressVerified)}
            label={t('update.securityCheck.daoAddress')}
          />
          <Link
            label={shortenAddress(daoAddress)}
            type="neutral"
            href={`${CHAIN_METADATA[network].explorer}/address/${daoAddress}`}
            iconRight={<IconLinkExternal />}
          />
        </Row>
        <Row>
          <Status
            mode={getStatusMode(
              isPluginRegistryCheckLoading,
              isPluginRegistryVerified
            )}
            label={t('update.securityCheck.pluginRegistry')}
          />
          <Link
            label={shortenAddress(pluginRegistryAddress)}
            type="neutral"
            href={`${CHAIN_METADATA[network].explorer}/address/${pluginRegistryAddress}`}
            iconRight={<IconLinkExternal />}
          />
        </Row>
        <Row>
          <Status
            mode={getStatusMode(
              isPluginSetupProcessorCheckLoading,
              isPluginSetupProcessorVerified
            )}
            label={t('update.securityCheck.pluginSetupProcessor')}
          />
          <Link
            label={shortenAddress(pluginSetupProcessorAddress)}
            type="neutral"
            href={`${CHAIN_METADATA[network].explorer}/address/${pluginSetupProcessorAddress}`}
            iconRight={<IconLinkExternal />}
          />
        </Row>
      </div>
      {isVerificationFailed && (
        <AlertCard
          mode="critical"
          title={t('update.securityCheck.alertTitle')}
          helpText={t('update.securityCheck.alertDesc')}
        />
      )}
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'tablet:p-3 py-2.5 px-2 rounded-xl bg-ui-0 border border-ui-100',
})``;

const Header = styled.div.attrs({
  className: 'space-y-1.5 mb-2',
})``;

const Heading1 = styled.h1.attrs({
  className: 'ft-text-xl font-bold text-ui-800 grow',
})``;

const Description = styled.div.attrs({
  className: 'text-ui-800 text-sm tablet:text-base',
})``;

export const Row = styled.div.attrs({
  className:
    'py-1 tablet:py-2 desktop:space-x-2 border-t border-ui-100 ft-text-base flex items-center justify-between',
})``;
