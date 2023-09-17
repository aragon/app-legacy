import {IconLinkExternal, Link} from '@aragon/ods';
import {
  LIVE_CONTRACTS,
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
import {useProtocolVersions} from 'hooks/useDaoVersions';

export const VersionInfoCard: React.FC<{
  pluginAddress: string;
  pluginVersion: string;
  daoAddress: string;
}> = ({pluginAddress, pluginVersion, daoAddress}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: versions, isLoading} = useProtocolVersions(daoAddress);

  const explorerEndpoint = CHAIN_METADATA[network].explorer + 'address/';

  let OSxAddress = '';
  const translatedNetwork = translateToNetworkishName(network);
  if (
    translatedNetwork !== 'unsupported' &&
    SupportedNetworksArray.includes(translatedNetwork)
  ) {
    OSxAddress = LIVE_CONTRACTS[translatedNetwork].daoFactoryAddress;
  }

  // TODO: generate the links
  return (
    <div
      className={
        'col-span-full desktop:col-span-4 desktop:col-start-8 desktop:row-start-3 mt-1 desktop:-mt-1 desktop:-ml-1'
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
            />
          </FlexibleDefinition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('setting.versionInfo.labelOs')}</Term>
          <FlexibleDefinition>
            <Link
              label={
                !isLoading
                  ? `Aragon OSx v${versions?.[0]}.${versions?.[1]}.${versions?.[2]}`
                  : 'Loading...'
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
