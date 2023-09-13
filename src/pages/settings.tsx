import {
  AlertInline,
  AvatarDao,
  ButtonText,
  Dropdown,
  IconChevronDown,
  IconChevronUp,
  IconGovernance,
  IconLinkExternal,
  Link,
  Tag,
} from '@aragon/ods';
import {DaoDetails} from '@aragon/sdk-client';
import React, {useEffect, useRef, useState} from 'react';
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
  SettingsCard,
  Term,
} from 'containers/settings/settingsCard';
import {SettingsUpdateCard} from 'containers/settings/updateCard';
import {VersionInfoCard} from 'containers/settings/versionInfoCard';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA} from 'utils/constants';
import {featureFlags} from 'utils/featureFlags';
import {shortenAddress, toDisplayEns} from 'utils/library';
import {EditSettings} from 'utils/paths';

export const Settings: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {isDesktop} = useScreen();

  // move into components when proper loading experience is implemented
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (!daoDetails) {
    return null;
  }

  const daoUpdateEnabled =
    featureFlags.getValue('VITE_FEATURE_FLAG_OSX_UPDATES') === 'true';

  return (
    <SettingsWrapper>
      {daoUpdateEnabled && (
        <div className={`mt-0.5 desktop:mt-1.5 ${styles.fullWidth}`}>
          <SettingsUpdateCard />
        </div>
      )}

      {/* DAO Settings */}
      <div
        className={`desktop:row-start-3 mt-1 desktop:-mt-1 ${
          daoUpdateEnabled ? styles.leftCol : styles.center
        }`}
      >
        <div className="flex flex-col gap-y-3">
          {/* DAO SECTION */}
          <SettingsCardDao daoDetails={daoDetails} />

          {/* COMMUNITY SECTION */}
          <PluginSettingsWrapper daoDetails={daoDetails} />
        </div>
      </div>

      {/* Version Info */}
      {daoUpdateEnabled && (
        <VersionInfoCard
          pluginAddress={daoDetails.plugins[0].instanceAddress}
        />
      )}

      {/* Edit */}
      <div
        className={`desktop:row-start-4 ${
          daoUpdateEnabled ? styles.fullWidth : styles.center
        }`}
      >
        <div className="mt-1 desktop:-mt-1 space-y-2">
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
const styles = {
  fullWidth:
    'col-span-full desktop:col-start-2 desktop:col-end-12 desktop:col-span-6',
  leftCol: 'col-span-full desktop:col-start-2 desktop:col-end-8',
  center:
    'col-span-full desktop:col-start-4 desktop:col-end-10 desktop:col-span-6',
};

const DEFAULT_LINES_SHOWN = 3;
const SettingsCardDao: React.FC<{daoDetails: DaoDetails}> = ({daoDetails}) => {
  const {t} = useTranslation();
  const {network, isL2Network} = useNetwork();

  const summaryRef = useRef<HTMLParagraphElement>(null);

  const [showAll, setShowAll] = useState(true);
  const [shouldClamp, setShouldClamp] = useState(false);

  const explorerLink =
    CHAIN_METADATA[network].explorer + 'address/' + daoDetails.address;

  const chainLabel = CHAIN_METADATA[network].name;
  const resourceLinksIncluded = daoDetails.metadata.links.length !== 0;

  // this should be extracted into a hook if clamping/showing elsewhere
  useEffect(() => {
    function countNumberOfLines() {
      const descriptionEl = summaryRef.current;

      if (!descriptionEl) {
        return;
      }

      const numberOfLines =
        descriptionEl.offsetHeight /
        parseFloat(getComputedStyle(descriptionEl).lineHeight);

      setShouldClamp(numberOfLines > DEFAULT_LINES_SHOWN);
      setShowAll(numberOfLines <= DEFAULT_LINES_SHOWN);
    }

    countNumberOfLines();
    window.addEventListener('resize', countNumberOfLines);

    return () => {
      window.removeEventListener('resize', countNumberOfLines);
    };
  }, []);

  return (
    <SettingsCard title={t('labels.review.daoMetadata')}>
      <DescriptionPair>
        <Term>{t('labels.daoName')}</Term>
        <Definition>
          <div className="flex items-center space-x-1.5 desktop:space-x-2">
            <p className="desktop:font-semibold ft-text-base">
              {daoDetails.metadata.name}
            </p>
            <AvatarDao
              size="small"
              daoName={daoDetails.metadata.name}
              src={daoDetails.metadata.avatar}
            />
          </div>
        </Definition>
      </DescriptionPair>

      <DescriptionPair>
        <Term>{t('labels.review.blockchain')}</Term>
        <Definition>
          <div className="flex flex-wrap flex-1 gap-y-1 justify-between">
            <p className="flex-shrink-0 desktop:font-semibold ft-text-base">
              {chainLabel}
            </p>
            <Tag label={t('labels.notChangeable')} colorScheme="neutral" />
          </div>
        </Definition>
      </DescriptionPair>

      <DescriptionPair>
        <Term>
          {isL2Network ? t('settings.dao.contractAddress') : t('labels.ens')}
        </Term>
        <Definition>
          <div className="flex flex-wrap flex-1 gap-y-1 justify-between items-start">
            <Link
              {...(isL2Network
                ? {label: shortenAddress(daoDetails.address)}
                : {
                    label: toDisplayEns(daoDetails.ensDomain),
                    description: shortenAddress(daoDetails.address),
                  })}
              type="primary"
              className="flex-shrink-0"
              href={explorerLink}
              iconRight={<IconLinkExternal />}
            />
            <Tag label={t('labels.notChangeable')} colorScheme="neutral" />
          </div>
        </Definition>
      </DescriptionPair>

      <DescriptionPair className={resourceLinksIncluded ? '' : 'border-none'}>
        <Term>{t('labels.summary')}</Term>
        <Definition className="flex flex-col gap-y-1">
          <Summary ref={summaryRef} {...{fullDescription: showAll}}>
            {daoDetails.metadata.description}
          </Summary>
          {shouldClamp && (
            <Link
              {...(showAll
                ? {label: 'View less', iconRight: <IconChevronUp />}
                : {label: 'Read more', iconRight: <IconChevronDown />})}
              className="ft-text-base"
              onClick={() => setShowAll(prevState => !prevState)}
            />
          )}
        </Definition>
      </DescriptionPair>

      {resourceLinksIncluded && (
        <DescriptionPair className="border-none">
          <Term>{t('labels.links')}</Term>
          <Definition>
            <div className="flex relative flex-col space-y-1.5">
              {daoDetails.metadata.links.slice(0, 3).map(({name, url}) => (
                <Link
                  key={url}
                  label={name}
                  description={url}
                  type="primary"
                  href={url}
                  iconRight={<IconLinkExternal />}
                />
              ))}
              {daoDetails.metadata.links.length > 3 && (
                <Dropdown
                  trigger={
                    <Link
                      label={t('settings.dao.links.allLinks')}
                      type="primary"
                      iconRight={<IconChevronDown />}
                    />
                  }
                  listItems={daoDetails.metadata.links.map(({name, url}) => ({
                    component: (
                      <div className="mb-1.5">
                        <Link
                          label={name}
                          description={url}
                          type="primary"
                          href={url}
                          iconRight={<IconLinkExternal />}
                        />
                      </div>
                    ),
                  }))}
                />
              )}
            </div>
          </Definition>
        </DescriptionPair>
      )}
    </SettingsCard>
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

type DescriptionProps = {
  fullDescription?: boolean;
};

const Summary = styled.p.attrs({
  className: 'font-normal text-ui-600 ft-text-base',
})<DescriptionProps>`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${props =>
    props.fullDescription ? 'unset' : DEFAULT_LINES_SHOWN};
`;
