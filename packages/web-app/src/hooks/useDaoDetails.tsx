import {DaoDetails} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {useClient} from './useClient';

/**
 * Get dao metadata
 * Note: Please rename to useDaoMetadata once the other hook as been deprecated
 * @param daoId dao ens name or address
 * @returns dao metadata for given address
 */
export function useDaoDetails(daoId: string): HookData<DaoDetails | undefined> {
  const {client} = useClient();

  const [data, setData] = useState<DaoDetails>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getDaoMetadata() {
      try {
        setIsLoading(true);

        const dao = await client?.methods.getDao(daoId);
        if (dao) setData(dao);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (daoId) getDaoMetadata();
  }, [client?.methods, daoId]);

  return {data, error, isLoading};
}
