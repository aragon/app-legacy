import {ApolloClient} from '@apollo/client';
import {Client} from '@aragon/sdk-client';
import {constants} from 'ethers';
import {fetchTokenData} from 'services/prices';
import {SupportedNetworks} from 'utils/constants';

import {ActionWithdraw} from 'utils/types';

/**
 * Get dao metadata
 * Note: Please rename to useDaoMetadata once the other hook as been deprecated
 * @param data Uint8Array action data
 * @param client SDK client, Fetched using useClient
 * @param apolloClient Apollo client, Fetched using useApolloClient
 * @param network network of the dao
 * @returns Return Decoded Withdraw action
 */
export async function decodeWithdrawToAction(
  data: Uint8Array | undefined,
  client: Client | undefined,
  apolloClient: ApolloClient<object>,
  network: SupportedNetworks
): Promise<ActionWithdraw | undefined> {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  const decoded = await client?.decoding.withdrawAction(data);

  if (!decoded) {
    console.error('Unable to decode withdraw action');
    return;
  }

  const response = await fetchTokenData(
    decoded?.tokenAddress || constants.AddressZero,
    apolloClient,
    network
  );

  return {
    amount: Number(decoded.amount),
    name: 'withdraw_assets',
    to: decoded.recipientAddress,
    tokenAddress: response?.address || (decoded?.tokenAddress as string),
    tokenBalance: 0, // unnecessary
    tokenImgUrl: response?.imgUrl as string,
    tokenName: response?.name || '',
    tokenPrice: response?.price || 0,
    tokenSymbol: response?.symbol || '',
    isCustomToken: false,
  };
}
