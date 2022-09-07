import {AssetBalance} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {useClient} from './useClient';

export const useDaoBalances = (
  daoAddressOrEns: string
): HookData<Array<AssetBalance> | undefined> => {
  const {client} = useClient();

  const [data, setData] = useState<Array<AssetBalance>>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getBalances() {
      try {
        setIsLoading(true);
        const balances = await client?.methods.getBalances(daoAddressOrEns);
        if (balances) setData(balances);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getBalances();
  }, [client?.methods, daoAddressOrEns]);

  return {data, error, isLoading};
};
