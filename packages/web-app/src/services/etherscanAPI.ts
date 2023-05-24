import {queryClient} from 'index';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';

export const getEtherscanVerifiedContract = (
  contractAddress: string,
  network: SupportedNetworks
) => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;

  const url = `${CHAIN_METADATA[network].etherscanApi}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;

  return queryClient.fetchQuery({
    queryKey: ['verifyContractEtherscan', contractAddress, network],
    staleTime: Infinity,
    queryFn: () => {
      return fetch(url).then(res => res.json());
    },
  });
};
