import {
  AlertInline,
  AvatarDao,
  ButtonText,
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
import {featureFlags} from 'utils/featureFlags';
import {shortenAddress, toDisplayEns} from 'utils/library';
import {EditSettings} from 'utils/paths';

export const Settings: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();
  const {isDesktop} = useScreen();

  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (!daoDetails) {
    return null;
  }

  const explorerLink =
    CHAIN_METADATA[network].explorer + 'address/' + daoDetails.address;

  const displayUpdateInfo =
    featureFlags.getValue('VITE_FEATURE_FLAG_DAO_UPDATE') === 'true';

  return (
    <SettingsWrapper>
      {displayUpdateInfo && (
        <div className="col-span-full desktop:col-start-2 desktop:col-end-12 mt-0.5 desktop:mt-1.5">
          <SettingsUpdateCard />
        </div>
      )}

      {/* DAO Settings */}
      <div className="col-span-full desktop:col-span-6 desktop:col-start-2 desktop:row-start-3 mt-1 desktop:-mt-1">
        <div className="flex flex-col gap-y-3">
          {/* DAO SECTION */}
          <SettingsCardDao
            daoDetails={daoDetails}
            explorerLink={explorerLink}
          />

          {/* COMMUNITY SECTION */}
          <PluginSettingsWrapper daoDetails={daoDetails} />
        </div>
      </div>

      {/* Version Info */}
      <div className="col-span-full desktop:col-span-4 desktop:col-start-8 desktop:row-start-3 mt-1 desktop:-mt-1 desktop:-ml-1">
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

      {/* Edit */}
      <div className="col-span-full desktop:col-start-2 desktop:col-end-12 desktop:row-start-4">
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

const DEFAULT_SUMMARY_LINES_SHOWN = 3;
const SettingsCardDao: React.FC<{
  daoDetails: DaoDetails;
  explorerLink: string;
}> = ({daoDetails, explorerLink}) => {
  const {t} = useTranslation();
  const {network, isL2Network} = useNetwork();

  const summaryRef = useRef<HTMLParagraphElement>(null);

  const [showAll, setShowAll] = useState(true);
  const [shouldClamp, setShouldClamp] = useState(false);

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

      setShouldClamp(numberOfLines > DEFAULT_SUMMARY_LINES_SHOWN);
      setShowAll(numberOfLines <= DEFAULT_SUMMARY_LINES_SHOWN);
    }

    countNumberOfLines();
    window.addEventListener('resize', countNumberOfLines);

    return () => {
      window.removeEventListener('resize', countNumberOfLines);
    };
  }, []);

  return (
    <SettingsCard title="DAO">
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
          <div className="flex flex-1 justify-between">
            <p className="desktop:font-semibold ft-text-base">{chainLabel}</p>
            <Tag label={t('labels.notChangeable')} colorScheme="neutral" />
          </div>
        </Definition>
      </DescriptionPair>

      <DescriptionPair>
        <Term>{isL2Network ? 'Contract address' : t('labels.ens')}</Term>
        <Definition>
          <Link
            label={
              isL2Network
                ? shortenAddress(daoDetails.address)
                : toDisplayEns(daoDetails.ensDomain)
            }
            // TODO: add description description={shortenAddress(daoDetails.address)}
            type="primary"
            href={explorerLink}
            iconRight={<IconLinkExternal />}
          />
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
            <div className="space-y-1.5">
              {daoDetails.metadata.links.map(({name, url}) => (
                <div key={url}>
                  <Link
                    label={name}
                    // description={url}
                    // TODO add description
                    type="primary"
                    href={url}
                    iconRight={<IconLinkExternal />}
                  />
                </div>
              ))}
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
    props.fullDescription ? 'unset' : DEFAULT_SUMMARY_LINES_SHOWN};
`;
