import {
  AlertInline,
  AvatarDao,
  ButtonText,
  IconGovernance,
  IconLinkExternal,
  Link,
  Tag,
} from '@aragon/ods';
import {DaoDetails} from '@aragon/sdk-client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import MajorityVotingSettings from 'containers/settings/majorityVoting';
import MultisigSettings from 'containers/settings/multisig';
import {
  Definition,
  DescriptionPair,
  FlexibleDefinition,
  SettingsCard,
  Term,
} from 'containers/settingsCard';
import {SettingsUpdateCard} from 'containers/settingsUpdatedCard';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {EditSettings} from 'utils/paths';

export const Settings: React.FC = () => {
  const {t} = useTranslation();
  const {network, isL2Network} = useNetwork();
  const navigate = useNavigate();
  const {isDesktop} = useScreen();

  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  const networkInfo = CHAIN_METADATA[network];
  const chainLabel = networkInfo.name;

  if (isLoading) {
    return <Loading />;
  }

  if (!daoDetails) {
    return null;
  }

  const explorerLink =
    CHAIN_METADATA[network].explorer + 'address/' + daoDetails.address;

  return (
    <SettingsWrapper>
      <div className="col-span-full desktop:col-start-2 desktop:col-end-12 mt-2">
        <SettingsUpdateCard />
      </div>

      <div className="col-span-full desktop:col-span-6 desktop:col-start-2">
        <div className="flex flex-col gap-y-3">
          {/* DAO SECTION */}
          <SettingsCard title="DAO">
            <DescriptionPair>
              <Term>{t('labels.daoName')}</Term>
              <Definition className="items-center space-x-2">
                <span>{daoDetails.metadata.name}</span>
                <AvatarDao
                  size="small"
                  daoName={daoDetails.metadata.name}
                  src={daoDetails.metadata?.avatar}
                />
              </Definition>
            </DescriptionPair>

            <DescriptionPair>
              <Term>{t('labels.review.blockchain')}</Term>
              <Definition className="justify-between items-center">
                <span>{chainLabel}</span>
                <Tag label={t('labels.notChangeable')} colorScheme="neutral" />
              </Definition>
            </DescriptionPair>

            {!isL2Network && (
              <DescriptionPair>
                <Term>{t('labels.ens')}</Term>
                <Definition className="justify-between items-center">
                  <Link
                    label={toDisplayEns(daoDetails.ensDomain)}
                    // description={shortenAddress(daoDetails.address)}
                    type="primary"
                    href={explorerLink}
                    iconRight={<IconLinkExternal />}
                  />
                </Definition>
              </DescriptionPair>
            )}

            <DescriptionPair className="border-none">
              <Term>{t('labels.summary')}</Term>
              <Definition>{daoDetails.metadata.description}</Definition>
            </DescriptionPair>
          </SettingsCard>

          {/* COMMUNITY SECTION */}
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
      </div>
      <div className="col-span-full desktop:col-start-8 desktop:col-end-12">
        <SettingsCard title="Version info">
          <DescriptionPair>
            <Term>App</Term>
            <FlexibleDefinition>
              <Link
                label={'Aragon App v0.1.29'}
                // TODO: add description
                type="primary"
                href={explorerLink}
                iconRight={<IconLinkExternal />}
              />
            </FlexibleDefinition>
          </DescriptionPair>
          <DescriptionPair>
            <Term>Operating System</Term>
            <FlexibleDefinition>
              <Link
                label={'Aragon OSx v1.1.23'}
                // TODO: add description
                type="primary"
                href={explorerLink}
                iconRight={<IconLinkExternal />}
              />
            </FlexibleDefinition>
          </DescriptionPair>

          <DescriptionPair className="border-none">
            <Term>Governance</Term>
            <FlexibleDefinition>
              <Link
                label={'Token voting v1.12'}
                // TODO add description
                type="primary"
                href={explorerLink}
                iconRight={<IconLinkExternal />}
              />
            </FlexibleDefinition>
          </DescriptionPair>
        </SettingsCard>
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
      customBody={<>{children}</>}
    />
  );
};

export const Layout = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-4 desktop:col-end-10 text-ui-600 desktop:mt-2',
})``;
