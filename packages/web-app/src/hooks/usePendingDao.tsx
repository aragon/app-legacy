import {useReactiveVar} from '@apollo/client';
import {DaoDetails} from '@aragon/sdk-client';
import {useQuery} from '@tanstack/react-query';
import {useParams} from 'react-router-dom';

import {pendingDaoCreationVar} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {getPendingDaoFromCache} from 'services/cache';

/**
 * Get pending DAO upon creation
 * @param shouldPoll boolean value indicating whether the query should continue
 * refetching on interval
 * @returns a DAO that has not been indexed by the subgraph
 */
export const usePendingDao = (shouldPoll: boolean) => {
  // TODO: figure out how Daos are being retrieved on the server
  // in order to know whether to resolve ens
  const {dao: daoAddressOrEns} = useParams();

  const {network, networkUrlSegment} = useNetwork();
  const pendingDaos = useReactiveVar(pendingDaoCreationVar);

  return useQuery<DaoDetails | null>({
    queryKey: ['pendingDao', daoAddressOrEns, network],
    queryFn: () =>
      getPendingDaoFromCache(pendingDaos, network, daoAddressOrEns),
    enabled: shouldPoll && !!daoAddressOrEns && network === networkUrlSegment,
    refetchInterval: () => (shouldPoll ? 1000 : false),
  });
};
