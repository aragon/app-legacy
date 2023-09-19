import {Client} from '@aragon/sdk-client';
import {useQuery} from '@tanstack/react-query';
import {useClient} from './useClient';

// fetch transfers from Subgraph
async function fetchProtocolVersions(
  client: Client | undefined,
  daoAddressOrEns: string
) {
  return client
    ? client.methods.getProtocolVersion(daoAddressOrEns)
    : Promise.reject(new Error('Client not defined'));
}

/**
 * Verify a smart contract on Etherscan using a custom React hook
 * @param client - The client to use for the request.
 * @param daoAddressOrEns - The DAO address or ENS name to fetch data for.
 * @returns the protocol versions for the DAO.
 */
export const useProtocolVersions = (daoAddressOrEns: string | undefined) => {
  const {client} = useClient();
  return useQuery({
    queryKey: ['protocolVersions', daoAddressOrEns],
    queryFn: () => fetchProtocolVersions(client, daoAddressOrEns as string),
    enabled: Boolean(daoAddressOrEns),
  });
};
