// Library utils / Ethers for now
import {ApolloClient} from '@apollo/client';
import {
  Client,
  DaoDetails,
  Erc20TokenDetails,
  MintTokenParams,
  MultisigClient,
  MultisigVotingSettings,
  Context as SdkContext,
  TokenVotingClient,
  VotingMode,
} from '@aragon/sdk-client';
import {fetchEnsAvatar} from '@wagmi/core';

import {
  DaoAction,
  SupportedNetwork as SdkSupportedNetworks,
} from '@aragon/sdk-client-common';
import {bytesToHex, resolveIpfsCid} from '@aragon/sdk-common';
import {NavigationDao} from 'context/apolloClient';
import {BigNumber, BigNumberish, constants, ethers, providers} from 'ethers';
import {TFunction} from 'react-i18next';

import {hexlify, isAddress} from 'ethers/lib/utils';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {fetchTokenData} from 'services/prices';
import {
  BIGINT_PATTERN,
  CHAIN_METADATA,
  ETH_TRANSACTION_CALL_LABEL,
  ISO_DATE_PATTERN,
  PERSONAL_SIGH_BYTES,
  PERSONAL_SIGH_SIGNATURE,
  PERSONAL_SIGN_LABEL,
  SupportedNetworks,
} from 'utils/constants';
import {
  Action,
  ActionAddAddress,
  ActionExternalContract,
  ActionMintToken,
  ActionRemoveAddress,
  ActionUpdateMetadata,
  ActionUpdateMultisigPluginSettings,
  ActionUpdatePluginSettings,
  ActionWithdraw,
  ExternalActionInput,
  Input,
} from 'utils/types';
import {i18n} from '../../i18n.config';
import {addABI, decodeMethod} from './abiDecoder';
import {attachEtherNotice} from './contract';
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

  const tokenAddress =
    decoded.type === 'native' ? constants.AddressZero : decoded?.tokenAddress;

  try {
    const recipient = await Web3Address.create(
      provider,
      decoded.recipientAddressOrEns
    );

    const [tokenInfo] = await Promise.all([
      getTokenInfo(
        tokenAddress,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      ),
    ]);

    const apiResponse = await fetchTokenData(
      tokenAddress,
      apolloClient,
      network,
      tokenInfo.symbol
    );

    return {
      amount: Number(formatUnits(decoded.amount, tokenInfo.decimals)),
      name: 'withdraw_assets',
      to: recipient,
      tokenBalance: 0, // unnecessary?
      tokenAddress: tokenAddress,
      tokenImgUrl: apiResponse?.imgUrl || '',
      tokenName: tokenInfo.name,
      tokenPrice: apiResponse?.price || 0,
      tokenSymbol: tokenInfo.symbol,
      tokenDecimals: tokenInfo.decimals,
      isCustomToken: false,
    };
  } catch (error) {
    console.error('Error decoding withdraw action', error);
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
  daoTokenAddress: string,
  totalVotingWeight: bigint,
  provider: providers.Provider,
  network: SupportedNetworks
): Promise<ActionMintToken | undefined> {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  try {
    // get token info
    const {symbol, decimals} = await getTokenInfo(
      daoTokenAddress,
      provider,
      CHAIN_METADATA[network].nativeCurrency
    );

    // decode and calculate new tokens count
    let newTokens = BigNumber.from(0);

    const decoded = data.map(action => {
      // decode action
      const {amount, address}: MintTokenParams =
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
        tokenSupply: parseFloat(formatUnits(totalVotingWeight, decimals)),
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

  const addresses = client.decoding.addAddressesAction(data)?.map(address => ({
    address,
    ensName: '',
  }));

  return Promise.resolve({
    name: 'add_address',
    inputs: {memberWallets: addresses},
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
  const addresses = client.decoding
    .removeAddressesAction(data)
    ?.map(address => ({
      address,
      ensName: '',
    }));

  return Promise.resolve({
    name: 'remove_address',
    inputs: {memberWallets: addresses},
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

/**
 * Decodes the provided DAO action into an external action
 * (SCC or Wallet Connect).
 *
 * @param action - A DAO action to decode.
 * @param network - The network on which the action is to be performed.
 *
 * @returns A promise that resolves to the decoded action
 * or undefined if the action could not be decoded.
 */
export async function decodeToExternalAction(
  action: DaoAction,
  daoAddress: string,
  network: SupportedNetworks,
  t: TFunction
): Promise<ActionExternalContract | undefined> {
  try {
    const etherscanData = await getEtherscanVerifiedContract(
      action.to,
      network
    );

    // Check if the contract data was fetched successfully and if the contract has a verified source code
    if (
      etherscanData.status === '1' &&
      etherscanData.result[0].ABI !== 'Contract source code not verified'
    ) {
      addABI(JSON.parse(etherscanData.result[0].ABI));
      const decodedData = decodeMethod(bytesToHex(action.data));

      // Check if the action data was decoded successfully
      if (decodedData) {
        const notices = attachEtherNotice(
          etherscanData.result[0].SourceCode,
          etherscanData.result[0].ContractName,
          JSON.parse(etherscanData.result[0].ABI)
        ).find(notice => notice.name === decodedData.name);

        const inputs: ExternalActionInput[] = decodedData.params.map(param => {
          return {
            ...param,
            notice: notices?.inputs.find(
              // multiple inputs may have the same name
              notice => notice.name === param.name && notice.type === param.type
            )?.notice,
          };
        });

        if (BigNumber.from(action.value).gt(0)) {
          inputs.push({
            ...getDefaultPayableAmountInput(t, network),
            type: 'string',
            value: `${formatUnits(
              BigNumber.from(action.value),
              CHAIN_METADATA[network].nativeCurrency.decimals
            )} ${CHAIN_METADATA[network].nativeCurrency.symbol}`,
          } as ExternalActionInput);
        }

        return {
          name: 'wallet_connect_action',
          contractAddress: action.to,
          contractName: etherscanData.result[0].ContractName,
          functionName: decodedData.name,
          inputs,
          verified: true,
          decoded: true,
          notice: notices?.notice,
        };
      } else {
        // verified but unable to be decoded
        return {
          name: 'wallet_connect_action',
          contractAddress: action.to,
          contractName: etherscanData.result[0].ContractName,
          functionName: getWCEncodedFunctionName(action, daoAddress),
          inputs: getEncodedActionInputs(action, network, t),
          verified: true,
          decoded: false,
        };
      }
    } else {
      return {
        name: 'wallet_connect_action',
        contractAddress: action.to,
        contractName: action.to,
        functionName: getWCEncodedFunctionName(action, daoAddress),
        verified: false,
        decoded: false,
        inputs: getEncodedActionInputs(action, network, t),
      };
    }
  } catch (error) {
    console.error('Failed to decode external contract action:', error);
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
 * Get DAO resolved IPFS CID URL for the DAO avatar
 * @param avatar - avatar to be resolved. If it's an IPFS CID,
 * the function will return a fully resolved URL.
 * @returns the url to the DAO avatar
 */
export function resolveDaoAvatarIpfsCid(
  network: SupportedNetworks,
  avatar?: string
): string | undefined {
  if (avatar) {
    if (/^ipfs/.test(avatar)) {
      try {
        const logoCid = resolveIpfsCid(avatar);
        return `${CHAIN_METADATA[network].ipfs}/ipfs/${logoCid}`;
      } catch (err) {
        console.warn('Error resolving DAO avatar IPFS Cid', err);
      }
    } else {
      return avatar;
    }
  }
}

export function readFile(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result as ArrayBuffer);
    };
    fr.onerror = reject;
    fr.readAsArrayBuffer(file);
  });
}

/**
 * Map a detailed DAO to a structure that can be favorited
 * @param dao - Detailed DAO fetched from SDK
 * @param network - network on which this DAO resides
 * @returns the DAO in it's favorited form
 */
export function mapDetailedDaoToFavoritedDao(
  dao: DaoDetails,
  network: SupportedNetworks
): NavigationDao {
  return {
    address: dao.address.toLocaleLowerCase(),
    chain: CHAIN_METADATA[network].id,
    ensDomain: dao.ensDomain,
    plugins: dao.plugins,
    metadata: {
      name: dao.metadata.name,
      avatar: dao.metadata.avatar,
      description: dao.metadata.description,
    },
  };
}

/**
 * Filters out action containing unchanged min approvals
 * @param actions form actions
 * @param pluginSettings DAO plugin settings
 * @returns list of actions without update plugin settings action
 * if Multisig DAO minimum approvals did not change
 */
export function removeUnchangedMinimumApprovalAction(
  actions: Action[],
  pluginSettings: MultisigVotingSettings
) {
  return actions.flatMap(action => {
    if (
      action.name === 'modify_multisig_voting_settings' &&
      Number(action.inputs.minApprovals) === pluginSettings.minApprovals
    )
      return [];
    else return action;
  });
}

/**
 * Sleep for given time before continuing
 * @param time time in milliseconds
 */
export function sleepFor(time = 600) {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * Maps SDK network name to app network context network name
 * @param sdkNetwork supported network returned by the SDK
 * @returns translated equivalent app supported network
 */
export const translateToAppNetwork = (
  sdkNetwork: SdkContext['network']
): SupportedNetworks => {
  switch (sdkNetwork.name) {
    case 'homestead':
      return 'ethereum';
    case 'goerli':
      return 'goerli';
    case 'maticmum':
      return 'mumbai';
    case 'matic':
      return 'polygon';
  }
  return 'unsupported';
};

/**
 * Maps app network context name to SDK network name
 * @param appNetwork supported network returned by the network context
 * @returns translated equivalent SDK supported network
 */
export function translateToNetworkishName(
  appNetwork: SupportedNetworks
): SdkSupportedNetworks | 'unsupported' {
  if (typeof appNetwork !== 'string') {
    return 'unsupported';
  }

  switch (appNetwork) {
    case 'polygon':
      return SdkSupportedNetworks.POLYGON;
    case 'mumbai':
      return SdkSupportedNetworks.MUMBAI;
    case 'ethereum':
      return SdkSupportedNetworks.MAINNET;
    case 'goerli':
      return SdkSupportedNetworks.GOERLI;
  }

  return 'unsupported';
}

/**
 * display ens names properly
 * @param ensName ens name
 * @returns ens name or empty string if ens name is null.dao.eth
 */
export function toDisplayEns(ensName?: string) {
  if (!ensName || ensName === 'null.dao.eth') return '';

  if (!ensName.includes('.dao.eth')) return `${ensName}.dao.eth`;
  return ensName;
}

export function getDefaultPayableAmountInput(
  t: TFunction,
  network: SupportedNetworks
): Input {
  return {
    name: getDefaultPayableAmountInputName(t),
    type: 'uint256',
    notice: t('scc.inputPayableAmount.description', {
      tokenSymbol: CHAIN_METADATA[network].nativeCurrency.symbol,
    }),
  };
}

export function getDefaultPayableAmountInputName(t: TFunction) {
  return t('scc.inputPayableAmount.label');
}

export function getWCNativeToField(
  t: TFunction,
  value: string,
  network: SupportedNetworks
) {
  return {
    name: t('newProposal.configureActionsEncoded.inputValueLabel'),
    type: 'string',
    notice: t('newProposal.configureActionsEncoded.inputValueDesc'),
    value: `${formatUnits(
      BigNumber.from(value),
      CHAIN_METADATA[network].nativeCurrency.decimals
    )} ${CHAIN_METADATA[network].nativeCurrency.symbol}`,
  };
}

export function getEncodedActionInputs(
  action: DaoAction,
  network: SupportedNetworks,
  t: TFunction
) {
  return Object.keys(action).flatMap(fieldName => {
    switch (fieldName) {
      case 'value':
        return getWCNativeToField(t, action.value.toString(), network);
      case 'to':
        return {
          name: t('newProposal.configureActionsEncoded.inputDestLabel'),
          type: 'address',
          notice: t('newProposal.configureActionsEncoded.inputDestDesc'),
          value: action[fieldName],
        };

      case 'data':
        return {
          name: t('newProposal.configureActionsEncoded.inputDataLabel'),
          type: 'encodedData',
          notice: t('newProposal.configureActionsEncoded.inputDataDesc'),
          value: action[fieldName],
        };
      default:
        return [];
    }
  });
}

/**
 * Gets the encoded function name for a given string action or name.
 *
 * @param name - The name to prettify.
 * @returns The encoded function name.
 * @throws {Error} When the input `name` is not a valid string action or name.
 */
export function getWCEncodedFunctionName(name: string): string;

/**
 * Gets the encoded function name for a given DaoAction object.
 *
 * @param action - The DaoAction object for which to get the encoded function name.
 * @param daoAddress - The address of the Dao associated with the action.
 * @returns The encoded function name.
 * @throws {Error} When `daoAddress` is not provided.
 */
export function getWCEncodedFunctionName(
  action: DaoAction,
  daoAddress: string
): string;

/**
 * Gets the encoded function name for a given action or name.
 * If `actionOrName` is a string, the `daoAddress` parameter is not required.
 * If `actionOrName` is a DaoAction object, the `daoAddress` parameter is mandatory.
 *
 * @param actionOrName - The action object or name for which to get the encoded function name.
 * @param daoAddress - The address of the Dao when `actionOrName` is a DaoAction object.
 * @returns The encoded function name.
 * @throws {Error} When `actionOrName` is a DaoAction and `daoAddress` is not provided.
 * @throws {Error} When `actionOrName` is not a valid string action or name.
 */
export function getWCEncodedFunctionName(
  actionOrName: DaoAction | string,
  daoAddress?: string
): string {
  // handle string name
  if (typeof actionOrName === 'string') {
    if (actionOrName === 'eth_sendTransaction') {
      return ETH_TRANSACTION_CALL_LABEL;
    } else {
      return PERSONAL_SIGN_LABEL;
    }
  } else {
    // handle DaoAction
    if (!daoAddress) {
      throw new Error(
        'daoAddress is required when actionOrName is a DaoAction'
      );
    }

    // Note: unless the data field is decoded, we are never 100% sure of what the
    // method name is, but these checks can help determine whether the transaction
    // is a personal_sign or eth_call (the only ones supported by the current wc interceptor)
    const {to, data} = actionOrName;

    // the encoded message hash for personal_sign call is 32 bytes
    const isPersonalSignLength = data.length === PERSONAL_SIGH_BYTES;

    const isPersonalSignSignature =
      hexlify(data).slice(0, 10) === PERSONAL_SIGH_SIGNATURE;

    // the 'to' field of the personal_sign call is usually the wallet address or set to '0x'
    const toIsEmptyOrOwnAddress =
      to.toLowerCase() === daoAddress.toLowerCase() || to === '0x';

    return isPersonalSignLength &&
      toIsEmptyOrOwnAddress &&
      isPersonalSignSignature
      ? PERSONAL_SIGN_LABEL
      : ETH_TRANSACTION_CALL_LABEL;
  }
}

export class Web3Address {
  // Declare private fields to hold the address, ENS name and the Ethereum provider
  private _address: string | null;
  private _ensName: string | null;
  private _provider?: providers.Provider;
  private _avatar?: string | null;

  // Constructor for the Address class
  constructor(
    provider?: ethers.providers.Provider,
    address?: string,
    ensName?: string
  ) {
    // Initialize the provider, address and ENS name
    this._provider = provider;
    this._address = address || null;
    this._ensName = ensName || null;
  }

  // Static method to create an Address instance
  static async create(
    provider?: providers.Provider,
    addressOrEns?: {address?: string; ensName?: string} | string
  ) {
    // Determine whether we are dealing with an address, an ENS name or an object containing both
    let addressToSet: string | undefined;
    let ensNameToSet: string | undefined;
    if (typeof addressOrEns === 'string') {
      // If input is a string, treat it as address if it matches address structure, else treat as ENS name
      if (ethers.utils.isAddress(addressOrEns)) {
        addressToSet = addressOrEns;
      } else {
        ensNameToSet = addressOrEns;
      }
    } else {
      addressToSet = addressOrEns?.address;
      ensNameToSet = addressOrEns?.ensName;
    }

    // If no provider is given and no address is provided, throw an error
    if (!provider && !addressToSet) {
      throw new Error('If no provider is given, address must be provided');
    }

    // Create a new Address instance
    const addressObj = new Web3Address(provider, addressToSet, ensNameToSet);

    // If a provider is available, try to resolve the missing piece (address or ENS name)
    try {
      if (provider) {
        if (addressToSet && !ensNameToSet) {
          ensNameToSet =
            (await provider.lookupAddress(addressToSet)) ?? undefined;
          if (ensNameToSet) {
            addressObj._ensName = ensNameToSet;
          }
        } else if (!addressToSet && ensNameToSet) {
          addressToSet =
            (await provider.resolveName(ensNameToSet)) ?? undefined;
          if (addressToSet) {
            addressObj._address = addressToSet;
          }
        }

        if (addressObj._ensName) {
          // fetch avatar
          const chainId = (await provider.getNetwork()).chainId;
          addressObj._avatar = await fetchEnsAvatar({
            name: addressObj._ensName,
            chainId,
          });
        }
      }

      // Return the Address instance
      return addressObj;
    } catch (error) {
      throw new Error(
        `Failed to create Web3Address: ${(error as Error).message}`
      );
    }
  }

  // Method to check if the stored address is valid
  isAddressValid(): boolean {
    if (!this._address) {
      return false;
    }
    return ethers.utils.isAddress(this._address);
  }

  // Method to check if the stored ENS name is valid (resolves to an address)
  async isValidEnsName(): Promise<boolean> {
    if (!this._provider || !this._ensName) {
      return false;
    }
    const address = await this._provider.resolveName(this._ensName);
    return !!address;
  }

  // Getter for the address
  get address() {
    return this._address;
  }

  // Getter for the ENS name
  get ensName() {
    return this._ensName;
  }

  // Getter for the avatar
  get avatar() {
    return this._avatar;
  }

  display(
    options: {
      shorten: boolean;
      prioritize: 'ensName' | 'address';
    } = {
      shorten: false,
      prioritize: 'ensName',
    }
  ) {
    return options.prioritize === 'ensName'
      ? String(
          this._ensName || options.shorten
            ? shortenAddress(this._address)
            : this._address
        )
      : String(this._address || this._ensName);
  }

  toString() {
    return {address: this._address, ensName: this.ensName};
  }

  isEqual(valueToCompare: Web3Address | {address: string; ensName: string}) {
    return (
      valueToCompare.address === this._address &&
      valueToCompare.ensName === this._ensName
    );
  }
}

export function shortenAddress(address: string | null) {
  if (address === null) return '';
  if (isAddress(address))
    return (
      address.substring(0, 5) +
      '…' +
      address.substring(address.length - 4, address.length)
    );
  else return address;
}

export function capitalizeFirstLetter(str: string) {
  if (typeof str !== 'string' || str.length === 0) {
    return str; // Return the input if it's not a string or an empty string
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}
