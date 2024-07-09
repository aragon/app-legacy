import {IReleaseNote} from 'services/aragon-sdk/domain/release-note';
import {VersionTag} from '@aragon/sdk-client-common';
import {normalizeVersion} from './library';

export interface IGetReleaseNotesParams {
  releases?: IReleaseNote[];
  version?: string | VersionTag;
  isPlugin?: boolean;
}

class OsxUpdates {
  latestRelease = '1.3.0';

  getProtocolUpdateLabel = (
    version?: string | [number, number, number]
  ): string | undefined => {
    const processedVersion = Array.isArray(version)
      ? version.join('.')
      : version;

    return processedVersion
      ? `Aragon OSx v${normalizeVersion(processedVersion)}`
      : undefined;
  };

  getPluginVersion = (version?: VersionTag): string | undefined => {
    const {release, build} = version ?? {};

    return release ? `${release}.${build}` : undefined;
  };

  getPluginUpdateLabel = (
    version?: VersionTag,
    pluginUpdateTypeLabel?: string
  ): string | undefined => {
    const pluginVersion = this.getPluginVersion(version);

    return pluginVersion
      ? `${pluginUpdateTypeLabel} v${pluginVersion}`
      : undefined;
  };

  getReleaseNotes = ({
    releases,
    version,
    isPlugin,
  }: IGetReleaseNotesParams): IReleaseNote | undefined => {
    if (version == null) {
      return undefined;
    }

    const processedVersion =
      typeof version === 'string' ? version : this.getPluginVersion(version)!;

    const releaseNotes = releases?.find(release =>
      release.tag_name.includes(
        isPlugin ? this.latestRelease : processedVersion
      )
    );

    return releaseNotes;
  };
}

export const osxUpdates = new OsxUpdates();
