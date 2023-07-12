import {queryClient} from 'index';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';

export const getEtherscanVerifiedContract = (
  contractAddress: string,
  network: SupportedNetworks
) => {
  const url = `${CHAIN_METADATA[network].etherscanApi}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${CHAIN_METADATA[network].etherscanApiKey}`;

  return queryClient.fetchQuery({
    queryKey: ['verifyContractEtherscan', contractAddress, network],
    staleTime: Infinity,
    queryFn: () => {
      return fetch(url).then(res => {
        return res.json().then(data => {
          if (data.result[0].Proxy === '1') {
            return fetch(
              `${CHAIN_METADATA[network].etherscanApi}?module=contract&action=getsourcecode&address=${data.result[0].Implementation}&apikey=${CHAIN_METADATA[network].etherscanApiKey}`
            ).then(r => r.json());
          }
          return data;
        });
      });
    },
  });
};
