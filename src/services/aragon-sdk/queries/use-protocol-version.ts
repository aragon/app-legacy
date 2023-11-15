import {Client} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';

import {useClient} from 'hooks/useClient';
import {invariant} from 'utils/invariant';
import {aragonSdkQueryKeys} from '../query-keys';

async function fetchProtocolVersion(
  client: Client | undefined,
  daoAddressOrEns: string
): Promise<[number, number, number]> {
  invariant(client != null, 'fetchProtocolVersions: client is not defined');

  const data = await client.methods.getProtocolVersion(daoAddressOrEns);
  return data;
}

/**
 * Get the protocol version for a DAO
 * @param daoAddressOrEns - The DAO address or ENS subdomain
 * @returns the protocol version for the DAO.
 */
export const useProtocolVersion = (
  daoAddressOrEns: string,
  options: UseQueryOptions<[number, number, number]> = {}
) => {
  const {client} = useClient();

  if (!daoAddressOrEns) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.protocolVersion(daoAddressOrEns),
    () => fetchProtocolVersion(client, daoAddressOrEns),
    options
  );
};
