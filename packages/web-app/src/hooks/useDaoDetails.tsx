import {Client, DaoDetails} from '@aragon/sdk-client';
import {JsonRpcProvider} from '@ethersproject/providers';
import {useQuery} from '@tanstack/react-query';
import {isAddress} from 'ethers/lib/utils';
import {useCallback, useEffect, useMemo} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {resolveDaoAvatarIpfsCid, toDisplayEns} from 'utils/library';
import {NotFound} from 'utils/paths';
import {useClient} from './useClient';
import {useSpecificProvider} from 'context/providers';
import {CHAIN_METADATA} from 'utils/constants';

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
  redirectDaoToAddress: (address: string | null) => void
): Promise<DaoDetails | null> {
  if (!daoAddressOrEns)
    return Promise.reject(new Error('daoAddressOrEns must be defined'));

  if (!client) return Promise.reject(new Error('client must be defined'));

  if (isL2NetworkEns) {
    const address = await provider.resolveName(daoAddressOrEns as string);
    redirectDaoToAddress(address);
  }

  const daoDetails = await client.methods.getDao(daoAddressOrEns.toLowerCase());
  console.log('daoDetails', daoDetails);
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
  const {network, networkUrlSegment} = useNetwork();
  const {client, network: clientNetwork} = useClient();
  const location = useLocation();
  const navigate = useNavigate();
  // for custom resolver registry
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  // if network is unsupported this will be caught when compared to client
  const queryNetwork = useMemo(
    () => networkUrlSegment ?? network,
    [network, networkUrlSegment]
  );

  const isL2NetworkEns = useMemo(
    () =>
      (network === 'polygon' || network === 'mumbai') &&
      !isAddress(daoAddressOrEns as string),
    [daoAddressOrEns, network]
  );

  const redirectDaoToAddress = useCallback(
    (address: string | null) => {
      if (!address)
        navigate(NotFound, {
          replace: true,
          state: {incorrectDao: daoAddressOrEns},
        });
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
      redirectDaoToAddress
    );
  }, [client, daoAddressOrEns, isL2NetworkEns, provider, redirectDaoToAddress]);

  return useQuery<DaoDetails | null>({
    queryKey: ['daoDetails', daoAddressOrEns, queryNetwork],
    queryFn,
    select: addAvatarToDao,
    enabled,
    ...{
      ...(isL2NetworkEns
        ? {cacheTime: 0, refetchOnWindowFocus: true}
        : {refetchOnWindowFocus: false}),
    },
    refetchInterval,
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
 * Add resolved IPFS CID to DAO metadata
 * @param dao DAO details
 * @returns DAO details object augmented with a resolved IPFS avatar
 */
function addAvatarToDao(dao: DaoDetails | null) {
  if (!dao) return null;

  return {
    ...dao,
    metadata: {
      ...dao?.metadata,
      avatar: resolveDaoAvatarIpfsCid(dao?.metadata.avatar),
    },
  };
}
