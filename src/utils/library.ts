import {
  Client,
  DaoUpdateDecodedParams,
  Erc20TokenDetails,
  MintTokenParams,
  MultisigClient,
  MultisigVotingSettings,
  Context as SdkContext,
  TokenVotingClient,
  VotingMode,
  WithdrawParams,
} from '@aragon/sdk-client';
import {
  DaoAction,
  DecodedApplyUpdateParams,
  LIVE_CONTRACTS,
  SupportedNetwork as SdkSupportedNetworks,
  SupportedNetworksArray,
  SupportedVersion,
  bytesToHex,
  resolveIpfsCid,
} from '@aragon/sdk-client-common';
import {fetchEnsAvatar} from '@wagmi/core';
import {BigNumber, BigNumberish, constants, ethers, providers} from 'ethers';
import {
  formatUnits as ethersFormatUnits,
  hexlify,
  isAddress,
} from 'ethers/lib/utils';
import {TFunction} from 'i18next';

import {daoFactoryABI} from 'abis/daoFactoryABI';
import {MultisigWalletField} from 'components/multisigWallets/row';
import {PluginTypes} from 'hooks/usePluginClient';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {Token} from 'services/token/domain';
import {IFetchTokenParams} from 'services/token/token-service.api';
import {
  BIGINT_PATTERN,
  CHAIN_METADATA,
  ETH_TRANSACTION_CALL_LABEL,
  ISO_DATE_PATTERN,
  PERSONAL_SIGN_BYTES,
  PERSONAL_SIGN_LABEL,
  PERSONAL_SIGN_SIGNATURE,
  SupportedNetworks,
} from 'utils/constants';
import {
  Action,
  ActionAddAddress,
  ActionExternalContract,
  ActionMintToken,
  ActionRemoveAddress,
  ActionSCC,
  ActionUpdateMetadata,
  ActionUpdateMultisigPluginSettings,
  ActionUpdatePluginSettings,
  ActionWithdraw,
  ExternalActionInput,
  Input,
} from 'utils/types';
import {i18n} from '../../i18n.config';
import {Abi, addABI, decodeMethod} from './abiDecoder';
import {attachEtherNotice} from './contract';
import {getTokenInfo} from './tokens';
import {daoABI} from 'abis/daoABI';

export function formatUnits(amount: BigNumberish, decimals: number) {
  if (amount.toString().includes('.') || !decimals) {
    return amount.toString();
  }
  return ethersFormatUnits(amount, decimals);
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
 * @param provider Eth provider
 * @param network network of the dao
 * @returns Return Decoded Withdraw action
 */
export async function decodeWithdrawToAction(
  data: Uint8Array | undefined,
  client: Client | undefined,
  provider: providers.Provider,
  network: SupportedNetworks,
  to: string,
  value: bigint,
  fetchToken: (params: IFetchTokenParams) => Promise<Token | null>
): Promise<ActionWithdraw | undefined> {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  // FIXME remove custom type when NFT withdraws are supported
  type DecodedWithdraw = WithdrawParams & {amount?: bigint};
  const decoded = client.decoding.withdrawAction(
    to,
    value,
    data
  ) as DecodedWithdraw;

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

    const apiResponse = await fetchToken({
      address: tokenAddress,
      network,
      symbol: tokenInfo.symbol,
    });

    return {
      amount: Number(formatUnits(decoded.amount ?? '0', tokenInfo.decimals)),
      name: 'withdraw_assets',
      to: recipient,
      tokenBalance: 0, // unnecessary?
      tokenAddress: tokenAddress,
      tokenImgUrl: apiResponse?.imgUrl ?? '',
      tokenName: tokenInfo.name,
      tokenPrice: apiResponse?.price ?? 0,
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
    //@sepehr2github is there any reason why we don't just pass
    // the token info into this function
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
      return {
        web3Address: {
          address,
          ensName: '',
        },
        amount: Number(formatUnits(amount, decimals)),
      };
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
/**
 * Decodes a DAO action to an external contract action (SCC or Wallet Connect).
 * @param action - DAO action to decode.
 * @param daoAddress - The address of the DAO.
 * @param network - Supported network.
 * @param t - Translation function.
 * @param ABI - Array of ABI definitions used instead of the one fetched via the block scan API.
 * @param bypassAddress - Optional address used in the place of the `to` value of the action.
 * @returns Promise resolving to the decoded external contract action or undefined.
 */
export async function decodeToExternalAction(
  action: DaoAction,
  daoAddress: string,
  network: SupportedNetworks,
  t: TFunction,
  ABI?: Abi[],
  bypassAddress?: string
): Promise<ActionExternalContract | undefined> {
  try {
    const etherscanData = await getEtherscanVerifiedContract(
      bypassAddress ?? action.to,
      network
    );

    // Check if the contract data was fetched successfully and if the contract has a verified source code
    if (
      (etherscanData.status === '1' &&
        etherscanData.result[0].ABI !== 'Contract source code not verified') ||
      ABI
    ) {
      const contractAbi = ABI ?? JSON.parse(etherscanData.result[0].ABI);

      addABI(contractAbi);
      const decodedData = decodeMethod(bytesToHex(action.data));

      // Check if the action data was decoded successfully
      if (decodedData) {
        const notices = attachEtherNotice(
          etherscanData.result[0].SourceCode,
          etherscanData.result[0].ContractName,
          contractAbi
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

/**
 * Decodes OS update actions for a DAO to external contract action in
 * order to display the properties in the generic action card.
 *
 * @param daoAddress - The address of the DAO.
 * @param t - Translation function.
 * @param encodedAction - Encoded DAO action.
 * @param network - Supported network.
 * @param provider - Ethers provider.
 * @returns Promise resolving to the decoded external action.
 */
export async function decodeOSUpdateActions(
  daoAddress: string,
  t: TFunction,
  encodedAction: DaoAction,
  network: SupportedNetworks,
  provider: ethers.providers.Provider
) {
  const translatedNetwork = translateToNetworkishName(network ?? 'unsupported');

  if (translatedNetwork !== 'unsupported') {
    const {daoFactoryAddress} =
      LIVE_CONTRACTS[SupportedVersion.LATEST][translatedNetwork];

    let daoImplementationAddress: string | undefined;

    try {
      // interact with the DAO Factory to get the proxy's implementation address
      const contract = new ethers.Contract(
        daoFactoryAddress,
        daoFactoryABI,
        provider
      );

      daoImplementationAddress = await contract.daoBase();
    } catch (error) {
      console.error(
        'Error fetching the DAO base implementation address',
        error
      );
    }

    return decodeToExternalAction(
      encodedAction,
      daoAddress,
      network,
      t,
      daoImplementationAddress ? undefined : daoABI,
      daoImplementationAddress
    );
  }
}

/**
 * Decodes the OS update action and prepares data for an external contract action.
 * @param encodedAction The encoded action to decode.
 * @param client The client instance used for decoding.
 * @returns ActionSCC object representing the decoded action, or undefined if decoding fails.
 */
export function decodeUpgradeToAndCallAction(
  encodedAction: DaoAction | undefined,
  client: Client | undefined
) {
  if (!client) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  if (!encodedAction) return;

  try {
    const decoded: DaoUpdateDecodedParams = client.decoding.daoUpdateAction(
      encodedAction.data
    );

    const inputs = entriesToExternalContractActionProps(decoded);
    const functionName =
      client.decoding.findInterface(encodedAction.data)?.functionName ??
      'upgradeToAndCall';

    return {
      name: 'external_contract_action',
      functionName,
      contractName: 'DAO',
      contractAddress: encodedAction.to,
      inputs,
    } as ActionSCC;
  } catch (error) {
    console.error(
      'decodeOsUpdateAction: failed to decode os_update action',
      error
    );
  }
}

/**
 * Decodes an encoded DaoAction and generates an ActionSCC for applying updates
 * for a plugin
 * @param encodedAction - Encoded DaoAction containing data to decode.
 * @param client - Initialized Client instance required for decoding.
 * @returns ActionSCC or logs errors if decoding fails or client is not initialized.
 */
export function decodeApplyUpdateAction(
  encodedAction: DaoAction,
  client: Client | undefined
) {
  if (!client) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  if (!encodedAction) return;

  try {
    const decoded: DecodedApplyUpdateParams = client.decoding.applyUpdateAction(
      encodedAction.data
    );

    const inputs = entriesToExternalContractActionProps(decoded);
    const functionName =
      client.decoding.findInterface(encodedAction.data)?.functionName ??
      'applyUpdate';

    return {
      name: 'external_contract_action',
      functionName,
      contractName: 'PluginSetupProcessor',
      contractAddress: encodedAction.to,
      inputs,
    } as ActionSCC;
  } catch (error) {
    console.error(
      'decodeApplyUpdateAction: failed to decode apply_update action',
      error
    );
  }
}

/**
 * Transforms entries of an object into an array of external action properties
 * @param decoded - The object whose entries are to be transformed.
 * @returns An array of objects with name, type, and value properties.
 */
function entriesToExternalContractActionProps(decoded: object) {
  if (decoded != null && typeof decoded === 'object') {
    return Object.entries(decoded).map(([key, value]) => {
      let displayedValue = value;
      let displayedType = typeof value as string;

      if (typeof value === 'object' && Object.keys(value).length === 0) {
        displayedValue = ' ';
      } else if (typeof value === 'string') {
        displayedType = 'address';
      }

      return {name: key, type: displayedType, value: displayedValue};
    });
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
export async function resolveDaoAvatarIpfsCid(
  client: Client | undefined,
  avatar?: string | Blob
): Promise<string | undefined> {
  if (avatar) {
    if (typeof avatar !== 'string') {
      return URL.createObjectURL(avatar);
    } else if (/^ipfs/.test(avatar) && client) {
      try {
        const cid = resolveIpfsCid(avatar);
        const ipfsClient = client.ipfs.getClient();
        const imageBytes = await ipfsClient.cat(cid); // Uint8Array
        const imageBlob = new Blob([imageBytes] as unknown as BlobPart[]);

        return URL.createObjectURL(imageBlob);
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
  switch (sdkNetwork.name as SdkSupportedNetworks) {
    case SdkSupportedNetworks.ARBITRUM:
      return 'arbitrum';
    case SdkSupportedNetworks.ARBITRUM_GOERLI:
      return 'arbitrum-goerli';
    case SdkSupportedNetworks.BASE:
      return 'base';
    case SdkSupportedNetworks.BASE_GOERLI:
      return 'base-goerli';
    case SdkSupportedNetworks.MAINNET:
      return 'ethereum';
    case SdkSupportedNetworks.GOERLI:
      return 'goerli';
    case SdkSupportedNetworks.MUMBAI:
      return 'mumbai';
    case SdkSupportedNetworks.POLYGON:
      return 'polygon';
    default:
      return 'unsupported';
  }
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
    case 'arbitrum':
      return SdkSupportedNetworks.ARBITRUM;
    case 'arbitrum-goerli':
      return SdkSupportedNetworks.ARBITRUM_GOERLI;
    case 'base':
      return SdkSupportedNetworks.BASE;
    case 'base-goerli':
      return SdkSupportedNetworks.BASE_GOERLI;
    case 'ethereum':
      return SdkSupportedNetworks.MAINNET;
    case 'goerli':
      return SdkSupportedNetworks.GOERLI;
    case 'mumbai':
      return SdkSupportedNetworks.MUMBAI;
    case 'polygon':
      return SdkSupportedNetworks.POLYGON;
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
    const isPersonalSignLength = data.length === PERSONAL_SIGN_BYTES;

    const isPersonalSignSignature =
      hexlify(data).slice(0, 10) === PERSONAL_SIGN_SIGNATURE;

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
    provider?: providers.Provider,
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
      if (isAddress(addressOrEns)) {
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
    const addressObj = new Web3Address(
      provider,
      addressToSet?.toLowerCase(),
      ensNameToSet?.toLowerCase()
    );

    // If a provider is available, try to resolve the missing piece (address or ENS name)
    try {
      if (provider) {
        if (addressToSet && !ensNameToSet) {
          ensNameToSet =
            (await provider.lookupAddress(addressToSet)) ?? undefined;
          if (ensNameToSet) {
            addressObj._ensName = ensNameToSet.toLowerCase();
          }
        } else if (!addressToSet && ensNameToSet) {
          addressToSet =
            (await provider.resolveName(ensNameToSet)) ?? undefined;
          if (addressToSet) {
            addressObj._address = addressToSet.toLowerCase();
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
      // this means we've an issue fetching ens related data; return
      // the provided instance regardless
      console.warn('Error resolving ENS subdomain or avatar');
      return addressObj;
    }
  }

  // Method to check if the stored address is valid
  isAddressValid(): boolean {
    if (!this._address) {
      return false;
    }
    return isAddress(this._address);
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

  toString() {
    return {address: this._address, ensName: this.ensName};
  }
}

export function shortenAddress(address: string | null) {
  if (address === null) return '';
  if (isAddress(address))
    return (
      address.substring(0, 6) +
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

/**
 * Parse WalletConnect icon URL
 *
 * This function is used to parse the icon URL coming from WalletConnect.
 * In case of SVG icons (e.g., Gnosis Safe), it extracts the href attribute value.
 * If the icon path is relative, it prepends it with the dApp URL.
 *
 * @export
 * @param dAppUrl - The URL of the dApp
 * @param icon - The icon URL or SVG string
 * @returns the parsed URL of the icon,
 * or the original icon value if no modifications were necessary.
 */
export function parseWCIconUrl(
  dAppUrl: string,
  icon: string | undefined
): string | undefined {
  let parsedUrl = icon;

  if (icon && icon.startsWith('<')) {
    const match = icon.match(/<image href="([^"]*)"/);
    if (match && match[1]) {
      parsedUrl = match[1];
    }
  }

  if (parsedUrl && parsedUrl.startsWith('/')) {
    parsedUrl = `${dAppUrl}${parsedUrl}`;
  }

  return parsedUrl;
}

/**
 * Checks if the given value exists (i.e., is neither undefined, null, nor an empty string).
 * Note: The number `0` is still considered a value by this function.
 *
 * @param value - The value to be checked.
 * @returns Returns true if the value exists and isn't an empty string, otherwise false.
 */
export function hasValue(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  return value !== undefined && value !== null;
}

export function clearWagmiCache(): void {
  localStorage.removeItem('wagmi.cache');
  localStorage.removeItem('wagmi.store');
  localStorage.removeItem('wagmi.wallet');
}

/**
 * Check if a wallet exists on a wallets list
 *
 * @param walletsList{MultisigWalletField[]} Wallets list where to look for
 * @param wallet{Web3Address} The wallet you want to find
 * @returns {boolean} true if the wallet exists on the wallets list
 */
export const walletInWalletList = (
  wallet: Web3Address,
  walletsList: MultisigWalletField[]
) =>
  walletsList?.some(
    w =>
      (w.address &&
        w.address.toLowerCase() === wallet.address?.toLowerCase()) ||
      (w.ensName && w.ensName.toLowerCase() === wallet.ensName?.toLowerCase())
  );

/**
 * Compares two version strings and returns a number indicating their order.
 * @param version1 - The first version string to compare.
 * @param version2 - The second version string to compare.
 * @returns A number indicating the order of the version strings:
 *          - 1 if version1 is greater than version2
 *          - -1 if version1 is less than version2
 *          - 0 if version1 is equal to version2
 */
export function compareVersions(version1: string, version2: string): boolean {
  if (!version1 || !version2) return false;

  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);

  for (let i = 0; i < v1.length; i++) {
    if (v1[i] > v2[i]) {
      return true;
    } else if (v1[i] < v2[i]) {
      return false;
    }
  }

  return false;
}

/**
 * Retrieves the repository address for a specific plugin type on a supported network and protocol version.
 * @param network - The supported network
 * @param pluginType - The type of plugin
 * @param protocolVersion - The protocol version as an array of three numbers.
 * @returns The repository address based on the provided parameters.
 */
export function getPluginRepoAddress(
  network: SupportedNetworks,
  pluginType: PluginTypes,
  protocolVersion: [number, number, number]
) {
  const translatedNetwork = translateToNetworkishName(network);
  if (
    translatedNetwork !== 'unsupported' &&
    SupportedNetworksArray.includes(translatedNetwork)
  ) {
    return pluginType === 'multisig.plugin.dao.eth'
      ? LIVE_CONTRACTS[protocolVersion?.join('.') as SupportedVersion]?.[
          translatedNetwork
        ].multisigRepoAddress
      : LIVE_CONTRACTS[protocolVersion?.join('.') as SupportedVersion]?.[
          translatedNetwork
        ].tokenVotingRepoAddress;
  }
}
