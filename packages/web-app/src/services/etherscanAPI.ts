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
      return fetch(url).then(res => {
        return res.json().then(data => {
          if (data.result[0].Proxy === '1') {
            return fetch(
              `${CHAIN_METADATA[network].etherscanApi}?module=contract&action=getsourcecode&address=${data.result[0].Implementation}&apikey=${apiKey}`
            ).then(r => r.json());
          }
          return data;
        });
      });
    },
  });
};
