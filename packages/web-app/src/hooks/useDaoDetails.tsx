import {useReactiveVar} from '@apollo/client';
import {DaoDetails} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {pendingDaoCreationVar} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {HookData} from 'utils/types';
import {useClient} from './useClient';

/**
 * Get dao metadata
 * Note: Please rename to useDaoMetadata once the other hook as been deprecated
 * @param daoId dao ens name or address
 * @returns dao metadata for given address
 */
export function useDaoDetails(
  daoId: string
): HookData<DaoDetails | undefined> & {waitingForSubgraph: boolean} {
  const {client} = useClient();

  const [data, setData] = useState<DaoDetails>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForSubgraph, setWaitingForSubgraph] = useState(false);
  const {network} = useNetwork();
  const cachedDaos = useReactiveVar(pendingDaoCreationVar);

  useEffect(() => {
    async function getDaoMetadata() {
      try {
        setIsLoading(true);

        if (cachedDaos?.[network]?.[daoId.toLowerCase()]) {
          const pendingDAO = cachedDaos?.[network]?.[daoId.toLowerCase()];
          if (pendingDAO) {
            setData({
              address: daoId,
              ensDomain: pendingDAO.ensSubdomain,
              metadata: pendingDAO.metadata,
              plugins: [],
              creationDate: new Date(),
            });
          }
          setWaitingForSubgraph(true);
        } else {
          const dao = await client?.methods.getDao(daoId.toLowerCase());
          if (dao) {
            setData(dao);
            setWaitingForSubgraph(false);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (daoId) getDaoMetadata();
  }, [cachedDaos, client?.methods, daoId, network]);

  return {data, error, isLoading, waitingForSubgraph};
}
