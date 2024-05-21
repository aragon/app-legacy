import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {GaslessPluginName, usePluginClient} from 'hooks/usePluginClient';
import {aragonSdkQueryKeys} from '../query-keys';
import request, {gql} from 'graphql-request';
import {SUBGRAPH_API_URL} from 'utils/constants';
import {PermissionIds} from '@aragon/sdk-client';

import {useNetwork} from 'context/network';
import {IFetchIsmintableParams} from '../aragon-sdk-service.api';

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
 * Custom hook to get voting settings using the specified parameters and options.
 *
 * @param params - Parameters required to fetch voting settings.
 * @param options - Options for the query.
 * @returns Query object with data, error, and status.
 */
export function useIsMintable(
  params: IFetchIsmintableParams,
  options: Omit<UseQueryOptions<Boolean | null>, 'queryKey'> = {}
) {
  const client = usePluginClient(params.pluginType);
  const {network} = useNetwork();

  if (
    !client ||
    !params.daoAddress ||
    params.pluginType !== GaslessPluginName
  ) {
    options.enabled = false;
  }

  const subgraphUrl = SUBGRAPH_API_URL[network];
  return useQuery({
    queryKey: aragonSdkQueryKeys.isMintable(params),
    queryFn: () =>
      fetchisMintable(
        params.daoAddress,
        PermissionIds.MINT_PERMISSION_ID,
        subgraphUrl!
      ),
    ...options,
  });
}
