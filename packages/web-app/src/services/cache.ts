// This file is a placeholder for the eventual emergence
// of a caching service provided by separate server
// For now most of these methods will be passed the reactive
// variables from Apollo-client
import {DaoDetails} from '@aragon/sdk-client';

import {
  NavigationDao,
  PendingDao,
  PendingDaoCreation,
} from 'context/apolloClient';
import {
  FAVORITE_DAOS_KEY,
  PENDING_DAOS_KEY,
  SupportedChainID,
  SupportedNetworks,
  VERIFIED_CONTRACTS_KEY,
} from 'utils/constants';
import {sleepFor} from 'utils/library';
import {SmartContract, VerifiedContracts} from 'utils/types';

/**
 * Fetch a list of favorited DAOs
 * @param cache favorited DAOs cache (to be replaced when migrating to server)
 * @param options query options
 * @returns list of favorited DAOs based on given options
 */
export async function getFavoritedDaosFromCache(options: {
  skip: number;
  limit?: number;
}): Promise<NavigationDao[]> {
  const {skip, limit} = options;

  const favoriteDaos = JSON.parse(
    localStorage.getItem(FAVORITE_DAOS_KEY) || '[]'
  ) as NavigationDao[];

  // sleeping for 600 ms because the immediate apparition of DAOS creates a flickering issue
  await sleepFor(600);
  return favoriteDaos.slice(skip, limit ? skip + limit : undefined);
}

/**
 * Fetch a favorited DAO from the cache if available
 * @param daoAddress the address of the favorited DAO to fetch
 * @param chain the chain of the favorited DAO to fetch
 * @returns a favorited DAO with the given address and chain or null
 * if not found
 */
export async function getFavoritedDaoFromCache(
  daoAddress: string | undefined,
  chain: SupportedChainID
) {
  if (!daoAddress)
    return Promise.reject(new Error('daoAddressOrEns must be defined'));

  if (!chain) return Promise.reject(new Error('chain must be defined'));

  const daos = await getFavoritedDaosFromCache({skip: 0});
  return (
    daos.find(dao => dao.address === daoAddress && dao.chain === chain) ?? null
  );
}

/**
 * Favorite a DAO by adding it to the favorite DAOs cache
 * @param dao DAO being favorited
 * @returns an error if the dao to favorite is not provided
 */
export async function addFavoriteDaoToCache(dao: NavigationDao) {
  if (!dao) return Promise.reject(new Error('daoToFavorite must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const newCache = [...cache, dao];

  localStorage.setItem(FAVORITE_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Removes a favorite DAO from the cache
 * @param dao DAO to unfavorite
 * @returns an error if no DAO is provided
 */
export async function removeFavoriteDaoFromCache(dao: NavigationDao) {
  if (!dao) return Promise.reject(new Error('dao must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const newCache = cache.filter(
    fd =>
      fd.address.toLowerCase() !== dao.address.toLowerCase() ||
      fd.chain !== dao.chain
  );

  localStorage.setItem(FAVORITE_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Update a DAO in the cache
 * @param dao updated DAO; note dao.address & dao.chain should never be changed
 * @returns an error if no DAO is provided
 */
export async function updateFavoritedDaoInCache(dao: NavigationDao) {
  if (!dao) return Promise.reject(new Error('dao must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const daoFound = cache.findIndex(
    d => d.address === dao.address && d.chain === dao.chain
  );

  if (daoFound !== -1) {
    const newCache = [...cache];
    newCache[daoFound] = {...dao};

    localStorage.setItem(FAVORITE_DAOS_KEY, JSON.stringify(newCache));
  }
}

/**
 * Fetch the details of a pending DAO fro the cache, if available
 * @param cache cache object that holds the pending DAOs (remove when migrating to server)
 * @param network network in which the DAO is being created.
 * @param daoAddressOrEns the address or ens domain of the DAO
 * @returns
 */
export async function getPendingDaoFromCache(
  network: SupportedNetworks | undefined,
  daoAddressOrEns: string | undefined
): Promise<DaoDetails | null> {
  if (!daoAddressOrEns)
    return Promise.reject(new Error('daoAddressOrEns must be defined'));

  if (!network) return Promise.reject(new Error('network must be defined'));

  const pendingDaos = JSON.parse(
    localStorage.getItem(PENDING_DAOS_KEY) || '{}'
  ) as PendingDaoCreation;

  const foundDao = pendingDaos?.[network]?.[daoAddressOrEns.toLowerCase()];

  if (!foundDao) return null;

  return {
    address: daoAddressOrEns,
    ensDomain: foundDao.ensSubdomain,
    metadata: foundDao.metadata,
    plugins: [],
    creationDate: foundDao.creationDate,
  };
}

/**
 * Get the cached DAOs
 * @returns Pending Daos cache
 */
async function getPendingDaosFromCache(): Promise<PendingDaoCreation | null> {
  const pendingDaos = localStorage.getItem(PENDING_DAOS_KEY) || '{}';

  return pendingDaos === '{}'
    ? Promise.resolve(null)
    : Promise.resolve(JSON.parse(pendingDaos) as PendingDaoCreation);
}

/**
 * Add a pending DAO to the cache
 * @param daoAddress address of pending DAO
 * @param network network of the pending DAO
 * @param daoDetails details of the pending DAO
 */
export async function addPendingDaoToCache(
  daoAddress: string,
  network: SupportedNetworks,
  daoDetails: PendingDao
) {
  if (!daoAddress)
    return Promise.reject(new Error('daoAddress must be defined'));

  if (!daoDetails)
    return Promise.reject(new Error('daoDetails must be defined'));

  if (!network) return Promise.reject(new Error('network must be defined'));

  const cache = (await getPendingDaosFromCache()) || {};
  const newCache = {
    ...cache,
    [network]: {
      ...cache[network],
      [daoAddress.toLowerCase()]: {...daoDetails},
    },
  };

  localStorage.setItem(PENDING_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Remove a pending DAO from the cache
 * @param network network of the pending DAO to be removed
 * @param daoAddress address of the pending DAO to be removed
 * @returns an error if no address or network is given
 */
export async function removePendingDaoFromCache(
  network: SupportedNetworks | undefined,
  daoAddress: string | undefined
) {
  if (!daoAddress)
    return Promise.reject(new Error('daoAddress must be defined'));

  if (!network) return Promise.reject(new Error('network must be defined'));

  const cache = await getPendingDaosFromCache();
  const newCache = {...cache};
  delete newCache?.[network]?.[daoAddress];

  localStorage.setItem(PENDING_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Get verified smart contracts from caching service for the specified wallet address and optional chain ID.
 * If the chain ID is not provided, the function returns all smart contracts across all chains.
 *
 * @param walletAddress wallet address for which to fetch the verified smart contracts.
 * @param chainId (Optional) chain ID to filter the verified smart contracts by.
 * @throws Will throw an error if the walletAddress parameter is not defined.
 */
export function getVerifiedSmartContracts(
  walletAddress: string | null,
  chainId?: SupportedChainID
): SmartContract[] {
  // Ensure the daoAddress parameter is defined
  if (!walletAddress) {
    throw new Error('daoAddress must be defined');
  }

  let verifiedContracts = {} as VerifiedContracts;
  try {
    verifiedContracts = JSON.parse(
      localStorage.getItem(VERIFIED_CONTRACTS_KEY) || '{}'
    );
  } catch (error) {
    console.error('Error parsing verified contracts from localStorage:', error);
  }

  // Get the contracts for the given DAO address
  const walletContracts = verifiedContracts[walletAddress] || {};

  // If a chainId is provided, return the contracts for that specific chain
  if (chainId) {
    return walletContracts[chainId] || [];
  }

  // If no chainId is provided, return all contracts across all chains for the specified wallet address
  return Object.values(walletContracts).flatMap(contracts => contracts);
}

export function addVerifiedSmartContract(
  contract: SmartContract,
  walletAddress: string | null,
  chainId: SupportedChainID
): void {
  // Ensure the contract, daoAddress, and chainId parameters are defined
  if (!contract || !walletAddress || !chainId) {
    throw new Error('Contract, daoAddress, and chainId must be defined');
  }

  // get the contracts from local storage
  let verifiedContracts = {} as VerifiedContracts;
  try {
    verifiedContracts = JSON.parse(
      localStorage.getItem(VERIFIED_CONTRACTS_KEY) || '{}'
    );

    // add the newly verified contract into the list
    const updatedContracts = {
      ...verifiedContracts,
      [walletAddress]: {
        ...verifiedContracts[walletAddress],
        [chainId]: [
          ...(verifiedContracts[walletAddress]?.[chainId] || []),
          contract,
        ],
      },
    };

    // add the new contracts into storage
    localStorage.setItem(
      VERIFIED_CONTRACTS_KEY,
      JSON.stringify(updatedContracts)
    );
  } catch (error) {
    console.error('Error parsing verified contracts from localStorage:', error);
  }
}
