// Library utils / Ethers for now
import {ApolloClient} from '@apollo/client';
import {
  Client,
  Erc20TokenDetails,
  IMintTokenParams,
  MultisigClient,
  TokenVotingClient,
  VotingMode,
} from '@aragon/sdk-client';
import {resolveIpfsCid} from '@aragon/sdk-common';
import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {BigNumber, BigNumberish, constants, ethers, providers} from 'ethers';
import {TFunction} from 'react-i18next';

import {fetchTokenData} from 'services/prices';
import {
  BIGINT_PATTERN,
  CHAIN_METADATA,
  ISO_DATE_PATTERN,
  SupportedNetworks,
} from 'utils/constants';
import {
  ActionAddAddress,
  ActionMintToken,
  ActionRemoveAddress,
  ActionUpdateMetadata,
  ActionUpdateMultisigPluginSettings,
  ActionUpdatePluginSettings,
  ActionWithdraw,
} from 'utils/types';
import {i18n} from '../../i18n.config';
import {getTokenInfo} from './tokens';

export function formatUnits(amount: BigNumberish, decimals: number) {
  if (amount.toString().includes('.') || !decimals) {
    return amount.toString();
  }
  return ethers.utils.formatUnits(amount, decimals);
}

// (Temporary) Should be moved to ui-component perhaps
/**
 * Handles copying and pasting to and from the clipboard respectively
 * @param currentValue field value
 * @param onChange on value change callback
 */
export async function handleClipboardActions(
  currentValue: string,
  onChange: (value: string) => void,
  alert: (label: string) => void
) {
  if (currentValue) {
    await navigator.clipboard.writeText(currentValue);
    alert(i18n.t('alert.chip.inputCopied'));
  } else {
    const textFromClipboard = await navigator.clipboard.readText();
    onChange(textFromClipboard);
    alert(i18n.t('alert.chip.inputPasted'));
  }
}

/**
 * Check if the given value is an empty string
 * @param value parameter
 * @returns whether the parameter is an empty string
 */
export const isOnlyWhitespace = (value: string) => {
  return value.trim() === '';
};

/**
 * Return user friendly wallet address label if available
 * @param value address
 * @param t translation function
 * @returns user friendly label or wallet address
 */
export const getUserFriendlyWalletLabel = (
  value: string,
  t: TFunction<'translation', undefined>
) => {
  switch (value) {
    case '':
      return '';
    case constants.AddressZero:
      return t('labels.daoTreasury');

    default:
      return value;
  }
};

export const toHex = (num: number | string) => {
  return '0x' + num.toString(16);
};

/**
 * DecodeWithdrawToAction
 * @param data Uint8Array action data
 * @param client SDK client, Fetched using useClient
 * @param apolloClient Apollo client, Fetched using useApolloClient
 * @param provider Eth provider
 * @param network network of the dao
 * @returns Return Decoded Withdraw action
 */
export async function decodeWithdrawToAction(
  data: Uint8Array | undefined,
  client: Client | undefined,
  apolloClient: ApolloClient<object>,
  provider: providers.Provider,
  network: SupportedNetworks,
  to: string,
  value: bigint
): Promise<ActionWithdraw | undefined> {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  const decoded = client.decoding.withdrawAction(to, value, data);

  if (!decoded) {
    console.error('Unable to decode withdraw action');
    return;
  }

  const address =
    decoded.type === 'native' ? constants.AddressZero : decoded?.tokenAddress;
  try {
    const [response, apiResponse] = await Promise.all([
      getTokenInfo(address, provider, CHAIN_METADATA[network].nativeCurrency),
      fetchTokenData(address, apolloClient, network),
    ]);

    return {
      amount: Number(formatUnits(decoded.amount, response.decimals)),
      name: 'withdraw_assets',
      to: decoded.recipientAddressOrEns,
      tokenBalance: 0, // unnecessary?
      tokenAddress: address,
      tokenImgUrl: apiResponse?.imgUrl || '',
      tokenName: response.name,
      tokenPrice: apiResponse?.price || 0,
      tokenSymbol: response.symbol,
      isCustomToken: false,
    };
  } catch (error) {
    console.error('Error fetching token data', error);
  }
}

/**
 * decodeAddMembersToAction
 * @param data Uint8Array action data
 * @param client SDK AddressListClient, Fetched using usePluginClient
 * @returns Return Decoded AddMembers action
 */
export async function decodeMintTokensToAction(
  data: Uint8Array[] | undefined,
  client: TokenVotingClient | undefined,
  daoTokenAddress: Address,
  provider: providers.Provider,
  network: SupportedNetworks
): Promise<ActionMintToken | undefined> {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  try {
    // get token info
    const {totalSupply, symbol, decimals} = await getTokenInfo(
      daoTokenAddress,
      provider,
      CHAIN_METADATA[network].nativeCurrency
    );

    // decode and calculate new tokens count
    let newTokens = BigNumber.from(0);

    const decoded = data.map(action => {
      // decode action
      const {amount, address}: IMintTokenParams =
        client.decoding.mintTokenAction(action);

      // update new tokens count
      newTokens = newTokens.add(amount);
      return {address, amount: Number(formatUnits(amount, decimals))};
    });

    //TODO: That's technically not correct. The minting could go to addresses who already hold that token.
    return Promise.resolve({
      name: 'mint_tokens',
      inputs: {
        mintTokensToWallets: decoded,
      },
      summary: {
        newTokens: Number(formatUnits(newTokens, decimals)),
        tokenSupply: parseFloat(formatUnits(totalSupply, decimals)),
        newHoldersCount: decoded.length,
        daoTokenSymbol: symbol,
        daoTokenAddress: daoTokenAddress,
      },
    });
  } catch (error) {
    console.error('Error decoding mint token action', error);
  }
}

/**
 * decodeAddMembersToAction
 * @param data Uint8Array action data
 * @param client SDK MultisigClient, Fetched using usePluginClient
 * @returns Return Decoded AddMembers action
 */
export async function decodeAddMembersToAction(
  data: Uint8Array | undefined,
  client: MultisigClient | undefined
): Promise<ActionAddAddress | undefined> {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  const addresses: {
    address: Address;
  }[] = client.decoding.addAddressesAction(data)?.map(address => ({
    address,
  }));

  return Promise.resolve({
    name: 'add_address',
    inputs: {
      memberWallets: addresses,
    },
  });
}

/**
 * decodeRemoveMembersToAction
 * @param data Uint8Array action data
 * @param client SDK MultisigClient, Fetched using usePluginClient
 * @returns Return Decoded RemoveMembers action
 */
export async function decodeRemoveMembersToAction(
  data: Uint8Array | undefined,
  client: MultisigClient | undefined
): Promise<ActionRemoveAddress | undefined> {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }
  const addresses: {
    address: Address;
  }[] = client.decoding.removeAddressesAction(data)?.map(address => ({
    address,
  }));

  return Promise.resolve({
    name: 'remove_address',
    inputs: {
      memberWallets: addresses,
    },
  });
}

/**
 * Decode update plugin settings action
 * @param data Uint8Array action data
 * @param client SDK AddressList or Erc20 client
 * @returns decoded action
 */
export async function decodePluginSettingsToAction(
  data: Uint8Array | undefined,
  client: TokenVotingClient | undefined,
  totalVotingWeight: bigint,
  token?: Erc20TokenDetails
): Promise<ActionUpdatePluginSettings | undefined> {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  return {
    name: 'modify_token_voting_settings',
    inputs: {
      ...client.decoding.updatePluginSettingsAction(data),
      token,
      totalVotingWeight,
    },
  };
}

export function decodeMultisigSettingsToAction(
  data: Uint8Array | undefined,
  client: MultisigClient
): ActionUpdateMultisigPluginSettings | undefined {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  return {
    name: 'modify_multisig_voting_settings',
    inputs: client.decoding.updateMultisigVotingSettings(data),
  };
}

/**
 * Decode update DAO metadata settings action
 * @param data Uint8Array action data
 * @param client SDK plugin-agnostic client
 * @returns decoded action
 */
export async function decodeMetadataToAction(
  data: Uint8Array | undefined,
  client: Client | undefined
): Promise<ActionUpdateMetadata | undefined> {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  try {
    const decodedMetadata = await client.decoding.updateDaoMetadataAction(data);

    return {
      name: 'modify_metadata',
      inputs: decodedMetadata,
    };
  } catch (error) {
    console.error('Error decoding update dao metadata action', error);
  }
}

const FLAG_TYPED_ARRAY = 'FLAG_TYPED_ARRAY';
/**
 *  Custom serializer that includes fix for BigInt type
 * @param _ key; unused
 * @param value value to serialize
 * @returns serialized value
 */
export const customJSONReplacer = (_: string, value: unknown) => {
  // uint8array (encoded actions)
  if (value instanceof Uint8Array) {
    return {
      data: [...value],
      flag: FLAG_TYPED_ARRAY,
    };
  }

  // bigint
  if (typeof value === 'bigint') return `${value.toString()}n`;

  return value;
};

/**
 * Custom function to deserialize values, including Date and BigInt types
 * @param _ key: unused
 * @param value value to deserialize
 * @returns deserialized value
 */
// disabling so forced assertion is not necessary in try catch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customJSONReviver = (_: string, value: any) => {
  // deserialize uint8array
  if (value.flag === FLAG_TYPED_ARRAY) {
    return new Uint8Array(value.data);
  }

  if (typeof value === 'string') {
    // BigInt
    if (BIGINT_PATTERN.test(value)) return BigInt(value.slice(0, -1));

    // Date
    if (ISO_DATE_PATTERN.test(value)) return new Date(value);
  }

  return value;
};

type DecodedVotingMode = {
  earlyExecution: boolean;
  voteReplacement: boolean;
};

export function decodeVotingMode(mode: VotingMode): DecodedVotingMode {
  return {
    // Note: This implies that earlyExecution and voteReplacement may never be
    // both true at the same time, as they shouldn't.
    earlyExecution: mode === VotingMode.EARLY_EXECUTION,
    voteReplacement: mode === VotingMode.VOTE_REPLACEMENT,
  };
}

/**
 * Get DAO avatar url given avatar IPFS cid
 * @param avatar - IPFS cid for DAO avatar
 * @returns the url to the DAO avatar
 */
export function resolveDaoAvatarIpfsCid(avatar?: string): string | undefined {
  if (avatar) {
    try {
      const logoCid = resolveIpfsCid(avatar);
      return `https://ipfs.io/ipfs/${logoCid}`;
    } catch (err) {
      console.warn('Error resolving DAO avatar IPFS Cid', err);
    }
  }
}
