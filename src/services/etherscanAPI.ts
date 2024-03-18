import {queryClient} from 'index';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';

export const getEtherscanVerifiedContract = (
  contractAddress: string,
  network: SupportedNetworks
) => {
  const {etherscanApi, etherscanApiKey} = CHAIN_METADATA[network];

  return queryClient.fetchQuery({
    queryKey: ['verifyContractEtherscan', contractAddress, network],
    staleTime: Infinity,
    queryFn: () =>
      fetchVerifiedContract(
        etherscanApi,
        etherscanApiKey ?? '',
        contractAddress
      ),
  });
};

const fetchVerifiedContract = async (
  blockApi: string,
  blockApiKey: string,
  contractAddress: string
) => {
  const url = getSourceCodeURL(blockApi, blockApiKey, contractAddress);

  let response = await fetch(url);
  const data = await response.json();

  // fetch implementation contract source and notices
  // if the given contract is a proxy
  if (data.result[0].Proxy === '1') {
    const implementationContractAddress = data.result[0].Implementation;
    const implementationContractURl = getSourceCodeURL(
      blockApi,
      blockApiKey,
      implementationContractAddress
    );

    response = await fetch(implementationContractURl);
    const implementation = await response.json();

    // replace the implementation contract name with the proxy name
    implementation.result[0].ContractName = data.result[0].ContractName;
    return implementation;
  } else {
    return data;
  }
};

function getSourceCodeURL(blockApi: string, apiKey: string, contract: string) {
  return `${blockApi}?module=contract&action=getsourcecode&address=${contract}&apikey=${apiKey}`;
}
