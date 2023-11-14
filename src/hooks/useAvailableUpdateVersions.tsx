import {useEffect, useState} from 'react';
import {DaoDetails} from '@aragon/sdk-client';
import {SupportedVersion} from '@aragon/sdk-client-common';

import {usePluginAvailableVersions} from './usePluginAvailableVersions';
import {PluginTypes} from './usePluginClient';
import {usePreparedPlugin} from './usePreparedPlugins';
import {useClient} from './useClient';
import {compareVersions} from 'utils/library';
import {OSX} from 'context/update';
import {useProtocolVersions} from './useDaoVersions';

export const useAvailableUpdateVersions = (
  pluginType: PluginTypes,
  daoDetails: DaoDetails
) => {
  const [pluginAvailableVersions, setPluginAvailableVersions] = useState(
    new Map()
  );
  const [osxAvailableVersions, setOsxAvailableVersions] = useState(new Map());

  const {client} = useClient();
  const {data: pluginVersions, isLoading} = usePluginAvailableVersions(
    pluginType,
    daoDetails?.address
  );
  const {data: versions, isLoading: protocolVersionLoading} =
    useProtocolVersions(daoDetails?.address);
  const {data: preparedPluginList, isLoading: preparedPluginLoading} =
    usePreparedPlugin(
      client,
      daoDetails?.plugins?.[0]?.instanceAddress,
      pluginType,
      daoDetails?.address
    );

  useEffect(() => {
    const OSXVersions = new Map();

    Object.keys(SupportedVersion).forEach(key => {
      if (
        compareVersions(
          SupportedVersion[key as keyof typeof SupportedVersion],
          versions?.join('.') as string
        )
      ) {
        OSXVersions.set(
          SupportedVersion[key as keyof typeof SupportedVersion],
          {
            version: SupportedVersion[
              key as keyof typeof SupportedVersion
            ] as string,
            ...(key === 'LATEST' && {isLatest: true}),
          } as OSX
        );
      }
    });

    const plugins = new Map();
    pluginVersions?.releases?.map((release, releaseIndex) => {
      release.builds.sort((a, b) => {
        return a.build > b.build ? 1 : -1;
      });

      release.builds.map((build, buildIndex) => {
        if (
          release.release >= daoDetails!.plugins[0].release &&
          build.build > daoDetails!.plugins[0].build
        )
          plugins.set(`${release.release}.${build.build}`, {
            version: {
              build: build.build,
              release: release.release,
            },
            ...(preparedPluginList?.has(
              `${release.release}.${build.build}`
            ) && {
              isPrepared: true,
              preparedData: {
                ...preparedPluginList.get(`${release.release}.${build.build}`),
              },
            }),
            ...(releaseIndex === pluginVersions?.releases.length - 1 &&
              buildIndex === release.builds.length - 1 && {
                isLatest: true,
              }),
          });
      });
    });

    setOsxAvailableVersions(OSXVersions);
    setPluginAvailableVersions(plugins);
  }, [daoDetails, pluginVersions?.releases, preparedPluginList, versions]);

  return {
    pluginAvailableVersions,
    osxAvailableVersions,
    isLoading: isLoading || preparedPluginLoading || protocolVersionLoading,
  };
};
