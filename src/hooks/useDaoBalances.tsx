import {AssetBalance} from '@aragon/sdk-client';

import {useNetwork} from 'context/network';
import {useTokenBalances} from 'services/token/queries/use-token';
import {HookData} from 'utils/types';

export const useDaoBalances = (
  daoAddress: string
): HookData<Array<AssetBalance> | undefined> => {
  const {network} = useNetwork();

  const {
    data: balances,
    isLoading,
    error,
  } = useTokenBalances({address: daoAddress, network}, {enabled: !!daoAddress});

  return {data: balances || [], error: error as Error, isLoading};
};
