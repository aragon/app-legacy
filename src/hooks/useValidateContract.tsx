import {
  CHAIN_METADATA,
  SupportedNetworks,
  TransactionState,
} from 'utils/constants';
import {useQueries, useQuery} from '@tanstack/react-query';

/**
 * Verify a smart contract on Etherscan using a custom React hook
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @returns Etherscan API response containing the smart contract's source code
 */
const useValidateContractEtherscan = (
  contractAddress: string,
  network: SupportedNetworks,
  verificationState: TransactionState
) => {
  const api = CHAIN_METADATA[network]?.etherscanApi;
  const apiKey = CHAIN_METADATA[network]?.etherscanApiKey;
  const chainId = CHAIN_METADATA[network]?.id;
  const url = `${api}?chainid=${chainId}&module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;

  return useQuery({
    queryKey: ['verifyContractEtherscan', contractAddress, network],
    staleTime: Infinity,
    queryFn: () => {
      return fetch(url).then(res => {
        return res.json().then(data => {
          if (data.result[0].Proxy === '1') {
            return fetch(
              `${api}?chainid=${chainId}&module=contract&action=getsourcecode&address=${data.result[0].Implementation}&apikey=${apiKey}`
            ).then(async r => {
              data.result[0].proxyImplementation = await r.json();
              return data;
            });
          }
          return data;
        });
      });
    },
    enabled:
      contractAddress !== null &&
      verificationState === TransactionState.LOADING &&
      !!network,
  });
};

/**
 * Verify a smart contract on Sourcify using a custom React hook
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @param verificationState Loading state of verification modal
 * @returns An object with Sourcify FullMatch and PartialMatch API responses containing the smart contract's source code
 */
const useValidateContractSourcify = (
  contractAddress: string,
  network: SupportedNetworks,
  verificationState: TransactionState
) => {
  const chainId = CHAIN_METADATA[network]?.id;
  return useQueries({
    queries: ['full_match', 'partial_match'].map(type => {
      return {
        queryKey: [`verifycontract${type}Sourcify`, contractAddress, network],
        queryFn: () => {
          return fetch(
            `https://repo.sourcify.dev/contracts/${type}/${chainId}/${contractAddress}/metadata.json`
          ).then(res => res.json());
        },
        enabled: verificationState === TransactionState.LOADING && !!network,
        retry: false,
      };
    }),
  });
};

/**
 * Aggregating hook to verify a smart contract on both Etherscan and Sourcify
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @param verificationState Loading state of verification modal
 * @returns Etherscan & Sourcify API response containing the smart contract's source code
 */
export const useValidateContract = (
  contractAddress: string,
  network: SupportedNetworks,
  verificationState: TransactionState
) => {
  const {data: etherscanVerifyData, isLoading: etherscanLoading} =
    useValidateContractEtherscan(contractAddress, network, verificationState);
  const queries = useValidateContractSourcify(
    contractAddress,
    network,
    verificationState
  );

  return {
    sourcifyFullData: queries[0].data,
    sourcifyPartialData: queries[1].data,
    etherscanData: etherscanVerifyData,
    sourcifyLoading: queries[0].isLoading || queries[1].isLoading,
    etherscanLoading,
  };
};
