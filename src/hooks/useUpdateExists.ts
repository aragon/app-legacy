import {SupportedVersion} from '@aragon/sdk-client-common';

import {usePluginVersions} from 'services/aragon-sdk/queries/use-plugin-versions';
import {useProtocolVersion} from 'services/aragon-sdk/queries/use-protocol-version';
import {compareVersions} from 'utils/library';
import {useDaoDetailsQuery} from './useDaoDetails';
import {PluginTypes} from './usePluginClient';

export const useUpdateExists = (): boolean => {
  const {data: daoDetails} = useDaoDetailsQuery();

  const daoAddress = daoDetails?.address as string;
  const installedPlugin = daoDetails?.plugins?.[0];
  const pluginType = installedPlugin?.id as PluginTypes;

  const {data: plugins} = usePluginVersions({pluginType, daoAddress});
  const {data: installedProtocol} = useProtocolVersion(daoAddress);

  // check whether protocol update exists
  const latestProtocolVersion = SupportedVersion.LATEST as string;
  const installedProtocolVersion = installedProtocol?.join('.');

  const protocolUpdateExists = !!(
    installedProtocolVersion &&
    compareVersions(latestProtocolVersion, installedProtocolVersion) === 1
  );

  // check whether plugin update exists
  const latestPlugin = plugins?.current;
  const latestPluginVersion = `${latestPlugin?.release?.number}.${latestPlugin?.build?.number}`;
  const installedPluginVersion = `${installedPlugin?.release}.${installedPlugin?.build}`;

  const pluginUpdateExists = !!(
    latestPlugin &&
    installedPlugin &&
    compareVersions(latestPluginVersion, installedPluginVersion) === 1
  );

  return protocolUpdateExists || pluginUpdateExists;
};
