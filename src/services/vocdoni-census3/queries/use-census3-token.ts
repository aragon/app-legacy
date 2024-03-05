import {useQuery, UseQueryOptions} from '@tanstack/react-query';
import {Census3QueryKeys} from '../query-keys';
import {useCensus3Client} from 'hooks/useCensus3';
import {Token} from '@vocdoni/sdk';
import {ICensus3TokenProps} from '../census3-service.api';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from '../../../utils/constants';

/**
 * Hook to fetch token information using census3.getToken function
 */
export const useCensus3Token = (
  {tokenAddress}: ICensus3TokenProps,
  options?: UseQueryOptions<Token>
) => {
  const census3 = useCensus3Client();
  const {network} = useNetwork();
  const chainId = CHAIN_METADATA[network].id;
  return useQuery(
    Census3QueryKeys.token(tokenAddress),
    async () => await census3.getToken(tokenAddress, chainId),
    options
  );
};
