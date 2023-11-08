import {IReleaseNote} from 'services/aragon-sdk/domain/release-note';
import {VersionTag} from '@aragon/sdk-client-common';
import {OsSelectedVersion, PluginSelectedVersion} from './types';

export interface IGetReleaseNotesParams {
  releases?: IReleaseNote[];
  update?: OsSelectedVersion | PluginSelectedVersion;
}

class OsxUpdates {
  latestRelease = '1.3.0';

  getProtocolUpdateLabel = (
    version?: string | [number, number, number]
  ): string | undefined => {
    const processedVersion = Array.isArray(version)
      ? version.join('.')
      : version;

    return processedVersion ? `Aragon OSx v${version}` : undefined;
  };

  getPluginVersion = (version?: VersionTag): string | undefined => {
    const {release, build} = version ?? {};

    return release ? `${release}.${build}` : undefined;
  };

  getPluginUpdateLabel = (version?: VersionTag): string | undefined => {
    const pluginVersion = this.getPluginVersion(version);

    return pluginVersion ? `Token voting v${pluginVersion}` : undefined;
  };

  getReleaseNotes = ({
    releases,
    update,
  }: IGetReleaseNotesParams): IReleaseNote | undefined => {
    if (update == null) {
      return undefined;
    }

    const isPluginUpdate = 'isPrepared' in update;
    const updateVersion = isPluginUpdate
      ? this.getPluginUpdateLabel(update.version)!
      : update.version;

    const releaseNotes = releases?.find(release =>
      release.tag_name.includes(
        isPluginUpdate ? this.latestRelease : updateVersion
      )
    );

    return releaseNotes;
  };
}

export const osxUpdates = new OsxUpdates();
