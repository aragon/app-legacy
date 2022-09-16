import {DaoDetails} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {ExploreFilter} from 'containers/daoExplorer';
import {HookData} from 'utils/types';
import {useClient} from './useClient';

// NOTE Currently the DAOs are fetched using the SDK's getDaos method. This
// method simply returns a list of mocked DAOs. In particular, it does not allow
// to pass any arguments like "newest" or "popular". Consequently the fetched
// data is returned as is if "popular" is set and simply sorts the data by date
// if "newest" is set. [VR 16-09-2022]

// TODO This hook is missing the "MyDaos" feature. I don't think this is in
// scope for alpha, though. [VR 16-09-2022]

/**
 * This hook returns a list of daos. The data returned for each dao contains
 * information about the dao such as metadata, plugins installed on the dao,
 * address, etc.
 *
 * The hook takes a single argument that determines the criteria for which DAOs
 * will be returned. This can be either popular or newest DAOs, or DAOs that a
 * user has favourited.
 *
 * @param useCase filter criteria that should be applied when fetching daos
 * @returns A list of Daos and their respective infos (metadata, plugins, etc.)
 */
export function useDaos(useCase: ExploreFilter): HookData<DaoDetails[]> {
  const [data, setData] = useState<DaoDetails[]>([] as DaoDetails[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const {client} = useClient();

  useEffect(() => {
    async function fetchDaos() {
      const daoDetails = (await client?.methods.getDaos()) || [];

      // TODO Remove this (unfortunate) piece of code once SDK provides
      // filtering capabilities.
      if (useCase === 'newest') {
        daoDetails.sort(sortNewest);
        setData(daoDetails);
      } else {
        setData(daoDetails);
      }
    }
    try {
      fetchDaos();
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [client?.methods, useCase]);

  return {data, isLoading: loading, error};
}

function sortNewest(a: DaoDetails, b: DaoDetails) {
  return b.creationDate.valueOf() - a.creationDate.valueOf();
}
