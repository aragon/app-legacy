import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useIsUpdateProposal} from 'hooks/useIsUpdateProposal';
import {useUpdateVerification} from 'hooks/useUpdateVerification';
import {htmlIn} from 'utils/htmlIn';
import {Status, StatusProps} from './status';

export interface UpdateVerificationCardProps {
  proposalId?: string;
}

export const UpdateVerificationCard: React.FC<UpdateVerificationCardProps> = ({
  proposalId,
}) => {
  const {t} = useTranslation();
  const [{data: isPluginUpdate}, {data: isOSUpdate}] = useIsUpdateProposal(
    proposalId as string
  );

  const {data: daoDetails} = useDaoDetailsQuery();

  const pluginType =
    daoDetails?.plugins[0].id === 'token-voting.plugin.dao.eth'
      ? 'token voting'
      : 'multisig';

  const [
    {data: pluginUpdateVerification, isLoading: isPluginUpdateLoading},
    {data: osUpdateVerification, isLoading: isOSUpdateLoading},
  ] = useUpdateVerification(proposalId as string, isPluginUpdate, isOSUpdate);

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
          description: t('update.verification.itemCriticalFailed.desc'),
          DetailsButtonLabel: t('update.verification.itemCritical.linkLabel'),
          DetailsButtonSrc: t('update.verification.itemCritical.linkURL'),
          ErrorList: [
            ...(osUpdateVerification?.actionErrorCauses || []),
            ...(osUpdateVerification?.proposalSettingsErrorCauses || []),
          ].flat(),
        };
    }
  }, [
    isOSUpdateLoading,
    osUpdateVerification?.actionErrorCauses,
    osUpdateVerification?.isValid,
    osUpdateVerification?.proposalSettingsErrorCauses,
    t,
  ]);

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
          DetailsButtonSrc: t('update.verification.itemCritical.linkURL'),
          ErrorList: [
            ...(pluginUpdateVerification?.actionErrorCauses || []),
            ...(pluginUpdateVerification?.proposalSettingsErrorCauses || []),
          ].flat(),
        };
    }
  }, [isPluginUpdateLoading, pluginType, pluginUpdateVerification, t]);

  if (!isPluginUpdate && !isOSUpdate) return null;

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
        {isOSUpdate && (
          <Row>
            <Status {...OSUpdate} />
          </Row>
        )}
        {isPluginUpdate && (
          <Row>
            <Status {...pluginUpdate} />
          </Row>
        )}
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
    'py-2 md:py-4 xl:space-x-4 border-t border-neutral-100 ft-text-base flex items-center justify-between overflow-auto',
})``;
