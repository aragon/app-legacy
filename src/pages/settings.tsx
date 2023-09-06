import {DaoDetails} from '@aragon/sdk-client';
import {
  AlertInline,
  AvatarDao,
  ButtonText,
  IconChevronRight,
  IconGovernance,
  IconReload,
  Link,
  ListItemLink,
} from '@aragon/ods';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';
import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import MajorityVotingSettings from 'containers/settings/majorityVoting';
import MultisigSettings from 'containers/settings/multisig';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA} from 'utils/constants';
import {EditSettings} from 'utils/paths';

export const Settings: React.FC = () => {
  const {t} = useTranslation();
  const {network, isL2Network} = useNetwork();
  const navigate = useNavigate();
  const {isDesktop} = useScreen();

  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  const networkInfo = CHAIN_METADATA[network];
  const chainLabel = networkInfo.name;
  const networkType = networkInfo.isTestnet
    ? t('labels.testNet')
    : t('labels.mainNet');

  const resourceLinks = daoDetails?.metadata.links?.filter(
    l => l.name && l.url
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SettingsWrapper>
      <div className="flex flex-col gap-y-3">
        <SettingsUpdateCard />

        {/* BLOCKCHAIN SECTION */}
        <DescriptionListContainer
          title={t('labels.review.blockchain')}
          tagLabel={t('labels.notChangeable')}
        >
          <Dl>
            <Dt>{t('labels.review.network')}</Dt>
            <Dd>{networkType}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.blockchain')}</Dt>
            <Dd>{chainLabel}</Dd>
          </Dl>
        </DescriptionListContainer>

        {/* DAO DETAILS SECTION */}
        <DescriptionListContainer title={t('labels.review.daoMetadata')}>
          <Dl>
            <Dt>{t('labels.logo')}</Dt>
            <Dd>
              <AvatarDao
                size={'small'}
                daoName={daoDetails?.metadata.name || ''}
                src={daoDetails?.metadata?.avatar}
              />
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.daoName')}</Dt>
            <Dd>{daoDetails?.metadata.name}</Dd>
          </Dl>
          {!isL2Network && (
            <Dl>
              <Dt>{t('labels.ens')}</Dt>
              <Dd>{daoDetails?.ensDomain}</Dd>
            </Dl>
          )}
          <Dl>
            <Dt>{t('labels.summary')}</Dt>
            <Dd>{daoDetails?.metadata.description}</Dd>
          </Dl>
          {resourceLinks && resourceLinks.length > 0 && (
            <Dl>
              <Dt>{t('labels.links')}</Dt>
              <Dd>
                <div className="space-y-1.5">
                  {resourceLinks.map(({name, url}) => (
                    <ListItemLink label={name} href={url} key={url} />
                  ))}
                </div>
              </Dd>
            </Dl>
          )}
        </DescriptionListContainer>

        {/* Plugins */}
        <PluginSettingsWrapper daoDetails={daoDetails} />

        {/* Edit */}
        <div className="space-y-2">
          <ButtonText
            label={t('settings.edit')}
            className="w-full tablet:w-max"
            size="large"
            iconLeft={!isDesktop ? <IconGovernance /> : undefined}
            onClick={() => navigate('edit')}
          />
          <AlertInline label={t('settings.proposeSettingsInfo')} />
        </div>
      </div>
    </SettingsWrapper>
  );
};

export interface IPluginSettings {
  daoDetails: DaoDetails | undefined | null;
}

const PluginSettingsWrapper: React.FC<IPluginSettings> = ({daoDetails}) => {
  // TODO: Create support for multiple plugin DAO once design is ready.
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  switch (pluginType) {
    case 'token-voting.plugin.dao.eth':
      return <MajorityVotingSettings daoDetails={daoDetails} />;

    case 'multisig.plugin.dao.eth':
      return <MultisigSettings daoDetails={daoDetails} />;

    default:
      // TODO: need to be designed
      return <div>Unsupported Plugin</div>;
  }
};

const SettingsWrapper: React.FC = ({children}) => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();

  const {dao} = useParams();
  const {network} = useNetwork();
  const navigate = useNavigate();

  return (
    <PageWrapper
      title={t('labels.daoSettings')}
      primaryBtnProps={{
        label: t('settings.edit'),
        iconLeft: isMobile ? <IconGovernance /> : undefined,
        onClick: () => navigate(generatePath(EditSettings, {network, dao})),
      }}
      customBody={<Layout>{children}</Layout>}
    />
  );
};

export const Layout = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-4 desktop:col-end-10 text-ui-600 desktop:mt-2',
})``;

const SettingsUpdateCard: React.FC = () => {
  const {isDesktop} = useScreen();

  if (isDesktop) {
    return (
      <Container className="desktop:gap-x-3 desktop:p-3">
        <div className="flex gap-x-6 items-start">
          <div className="flex-1 space-y-1">
            <Head>
              <IconReload />
              <Title>Aragon Updates available</Title>
            </Head>
            <ContentWrapper className="space-y-0">
              <Description>
                Your DAO has received new updates. Review them and create a
                proposal for installing them.
              </Description>
            </ContentWrapper>
          </div>
          <Link
            label="View updates"
            type="secondary"
            iconRight={<IconChevronRight />}
          />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Head>
        <IconReload />
        <Title>Aragon Updates available</Title>
      </Head>
      <ContentWrapper>
        <Description>
          Your DAO has received new updates. Review them and create a proposal
          for installing them.
        </Description>
        <Link
          label="View updates"
          type="secondary"
          iconRight={<IconChevronRight />}
        />
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'gap-x-2 p-2 space-y-1 bg-primary-400 rounded-xl' as string,
})``;

const Head = styled.div.attrs({
  className: 'flex items-center space-x-1.5 font-semibold text-ui-0 ft-text-lg',
})``;

const Title = styled.p.attrs({})``;

const Description = styled.p.attrs({className: 'ft-text-base'})``;

const ContentWrapper = styled.div.attrs({
  className: 'pl-3.5 space-y-1.5 text-primary-50' as string,
})``;
