import {formatUnits} from 'ethers/lib/utils';
import {useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {CHAIN_METADATA} from 'utils/constants';
import {getTokenInfo} from 'utils/tokens';
import {HookData} from 'utils/types';

type TokenSupplyData = {
  formatted: number;
  raw: bigint;
};

export function useTokenSupply(
  tokenAddress: string
): HookData<TokenSupplyData | undefined> {
  const {network} = useNetwork();
  const {infura} = useProviders();

  const [data, setData] = useState<TokenSupplyData>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tokenAddress) {
      getTokenInfo(tokenAddress, infura, CHAIN_METADATA[network].nativeCurrency)
        .then((r: Awaited<ReturnType<typeof getTokenInfo>>) => {
          const formatted = parseFloat(formatUnits(r.totalSupply, r.decimals));
          setData({
            formatted,
            raw: BigInt(r.totalSupply.toString()),
          });
          setIsLoading(false);
        })
        .catch(setError);
    }
  }, [tokenAddress, infura, network]);

  return {data, error, isLoading};
}
