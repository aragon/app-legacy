import {useQuery, UseQueryOptions} from '@tanstack/react-query';
import {Census3QueryKeys} from '../query-keys';
import {useWallet} from 'hooks/useWallet';
import {useCensus3Client} from 'hooks/useCensus3';
import {Token} from '@vocdoni/sdk';

/**
 * Hook to fetch token information using census3.getToken function
 */
export const useCensus3Token = (
  tokenAddress: string,
  options?: UseQueryOptions<Token>
) => {
  const census3 = useCensus3Client();
  const {chainId} = useWallet();
  return useQuery(
    Census3QueryKeys.token(tokenAddress),
    async () => await census3.getToken(tokenAddress, chainId),
    options
  );
};
