import React from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from '@aragon/ods-old';
import {IconType} from '@aragon/ods';
import {
  SupportedNetworks,
  SupportedVersions,
  getNetworkDeployments,
} from '@aragon/osx-commons-configs';

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
import {GaslessPluginName, PluginTypes} from 'hooks/usePluginClient';

export const VersionInfoCard: React.FC<{
  pluginAddress: string;
  pluginVersion: string;
  daoAddress: string;
  pluginType: PluginTypes;
}> = ({pluginAddress, pluginVersion, pluginType, daoAddress}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const {data: versions, isLoading} = useProtocolVersion(daoAddress);

  const explorerEndpoint = CHAIN_METADATA[network].explorer + 'address/';

  let OSxAddress = '';
  const translatedNetwork = translateToNetworkishName(network);
  const currentVersion = `v${versions?.join('.')}` as SupportedVersions;
  if (
    translatedNetwork !== 'unsupported' &&
    Object.values(SupportedNetworks).includes(translatedNetwork) &&
    Object.values(SupportedVersions).includes(currentVersion)
  ) {
    OSxAddress =
      getNetworkDeployments(translatedNetwork)[currentVersion]?.DAOFactory
        .address ?? '';
  }

  let pluginName = '';

  switch (pluginType) {
    case 'multisig.plugin.dao.eth':
      pluginName = 'Multisig';
      break;
    case 'token-voting.plugin.dao.eth':
      pluginName = 'Token Voting';
      break;
    case GaslessPluginName:
      pluginName = 'Vocdoni Gasless Voting';
      break;
    default:
      pluginName = 'Unknown plugin';
  }

  return (
    <div
      className={
        'col-span-full mt-2 xl:col-span-4 xl:col-start-8 xl:row-start-3 xl:-ml-2 xl:-mt-2'
      }
    >
      <SettingsCard title={t('setting.versionInfo.title')}>
        <DescriptionPair>
          <Term>{t('setting.versionInfo.labelApp')}</Term>
          <FlexibleDefinition className="truncate max-w-60">
            <Link
              label={`Aragon App v${AppVersion}`}
              type="primary"
              iconRight={IconType.LINK_EXTERNAL}
              href={'https://app.aragon.org'}
            />
          </FlexibleDefinition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('setting.versionInfo.labelOs')}</Term>
          <FlexibleDefinition className="truncate max-w-60">
            <Link
              label={
                !isLoading ? `Aragon OSx v${versions?.join('.')}` : 'Loading...'
              }
              description={OSxAddress ? shortenAddress(OSxAddress) : undefined}
              type="primary"
              href={explorerEndpoint + OSxAddress}
              iconRight={IconType.LINK_EXTERNAL}
            />
          </FlexibleDefinition>
        </DescriptionPair>

        <DescriptionPair className="border-none">
          <Term>{t('setting.versionInfo.labelGovernance')}</Term>
          <FlexibleDefinition className="truncate max-w-60">
            <Link
              label={`${pluginName} v${pluginVersion}`}
              description={shortenAddress(pluginAddress)}
              type="primary"
              href={explorerEndpoint + pluginAddress}
              iconRight={IconType.LINK_EXTERNAL}
            />
          </FlexibleDefinition>
        </DescriptionPair>
      </SettingsCard>
    </div>
  );
};
