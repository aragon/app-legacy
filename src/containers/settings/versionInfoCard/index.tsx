import {IconLinkExternal, Link} from '@aragon/ods-old';
import {
  LIVE_CONTRACTS,
  SupportedVersion,
  SupportedNetworksArray,
} from '@aragon/sdk-client-common';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {useNetwork} from 'context/network';
import {AppVersion, CHAIN_METADATA} from 'utils/constants';
import {shortenAddress, translateToNetworkishName} from 'utils/library';
import {
  DescriptionPair,
  FlexibleDefinition,
  SettingsCard,
  Term,
} from '../settingsCard';
import {useProtocolVersion} from 'services/aragon-sdk/queries/use-protocol-version';

export const VersionInfoCard: React.FC<{
  pluginAddress: string;
  pluginVersion: string;
  daoAddress: string;
}> = ({pluginAddress, pluginVersion, daoAddress}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: versions, isLoading} = useProtocolVersion(daoAddress);

  const explorerEndpoint = CHAIN_METADATA[network].explorer + 'address/';

  let OSxAddress = '';
  const translatedNetwork = translateToNetworkishName(network);
  if (
    translatedNetwork !== 'unsupported' &&
    SupportedNetworksArray.includes(translatedNetwork)
  ) {
    OSxAddress =
      LIVE_CONTRACTS[versions?.join('.') as SupportedVersion]?.[
        translatedNetwork
      ]?.daoFactoryAddress;
  }

  // TODO: generate the links
  return (
    <div
      className={
        'col-span-full mt-2 xl:col-span-4 xl:col-start-8 xl:row-start-3 xl:-ml-2 xl:-mt-2'
      }
    >
      <SettingsCard title={t('setting.versionInfo.title')}>
        <DescriptionPair>
          <Term>{t('setting.versionInfo.labelApp')}</Term>
          <FlexibleDefinition>
            <Link
              label={`Aragon App v${AppVersion}`}
              type="primary"
              iconRight={<IconLinkExternal />}
              href={'https://app.aragon.org'}
            />
          </FlexibleDefinition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('setting.versionInfo.labelOs')}</Term>
          <FlexibleDefinition>
            <Link
              label={
                !isLoading ? `Aragon OSx v${versions?.join('.')}` : 'Loading...'
              }
              description={OSxAddress ? shortenAddress(OSxAddress) : undefined}
              type="primary"
              href={explorerEndpoint + OSxAddress}
              iconRight={<IconLinkExternal />}
            />
          </FlexibleDefinition>
        </DescriptionPair>

        <DescriptionPair className="border-none">
          <Term>{t('setting.versionInfo.labelGovernance')}</Term>
          <FlexibleDefinition>
            <Link
              label={`Token voting v${pluginVersion}`}
              description={shortenAddress(pluginAddress)}
              type="primary"
              href={explorerEndpoint + pluginAddress}
              iconRight={<IconLinkExternal />}
            />
          </FlexibleDefinition>
        </DescriptionPair>
      </SettingsCard>
    </div>
  );
};
