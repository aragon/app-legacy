import {
  TokenVotingClient,
  MultisigClient,
  VotingSettings,
  MultisigVotingSettings,
} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';

import {SupportedVotingSettings} from 'utils/types';
import {IFetchVotingSettingsParams} from '../aragon-sdk-service.api';
import {usePluginClient} from 'hooks/usePluginClient';
import {aragonSdkQueryKeys} from '../query-keys';

async function fetchVotingSettings(
  {pluginAddress, blockNumber}: IFetchVotingSettingsParams,
  client: TokenVotingClient | MultisigClient | undefined
): Promise<SupportedVotingSettings | null> {
  if (!pluginAddress)
    return Promise.reject(
      new Error('fetchVotingSettings: pluginAddress must be defined')
    );

  if (!client)
    return Promise.reject(
      new Error('fetchVotingSettings: client must be defined')
    );

  const data = await client.methods.getVotingSettings(
    pluginAddress,
    blockNumber
  );

  return data;
}

/**
 * Type guard to determine if the settings are of type VotingSettings.
 *
 * @param settings - Voting settings to check.
 * @returns Boolean indicating whether settings are of type VotingSettings.
 */
export function isTokenVotingSettings(
  settings: SupportedVotingSettings | undefined | null
): settings is VotingSettings {
  return settings ? 'minDuration' in settings : false;
}

/**
 * Type guard to determine if the settings are of type MultisigVotingSettings.
 *
 * @param settings - Voting settings to check.
 * @returns Boolean indicating whether settings are of type MultisigVotingSettings.
 */
export function isMultisigVotingSettings(
  settings: SupportedVotingSettings | undefined | null
): settings is MultisigVotingSettings {
  return settings ? 'minApprovals' in settings : false;
}

/**
 * Custom hook to get voting settings using the specified parameters and options.
 *
 * @param params - Parameters required to fetch voting settings.
 * @param options - Options for the query.
 * @returns Query object with data, error, and status.
 */
export function useVotingSettings(
  params: IFetchVotingSettingsParams,
  options: UseQueryOptions<SupportedVotingSettings | null> = {}
) {
  const client = usePluginClient(params.pluginType);

  if (!client || !params.pluginAddress) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.votingSettings(params),
    () => fetchVotingSettings(params, client),
    options
  );
}
