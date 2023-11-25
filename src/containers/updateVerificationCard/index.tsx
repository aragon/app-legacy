// import {
// AlertCard,
// IconLinkExternal,
// Link,
// shortenAddress,
// } from '@aragon/ods-old';
// import {DaoAction} from '@aragon/sdk-client-common';
import React, {useEffect, useMemo, useState} from 'react';
// import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

// import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useUpdateVerification} from 'hooks/useUpdateVerification';
import {useClient} from 'hooks/useClient';
import {isVerifiedAragonUpdateProposal} from 'utils/proposals';
import {htmlIn} from 'utils/htmlIn';
import {useTranslation} from 'react-i18next';
// import {CHAIN_METADATA} from 'utils/constants';
// import {htmlIn} from 'utils/htmlIn';
// import {ProposalId} from 'utils/types';
// import {validateAddress} from 'utils/validators';
import {Status, StatusProps} from './Status';
// import {useClient} from 'hooks/useClient';

export interface UpdateVerificationCardProps {
  proposalId?: string;
}

export const UpdateVerificationCard: React.FC<UpdateVerificationCardProps> = ({
  proposalId,
}) => {
  const {t} = useTranslation();
  const {client} = useClient();
  const [verifiedUpdateProposal, setVerifiedUpdateProposal] =
    useState<boolean>(false);

  console.log('verifiedUpdateProposal', verifiedUpdateProposal);

  useEffect(() => {
    async function fetchIsVerifiedAragonUpdateProposal() {
      if (client != null && proposalId) {
        setVerifiedUpdateProposal(
          await isVerifiedAragonUpdateProposal(proposalId, client)
        );
      }
    }

    fetchIsVerifiedAragonUpdateProposal();
  }, [client, proposalId]);

  // const {t} = useTranslation();
  // const {client} = useClient();
  // const {network} = useNetwork();
  const {data: daoDetails} = useDaoDetailsQuery();

  const daoAddress: string = daoDetails?.address || '';
  const pluginType =
    daoDetails?.plugins[0].type === 'token-voting.plugin.dao.eth'
      ? 'token voting'
      : 'multisig';
  // const isDaoAddressCheckLoading = detailsAreLoading;
  // const isDaoAddressVerified = validateAddress(daoAddress) === true;

  const [
    {data: pluginUpdateVerification, isLoading: isPluginUpdateLoading},
    {data: osUpdateVerification, isLoading: isOSUpdateLoading},
  ] = useUpdateVerification(daoAddress, proposalId as string);

  console.log(
    'showUpdateVerification',
    proposalId,
    pluginUpdateVerification,
    osUpdateVerification
  );

  /** @todo Figure put how to get plugin registry update */
  // // const pluginRegistryAddress = daoDetails?.address || ''
  // const isPluginRegistryVerified = !!osUpdateVerification.data;

  // /** @todo Figure put how to get plugin setup processor update */
  // // const pluginSetupProcessorAddress = daoDetails?.address || '';
  // const isPluginSetupProcessorCheckLoading =
  //   pluginUpdateVerification.isLoading || detailsAreLoading;
  // const isPluginSetupProcessorVerified = !!osUpdateVerification.data;

  const OSUpdate: StatusProps = useMemo(() => {
    if (isOSUpdateLoading)
      return {
        mode: 'loading',
        label: t('update.verification.itemPending', {
          updateName: 'OSX',
        }),
      };
    else {
      if (osUpdateVerification?.isValid)
        return {
          mode: 'success',
          label: t('update.verification.itemSuccess', {
            updateName: 'OSX',
          }),
        };
      else
        return {
          mode: 'error',
          label: t('update.verification.itemCriticalDecoding.desc'),
        };
    }
  }, [isOSUpdateLoading, osUpdateVerification, t]);

  const pluginUpdate: StatusProps = useMemo(() => {
    if (isPluginUpdateLoading)
      return {
        mode: 'loading',
        label: t('update.verification.itemPending', {
          updateName: pluginType,
        }),
      };
    else {
      if (pluginUpdateVerification?.isValid)
        return {
          mode: 'success',
          label: t('update.verification.itemSuccess', {
            updateName: pluginType,
          }),
        };
      else
        return {
          mode: 'error',
          label: t('update.verification.itemCriticalDecoding.desc'),
          description: t('update.verification.itemCriticalFailed.desc'),
          DetailsButtonLabel: t('update.verification.itemCritical.linkLabel'),
          DetailsButtonSrc: t('update.verification.itemCritical.linkUrl'),
        };
    }
  }, [isPluginUpdateLoading, pluginType, pluginUpdateVerification, t]);

  if (!verifiedUpdateProposal) return null;

  return (
    <Container>
      <Header>
        <Heading1>{t('update.verification.title')}</Heading1>
        <Description
          dangerouslySetInnerHTML={{
            __html: htmlIn(t)('update.verification.desc'),
          }}
        />
      </Header>
      <div>
        <Row>
          <Status {...OSUpdate} />
        </Row>
        <Row>
          <Status {...pluginUpdate} />
        </Row>
      </div>
    </Container>
  );
};

const Container = styled.div.attrs({
  className:
    'md:p-6 py-5 px-4 rounded-xl bg-neutral-0 border border-neutral-100',
})``;

const Header = styled.div.attrs({
  className: 'space-y-3 mb-4',
})``;

const Heading1 = styled.h1.attrs({
  className: 'ft-text-xl font-semibold text-neutral-800 grow',
})``;

const Description = styled.div.attrs({
  className: 'text-neutral-800 text-sm md:text-base leading-normal',
})``;

export const Row = styled.div.attrs({
  className:
    'py-2 md:py-4 xl:space-x-4 border-t border-neutral-100 ft-text-base flex items-center justify-between',
})``;
