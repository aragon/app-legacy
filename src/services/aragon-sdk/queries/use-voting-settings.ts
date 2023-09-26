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

export function useVotingSettings(
  params: IFetchVotingSettingsParams,
  options: UseQueryOptions<SupportedVotingSettings | null> = {}
) {
  const client = usePluginClient(params.pluginType);

  if (client == null || !params.pluginAddress || !params.pluginType) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.votingSettings(params),
    () => fetchVotingSettings(params, client),
    options
  );
}

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
