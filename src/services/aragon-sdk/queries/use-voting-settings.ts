import {VotingSettings, MultisigVotingSettings} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';

import {SupportedVotingSettings} from 'utils/types';
import {IFetchVotingSettingsParams} from '../aragon-sdk-service.api';
import {
  PluginClient,
  isGaslessVotingClient,
  usePluginClient,
} from 'hooks/usePluginClient';
import {aragonSdkQueryKeys} from '../query-keys';
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';
import request, {gql} from 'graphql-request';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PermissionIds} from '@aragon/sdk-client';
import {SUBGRAPH_API_URL, SupportedNetworks} from 'utils/constants';
import {useNetwork} from 'context/network';

async function fetchVotingSettingsAsync(
  {pluginAddress, blockNumber}: IFetchVotingSettingsParams,
  client: PluginClient | undefined,
  daoAddress: string | undefined,
  network: SupportedNetworks
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

  if (
    data &&
    isGaslessVotingSettings(data) &&
    data.daoTokenAddress &&
    isGaslessVotingClient(client) &&
    daoAddress &&
    SUBGRAPH_API_URL[network]
  ) {
    const subgraphUrl = SUBGRAPH_API_URL[network];
    const mintable = await fetchisMintable(
      daoAddress,
      PermissionIds.MINT_PERMISSION_ID,
      subgraphUrl!
    );
    data.hasGovernanceEnabled = data.hasGovernanceEnabled && mintable;
  }
  return data;
}

const hasPermissionQuery = gql`
  query HasPermission($where: Permission_filter!) {
    permissions(where: $where) {
      id
    }
  }
`;

const fetchisMintable = async (
  daoAddress: string,
  permissionId: string,
  subgraphUrl: string
): Promise<boolean> => {
  const params = {
    where: {
      dao: daoAddress.toLowerCase(),
      permissionId,
    },
  };

  const {permissions: data} = await request(
    subgraphUrl,
    hasPermissionQuery,
    params
  );
  if (data.error || data == null || data.length === 0) {
    return false;
  }
  return true;
};

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

export function isGaslessVotingSettings(
  settings: SupportedVotingSettings | undefined | null
): settings is GaslessPluginVotingSettings {
  return settings ? 'onlyExecutionMultisigProposalCreation' in settings : false;
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
  options: Omit<
    UseQueryOptions<SupportedVotingSettings | null>,
    'queryKey'
  > = {}
) {
  const {data: daoDetails} = useDaoDetailsQuery();
  const client = usePluginClient(params.pluginType);
  const {network} = useNetwork();

  if (!client || !params.pluginAddress) {
    options.enabled = false;
  }

  return useQuery({
    queryKey: aragonSdkQueryKeys.votingSettings(params),
    queryFn: () =>
      fetchVotingSettingsAsync(params, client, daoDetails?.address, network),
    ...options,
  });
}
