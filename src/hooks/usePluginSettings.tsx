import {
  MultisigClient,
  MultisigVotingSettings,
  TokenVotingClient,
  VotingSettings,
} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';

import {SupportedVotingSettings} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';

// type guards
export function isTokenVotingSettings(
  settings: SupportedVotingSettings | undefined | null
): settings is VotingSettings {
  return settings ? 'minDuration' in settings : false;
}

export function isMultisigVotingSettings(
  settings: SupportedVotingSettings | undefined | null
): settings is MultisigVotingSettings {
  return settings ? 'minApprovals' in settings : false;
}

type FetchVotingSettingsParams = {
  pluginAddress: string;
  blockNumber?: number;
};

type UseFetchVotingSettingsParams = FetchVotingSettingsParams & {
  pluginType: PluginTypes;
};

async function fetchVotingSettings(
  {pluginAddress, blockNumber}: FetchVotingSettingsParams,
  client: TokenVotingClient | MultisigClient | undefined
): Promise<SupportedVotingSettings | null> {
  if (!pluginAddress)
    return Promise.reject(new Error('pluginAddress must be defined'));

  if (!client) return Promise.reject(new Error('client must be defined'));

  const data = await client.methods.getVotingSettings(
    pluginAddress,
    blockNumber
  );

  return data;
}

export function useVotingSettings(
  params: UseFetchVotingSettingsParams,
  options: UseQueryOptions<SupportedVotingSettings | null> = {}
) {
  const client = usePluginClient(params.pluginType);

  if (client == null || !params.pluginAddress || !params.pluginType) {
    options.enabled = false;
  }

  return useQuery({
    queryKey: ['VOTE_SETTINGS', params],
    queryFn: () => fetchVotingSettings(params, client),
    ...options,
  });
}
