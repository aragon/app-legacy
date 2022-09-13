import { ApolloClient } from '@apollo/client';
import { constants } from 'ethers';
import { fetchTokenData } from 'services/prices';
import { SupportedNetworks } from 'utils/constants';

import {ActionWithdraw} from 'utils/types';
import {useClient} from './useClient';

/**
 * Get dao metadata
 * Note: Please rename to useDaoMetadata once the other hook as been deprecated
 * @param daoId dao ens name or address
 * @returns dao metadata for given address
 */
  async function useDecodeWithdrawToAction(
    data: Uint8Array,
    apolloClient: ApolloClient<object>,
    network: SupportedNetworks
  ): Promise<ActionWithdraw | undefined> {
    const {client} = useClient();
    const decoded = client?.decoding.withdrawAction(data);

    if (!decoded) {
      console.error('Unable to decode withdraw action');
      return;
    }

    const response = await fetchTokenData(
      decoded?.tokenAddress || constants.AddressZero,
      apolloClient,
      network
    );

    if (response)
      return {
        amount: Number(decoded.amount),
        name: 'withdraw_assets',
        to: decoded.recipientAddress,
        tokenAddress: response.address,
        tokenBalance: 0, // unnecessary
        tokenImgUrl: response.imgUrl as string,
        tokenName: response.name,
        tokenPrice: response.price,
        tokenSymbol: response.symbol,
        isCustomToken: false,
      };
  }

  return {decodedAction, error, isLoading};
}
