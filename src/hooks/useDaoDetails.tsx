import {
  Client,
  DaoDetails,
  DaoMetadata,
  InstalledPluginListItem,
} from '@aragon/sdk-client';
import {JsonRpcProvider} from '@ethersproject/providers';
import {useQuery} from '@tanstack/react-query';
import {isAddress} from 'ethers/lib/utils';
import {useCallback, useEffect, useMemo} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {
  CHAIN_METADATA,
  SUBGRAPH_API_URL,
  SupportedNetworks,
} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {NotFound} from 'utils/paths';
import {useClient} from './useClient';
import {resolveIpfsCid} from '@aragon/sdk-client-common';
import request, {gql} from 'graphql-request';
import {SubgraphDao, SubgraphPluginListItem} from 'utils/types';
import {ipfsService} from 'services/ipfs/ipfsService';

export const QueryDao = gql`
  query Dao($address: ID!) {
    dao(id: $address) {
      id
      subdomain
      metadata
      createdAt
      plugins {
        appliedPreparation {
          pluginAddress
        }
        appliedPluginRepo {
          subdomain
        }
        appliedVersion {
          build
          release {
            release
          }
        }
      }
    }
  }
`;

function toDaoDetails(dao: SubgraphDao, metadata: DaoMetadata): DaoDetails {
  return {
    address: dao.id,
    ensDomain: dao.subdomain + '.dao.eth',
    metadata: {
      name: metadata?.name,
      description: metadata?.description,
      avatar: metadata?.avatar || undefined,
      links: metadata?.links,
    },
    metadataHash: dao.metadata,
    creationDate: new Date(parseInt(dao.createdAt) * 1000),
    // filter out plugins that are not applied
    plugins: dao.plugins
      .filter(
        plugin =>
          plugin.appliedPreparation &&
          plugin.appliedVersion &&
          plugin.appliedPluginRepo
      )
      .map(
        (plugin: SubgraphPluginListItem): InstalledPluginListItem => ({
          // we checked with the filter above that these are not null
          id: `${plugin.appliedPluginRepo!.subdomain}.plugin.dao.eth`,
          release: plugin.appliedVersion!.release.release,
          build: plugin.appliedVersion!.build,
          instanceAddress: plugin.appliedPreparation!.pluginAddress,
        })
      ),
  };
}

/**
 * Fetches DAO data for a given DAO address or ENS name using a given client.
 * @param client - The client to use for the request.
 * @param daoAddressOrEns - The DAO address or ENS name to fetch data for.
 * @returns A Promise that resolves to the DAO data.
 * @throws An error if the client is not defined or if the DAO address/ENS name is not defined.
 */
async function fetchDaoDetails(
  client: Client | undefined,
  daoAddressOrEns: string | undefined,
  provider: JsonRpcProvider,
  isL2NetworkEns: boolean,
  network: SupportedNetworks,
  redirectDaoToAddress: (address: string | null) => void
): Promise<DaoDetails | null> {
  if (!daoAddressOrEns)
    return Promise.reject(new Error('daoAddressOrEns must be defined'));

  if (!client) return Promise.reject(new Error('client must be defined'));

  const address = await provider.resolveName(daoAddressOrEns as string);

  // if network is l2 and has ens name, resolve to address
  if (isL2NetworkEns) {
    redirectDaoToAddress(address);
  }

  // Note: SDK doesn't support ens names in L2 chains so we need to resolve the address first
  // const daoDetails = await client.methods.getDao(daoAddressOrEns.toLowerCase());

  const {dao} = await request<{dao: SubgraphDao}>(
    SUBGRAPH_API_URL[network]!,
    QueryDao,
    {
      address: address?.toLowerCase() ?? daoAddressOrEns?.toLowerCase(),
    }
  );

  let metadata = await ipfsService.getData(dao.metadata);

  if (typeof metadata === 'string') metadata = JSON.parse(metadata);

  const daoDetails = toDaoDetails(dao, metadata);

  const avatar = daoDetails?.metadata.avatar;
  if (avatar)
    if (typeof avatar !== 'string') {
      daoDetails.metadata.avatar = URL.createObjectURL(avatar);
    } else if (/^ipfs/.test(avatar) && client) {
      try {
        const cid = resolveIpfsCid(avatar);

        daoDetails.metadata.avatar = `${
          import.meta.env.VITE_PINATA_GATEWAY
        }/${cid}`;
      } catch (err) {
        console.warn('Error resolving DAO avatar IPFS Cid', err);
      }
    } else {
      daoDetails.metadata.avatar = avatar;
    }

  daoDetails?.plugins.sort(a => {
    if (
      a.id === 'token-voting.plugin.dao.eth' ||
      a.id === 'multisig.plugin.dao.eth'
    )
      return -1;
    return 0;
  });

  return daoDetails;
}

/**
 * Custom hook to fetch DAO details for a given DAO address or ENS name using the current network and client.
 * @param daoAddressOrEns - The DAO address or ENS name to fetch details for.
 * @returns An object with the status of the query and the DAO details, if available.
 */
export const useDaoQuery = (
  daoAddressOrEns: string | undefined,
  refetchInterval = 0
) => {
  const {api: provider} = useProviders();
  const {network, networkUrlSegment} = useNetwork();
  const {client, network: clientNetwork} = useClient();
  const location = useLocation();
  const navigate = useNavigate();

  // if network is unsupported this will be caught when compared to client
  const queryNetwork = useMemo(
    () => networkUrlSegment ?? network,
    [network, networkUrlSegment]
  );

  const isL2NetworkEns = useMemo(
    () =>
      !CHAIN_METADATA[network].supportsEns &&
      !isAddress(daoAddressOrEns as string),
    [daoAddressOrEns, network]
  );

  const redirectDaoToAddress = useCallback(
    (address: string | null) => {
      if (!address)
        // if the the resolver doesn't have an address, redirect to 404
        navigate(NotFound, {
          replace: true,
          state: {incorrectDao: daoAddressOrEns},
        });

      // replace the ens name with the address in the url
      const segments = location.pathname.split('/');
      const daoIndex = segments.findIndex(
        segment => segment === daoAddressOrEns
      );

      if (daoIndex !== -1 && address) {
        segments[daoIndex] = address;
        navigate(segments.join('/'));
      }
    },
    [daoAddressOrEns, location.pathname, navigate]
  );

  // make sure that the network and the url match up with client network before making the request
  const enabled =
    !!daoAddressOrEns && !!client && clientNetwork === queryNetwork;

  const queryFn = useCallback(() => {
    return fetchDaoDetails(
      client,
      daoAddressOrEns,
      provider,
      isL2NetworkEns,
      network,
      redirectDaoToAddress
    );
  }, [
    client,
    daoAddressOrEns,
    isL2NetworkEns,
    network,
    provider,
    redirectDaoToAddress,
  ]);

  return useQuery<DaoDetails | null>({
    queryKey: ['daoDetails', daoAddressOrEns, queryNetwork],
    queryFn,
    enabled,
    // useQuery will cache an empty data for ens names which is wrong, but this config
    // will disable caching for ens names in L2 the caching is enabled for
    // none l2 networks and l2 networks that are not ens names
    ...{
      ...(isL2NetworkEns
        ? {gcTime: 0, refetchOnWindowFocus: true}
        : {refetchOnWindowFocus: false}),
    },
    refetchInterval,
    select: addAvatarToDao(),
  });
};

/**
 * Custom hook to fetch DAO details for a given DAO address or ENS name using the current network and client.
 * If no DAO details are available, the function navigates to the 404 page.
 * @returns An object with the status of the query and the DAO details, if available.
 */
export const useDaoDetailsQuery = () => {
  const {dao} = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const daoAddressOrEns = dao?.toLowerCase();
  const apiResponse = useDaoQuery(daoAddressOrEns);

  useEffect(() => {
    if (apiResponse.isFetched) {
      // navigate to 404 if the DAO is not found or there is some sort of error
      if (apiResponse.error || apiResponse.data === null) {
        navigate(NotFound, {
          replace: true,
          state: {incorrectDao: daoAddressOrEns},
        });
      }

      //navigate to url with ens domain
      else if (
        isAddress(daoAddressOrEns as string) &&
        toDisplayEns(apiResponse.data?.ensDomain)
      ) {
        const segments = location.pathname.split('/');
        const daoIndex = segments.findIndex(
          segment => segment === daoAddressOrEns
        );
        if (daoIndex !== -1 && apiResponse.data?.ensDomain) {
          segments[daoIndex] = apiResponse.data.ensDomain;
          navigate(segments.join('/'));
        }
      }
    }
  }, [
    apiResponse.data,
    apiResponse.error,
    apiResponse.isFetched,
    daoAddressOrEns,
    location.pathname,
    navigate,
  ]);

  return apiResponse;
};

/**
 * Adds avatar to DAO
 * @param dao DAO details
 * @returns DAO details object augmented with a resolved IPFS avatar
 */
const addAvatarToDao = () => (dao: DaoDetails | null) => {
  if (!dao) return null;

  return {
    ...dao,
    metadata: {
      ...dao?.metadata,
      avatar: dao?.metadata.avatar,
    },
  };
};
