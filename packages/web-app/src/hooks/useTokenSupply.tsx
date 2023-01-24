import {formatUnits} from 'ethers/lib/utils';
import {useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {CHAIN_METADATA} from 'utils/constants';
import {getTokenInfo} from 'utils/tokens';
import {HookData} from 'utils/types';

export function useTokenSupply(
  tokenAddress: string
): HookData<number | undefined> {
  const {network} = useNetwork();
  const {infura} = useProviders();

  const [data, setData] = useState<number>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tokenAddress) {
      getTokenInfo(tokenAddress, infura, CHAIN_METADATA[network].nativeCurrency)
        .then((r: Awaited<ReturnType<typeof getTokenInfo>>) => {
          const formattedNumber = parseFloat(
            formatUnits(r.totalSupply, r.decimals)
          );
          setData(formattedNumber);
          setIsLoading(false);
        })
        .catch(setError);
    }
  }, [tokenAddress, infura, network]);

  return {data, error, isLoading};
}
