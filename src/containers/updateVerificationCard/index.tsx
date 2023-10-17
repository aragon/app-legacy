import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
  AlertCard,
  Link,
  IconLinkExternal,
  shortenAddress,
} from '@aragon/ods-old';
import {htmlIn} from 'utils/htmlIn';
import {Status, StatusProps} from './Status';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {validateAddress} from 'utils/validators';
import {useUpdateVerification} from 'hooks/useUpdateVerification';
import {Action, DetailedProposal, ProposalId} from 'utils/types';

export interface UpdateVerificationCardProps {
  proposal?: DetailedProposal;
  proposalId?: ProposalId;
  /** @todo Perform check of actions, once requirements are clear */
  actions: Array<Action | undefined> | undefined;
}

export const UpdateVerificationCard: React.FC<UpdateVerificationCardProps> = ({
  proposalId,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();

  const daoAddress: string = daoDetails?.address || '';
  const isDaoAddressCheckLoading = detailsAreLoading;
  const isDaoAddressVerified = validateAddress(daoAddress) === true;

  const [pluginRegistryResult, pluginSetupProcessorResult] =
    useUpdateVerification(proposalId as ProposalId);

  /** @todo Figure put how to get plugin registry update */
  const pluginRegistryAddress = daoDetails?.address || '';
  const isPluginRegistryCheckLoading =
    pluginRegistryResult.isLoading || detailsAreLoading;
  const isPluginRegistryVerified = !!pluginSetupProcessorResult.data;

  /** @todo Figure put how to get plugin setup processor update */
  const pluginSetupProcessorAddress = daoDetails?.address || '';
  const isPluginSetupProcessorCheckLoading =
    pluginSetupProcessorResult.isLoading || detailsAreLoading;
  const isPluginSetupProcessorVerified = !!pluginSetupProcessorResult.data;

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
  className:
    'md:p-6 py-2.5 px-2 rounded-xl bg-neutral-0 border border-neutral-100',
})``;

const Header = styled.div.attrs({
  className: 'space-y-1.5 mb-2',
})``;

const Heading1 = styled.h1.attrs({
  className: 'ft-text-xl font-semibold text-neutral-800 grow',
})``;

const Description = styled.div.attrs({
  className: 'text-neutral-800 text-sm md:text-base',
})``;

export const Row = styled.div.attrs({
  className:
    'py-1 md:py-2 xl:space-x-2 border-t border-neutral-100 ft-text-base flex items-center justify-between',
})``;
