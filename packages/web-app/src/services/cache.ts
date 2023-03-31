// This file is a placeholder for the eventual emergence
// of a caching service provided by separate server
// For now most of these methods will be passed the reactive
// variables from Apollo-client
import {DaoDetails} from '@aragon/sdk-client';

import {NavigationDao, PendingDaoCreation} from 'context/apolloClient';
import {SupportedNetworks} from 'utils/constants';
import {sleepFor} from 'utils/library';

/**
 * Fetch a list of favorited DAOs
 * @param cache favorited DAOs cache (to be replaced when migrating to server)
 * @param options query options
 * @returns list of favorited DAOs based on given options
 */
export async function getFavoritedDaosFromCache(
  cache: Array<NavigationDao>,
  options: {skip: number; limit: number}
): Promise<NavigationDao[]> {
  const {skip, limit} = options;

  // sleeping for 600 ms because the immediate apparition of DAOS creates a flickering issue
  await sleepFor(600);
  return cache.slice(skip, skip + limit);
}

/**
 * Fetch the details of a pending DAO fro the cache, if available
 * @param cache cache object that holds the pending DAOs (remove when migrating to server)
 * @param network network in which the DAO is being created.
 * @param daoAddressOrEns the address or ens domain of the DAO
 * @returns
 */
export async function getPendingDaoFromCache(
  cache: PendingDaoCreation,
  network: SupportedNetworks | undefined,
  daoAddressOrEns: string | undefined
): Promise<DaoDetails | null> {
  if (!daoAddressOrEns)
    return Promise.reject(new Error('daoAddressOrEns must be defined'));

  if (!network) return Promise.reject(new Error('network must be defined'));

  const foundDao = cache?.[network]?.[daoAddressOrEns.toLowerCase()];

  if (!foundDao) return null;

  return {
    address: daoAddressOrEns,
    ensDomain: foundDao.daoCreationParams.ensSubdomain,
    metadata: foundDao.daoMetadata,
    plugins: [],
    creationDate: new Date(),
  };
}
