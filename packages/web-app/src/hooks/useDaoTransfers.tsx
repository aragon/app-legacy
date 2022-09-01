import {IAssetTransfers} from '@aragon/sdk-client/dist/internal/interfaces/client';
import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {useClient} from './useClient';

export const useDaoTransfers = (
  daoAddressOrEns: Address
): HookData<IAssetTransfers> => {
  const {client} = useClient();

  const [data, setData] = useState<IAssetTransfers>({
    deposits: [],
    withdrawals: [],
  });
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getTransfers() {
      try {
        setIsLoading(true);

        const transfers = await client?.methods.getTransfers(daoAddressOrEns);
        if (transfers) setData(transfers);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getTransfers();
  }, [client?.methods, daoAddressOrEns]);

  return {data, error, isLoading};
};
