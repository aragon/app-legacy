import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {EtherscanContractResponse} from 'utils/types';

// FIXME: For some chains like polygon we might need different api key
export async function getEtherscanVerifiedContract(
  address: string,
  networks: SupportedNetworks
): Promise<EtherscanContractResponse | undefined> {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
  const url = `${CHAIN_METADATA[networks].etherscanApi}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    // status 1 means that the etherscan response was successful
    if (data.status === '1')
      if (data.result[0].ABI !== 'Contract source code not verified')
        // The API works with no api key as well but this condition will check
        // the abi and api key existence with the same condition
        return data.result[0];
  } catch (error) {
    console.log(error);
  }
}
