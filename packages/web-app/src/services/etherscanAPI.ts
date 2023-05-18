import {QueryClient} from '@tanstack/react-query';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3600000,
    },
  },
});

export const getEtherscanVerifiedContract = (
  contractAddress: string,
  network: SupportedNetworks
) => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
  const url = `${CHAIN_METADATA[network].etherscanApi}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;

  return queryClient.fetchQuery({
    queryKey: ['verifyContractEtherscan', contractAddress, network],
    queryFn: () => {
      return fetch(url).then(res => res.json());
    },
  });
};
