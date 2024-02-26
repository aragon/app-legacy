import {useQuery, UseQueryOptions} from '@tanstack/react-query';
import {Census3QueryKeys} from '../query-keys';
import {useWallet} from 'hooks/useWallet';
import {useCensus3Client} from 'hooks/useCensus3';
import {Token} from '@vocdoni/sdk';
import {ICensus3TokenProps} from '../census3-service.api';

/**
 * Hook to fetch token information using census3.getToken function
 */
export const useCensus3Token = (
  {tokenAddress}: ICensus3TokenProps,
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
