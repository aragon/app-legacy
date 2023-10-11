import {
  DaoMetadata,
  Erc20TokenDetails,
  MultisigProposal,
  MultisigProposalListItem,
  MultisigVotingSettings,
  TokenVotingProposal,
  TokenVotingProposalListItem,
  VoteValues,
  VotingSettings,
} from '@aragon/sdk-client';
import {VersionTag} from '@aragon/sdk-client-common';
import {BigNumber} from 'ethers';

import {InputValue} from '@aragon/ods';
import {TokenVotingWalletField} from 'components/addWallets/row';
import {MultisigWalletField} from 'components/multisigWallets/row';
import {TimeFilter, TransferTypes} from './constants';
import {Web3Address} from './library';
import {TokenType} from './validators';

/*************************************************
 *                 DAO Creation types            *
 *************************************************/
type DAOMembership = 'token' | 'multisig';
type ProposalCreationEligibility = 'token' | 'anyone' | 'multisig';
export type CreateDaoFormData = {
  blockchain: {
    id: number;
    label: string;
    network: string;
  };
  daoLogo: Blob;
  daoName: string;
  daoEnsName: string;
  daoSummary: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenTotalSupply: number;
  tokenTotalHolders: number | undefined;
  tokenType: TokenType;
  isCustomToken: boolean;
  links: {name: string; url: string}[];
  wallets: TokenVotingWalletField[];
  tokenAddress: InputValue;
  durationMinutes: string;
  durationHours: string;
  durationDays: string;
  minimumApproval: string;
  minimumParticipation: string;
  eligibilityType: ProposalCreationEligibility;
  eligibilityTokenAmount: number | string;
  support: string;
  membership: DAOMembership;
  earlyExecution: boolean;
  voteReplacement: boolean;
  multisigWallets: MultisigWalletField[];
  multisigMinimumApprovals: number;
};

/*************************************************
 *                   Finance types               *
 *************************************************/
/**
 * Token with basic information populated from external api and/or blockchain
 * Market information is not included
 */
export type BaseTokenInfo = {
  address: string;
  count: bigint;
  decimals: number;
  id?: string; // for api call, optional because custom tokens have no id
  imgUrl: string;
  name: string;
  symbol: string;
};

/** The balance for a token */
export type TokenBalance = {
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    price?: number;
  };
  balance: bigint;
};

/**
 * Token with basic information populated from external api and/or blockchain
 * Market information is not included
 */
export type TokenWithMetadata = {
  balance: bigint;
  metadata: TokenBalance['token'] & {
    apiId?: string;
    imgUrl: string;
  };
};

/**
 * Token current price, and price change percentage for given filter
 * @property {number} price - current market price
 * @property {number} balanceValue - current balance value in USD
 * @property {number} priceChangeDuringInterval - change in market price from interval time in past until now
 * @property {number} valueChangeDuringInterval - change in balance value from interval time in past until now
 * @property {number} percentageChangedDuringInterval - percentage change from market price interval time ago to current market price
 */
export interface MarketData {
  price: number;
  balanceValue: number;
  priceChangeDuringInterval: number;
  valueChangeDuringInterval?: number;
  percentageChangedDuringInterval: number;
}

export type TokenWithMarketData = TokenWithMetadata & {
  marketData?: MarketData;
};

/** Token populated with DAO treasury information; final iteration to be displayed */
export type VaultToken = TokenWithMarketData & {
  treasurySharePercentage?: number;
};

export type PollTokenOptions = {interval?: number; filter: TimeFilter};

// Transfers
/** A transfer transaction */
export type BaseTransfer = {
  id: string;
  title: string;
  tokenAmount: string;
  tokenSymbol: string;
  transferDate: string;
  transferTimestamp?: string | number;
  usdValue: string;
  isPending?: boolean;
  tokenImgUrl: string;
  tokenName: string;
  reference?: string;
  transaction: string;
  tokenAddress: string;
};

export type Deposit = BaseTransfer & {
  sender: string;
  transferType: TransferTypes.Deposit;
};
export type Withdraw = BaseTransfer & {
  proposalId: ProposalId;
  to: string;
  transferType: TransferTypes.Withdraw;
};

export type Transfer = Deposit | Withdraw;

export type ExecutionStatus =
  | 'defeated'
  | 'executed'
  | 'executable'
  | 'executable-failed'
  | 'default';

export type ProposalResource = {
  name: string;
  url: string;
};

export type Erc20ProposalVote = {
  address: string;
  vote: VoteValues;
  weight: bigint;
};

export type DetailedProposal = MultisigProposal | TokenVotingProposal;
export type ProposalListItem =
  | TokenVotingProposalListItem
  | MultisigProposalListItem;
export type SupportedProposals = DetailedProposal | ProposalListItem;

export type SupportedVotingSettings = MultisigVotingSettings | VotingSettings;

/* ACTION TYPES ============================================================= */

export type ActionIndex = {
  actionIndex: number;
};

/**
 * Metadata for actions. This data can not really be fetched and is therefore
 * declared locally.
 */
export type ActionParameter = {
  /**
   * Type of the action.
   */
  type: ActionsTypes;
  /**
   * Name displayed in the UI
   */
  title: string;
  /**
   * Description displayed in the UI
   */
  subtitle: string;
  /**
   * Whether an action can be used several times in a proposal. Currently
   * actions are either limited to 1 or not limited at all. This might need to
   * be changed to a number if the rules for reuseability become more complex.
   */
  isReuseable?: boolean;
  /**
   * Hides the action from the action menu when set to true.
   */
  isDisabled?: boolean;
};

/**
 * All available types of action for DAOs
 */
// TODO: rename actions types and names to be consistent
// either update or modify
export type ActionsTypes =
  | 'add_address'
  | 'remove_address'
  | 'withdraw_assets'
  | 'mint_tokens'
  | 'external_contract_modal'
  | 'external_contract_action'
  | 'wallet_connect_modal'
  | 'wallet_connect_action'
  | 'modify_token_voting_settings'
  | 'modify_metadata'
  | 'modify_multisig_voting_settings'
  | 'update_minimum_approval';

export type ActionWithdraw = {
  amount: number;
  name: 'withdraw_assets';
  to: Web3Address;
  tokenAddress: string;
  tokenBalance: number;
  tokenDecimals: number;
  tokenImgUrl: string;
  tokenName: string;
  tokenPrice: number;
  tokenSymbol: string;
  isCustomToken: boolean;
};

// TODO: merge these types
export type ActionAddAddress = {
  name: 'add_address';
  inputs: {
    memberWallets: Array<{
      address: string;
      ensName: string;
    }>;
  };
};

export type ActionRemoveAddress = {
  name: 'remove_address';
  inputs: {
    memberWallets: Array<{
      address: string;
      ensName: string;
    }>;
  };
};

export type ActionUpdateMinimumApproval = {
  name: 'update_minimum_approval';
  inputs: {
    minimumApproval: number;
  };
  summary: {
    addedWallets: number;
    removedWallets: number;
    totalWallets?: number;
  };
};

export type ActionMintToken = {
  name: 'mint_tokens';
  inputs: {
    mintTokensToWallets: {
      web3Address: {
        address: string;
        ensName: string;
      };
      amount: string | number;
    }[];
  };
  summary: {
    newTokens: number;
    tokenSupply: number;
    newHoldersCount: number;
    daoTokenSymbol: string;
    daoTokenAddress: string;
    totalMembers?: number;
  };
};

export type ActionUpdateMultisigPluginSettings = {
  name: 'modify_multisig_voting_settings';
  inputs: MultisigVotingSettings;
};

export type ActionUpdatePluginSettings = {
  name: 'modify_token_voting_settings';
  inputs: VotingSettings & {
    token?: Erc20TokenDetails;
    totalVotingWeight: bigint;
  };
};

export type ActionUpdateMetadata = {
  name: 'modify_metadata';
  inputs: DaoMetadata;
};

export type ActionSCC = {
  name: 'external_contract_action';
  contractName: string;
  contractAddress: string;
  functionName: string;
  inputs: Array<ExternalActionInput>;
  value?: string;
};

// Alias
export type ActionExternalContract = ActionWC;
export type ExternalActionInput = {
  name: string;
  type: string;
  notice?: string;
  value: object | string | BigNumber;
};

export type ActionWC = Omit<ActionSCC, 'name'> & {
  name: 'wallet_connect_action';
  notice?: string;
  verified: boolean;
  decoded: boolean;
  // considering we have the raw action directly from WC, there
  // is no need to decode it, re-encode it, only to decode it again
  // when displaying on the proposal details page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any;
};

// TODO: Consider making this a generic type that take other types of the form
// like ActionAddAddress (or more generically, ActionItem...?) instead taking the
// union of those subtypes. [VR 11-08-2022]
export type Action =
  | ActionWithdraw
  | ActionAddAddress
  | ActionRemoveAddress
  | ActionMintToken
  | ActionUpdatePluginSettings
  | ActionUpdateMetadata
  | ActionUpdateMinimumApproval
  | ActionUpdateMultisigPluginSettings
  | ActionSCC
  | ActionWC;

export type ParamType = {
  type: string;
  name?: string;
  value: string;
};

/**
 *  Inputs prop is using for custom smart contract methods that have unknown fields
 */
export type ActionItem = {
  name: ActionsTypes;
  inputs?: ParamType[];
};

/* UTILITY TYPES ============================================================ */

/** Return type for data hooks */
export type HookData<T> = {
  data: T;
  isLoading: boolean;
  isError?: boolean;
  isInitialLoading?: boolean;
  isLoadingMore?: boolean;
  error?: Error;
};

export type Nullable<T> = T | null;

export type StrictlyExclude<T, U> = T extends U ? (U extends T ? never : T) : T;

export type StringIndexed = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

/* SCC TYPES ============================================================ */
export type EtherscanContractResponse = {
  ABI: string;
  CompilerVersion: string;
  ContractName: string;
  EVMVersion: string;
  LicenseType: string;
  SourceCode: string;
  Proxy?: string;
  Implementation?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proxyImplementation?: any;
};

export type SourcifyContractResponse = {
  output: {
    abi: SmartContractAction[];
    devdoc: {
      title: string;
      methods: {
        // contract write method name with its input params
        [key: string]: {
          // description for each method
          details: string;
          params: {
            // contract method input params
            [key: string]: string;
          };
          returns: {
            // contract method output params
            [key: string]: string;
          };
        };
      };
    };
  };
};

export type SmartContractAction = {
  name: string;
  type: string;
  stateMutability: string;
  inputs: Input[];
  notice?: string;
};

export interface Input {
  name: string;
  type: string;
  indexed?: boolean;
  components?: Input[];
  internalType?: string;
  notice?: string;
  value?: string;
}

export type SmartContract = {
  actions: Array<SmartContractAction>;
  address: string;
  logo?: string;
  name: string;
  proxy?: string;
  implementation?: string;
  implementationData?: {
    actions: Array<SmartContractAction>;
    address: string;
    name: string;
    proxyAddress: string;
    logo?: string;
  };
  proxyAddress?: string;
};

export type VerifiedContracts = {
  // key is wallet address
  [key: string]: {
    // key is chain id
    [key: number]: Array<SmartContract>;
  };
};

/**
 * Opaque class encapsulating a proposal id, which can
 * be globally unique or just unique per plugin address
 */
export class ProposalId {
  private id: string;

  constructor(val: string) {
    this.id = val.toString();
  }

  /** Returns proposal id in form needed for SDK */
  export() {
    return this.id;
  }

  /** Make the proposal id globally unique by combining with an address (should be plugin address) */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  makeGloballyUnique(_: string): string {
    return this.id;
  }

  /** Return a string to be used as part of a url representing a proposal */
  toUrlSlug(): string {
    return this.id;
  }

  /** The proposal id as a string */
  toString() {
    return this.id;
  }
}

export interface Link {
  name: string;
  url: string;
}

export interface ProposalFormData {
  actions: Action[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  duration: number;
  startUtc: string;
  endUtc: string;
  startSwitch: 'date' | 'now' | string;
  durationMills: string;
  durationDays: string;
  durationHours: string;
  durationMinutes: string;
  durationSwitch: 'duration' | string;
  proposalTitle: string;
  proposalSummary: string;
  proposal: string;
  endTimeWarning: boolean;
  startTimeWarning: boolean;
  areSettingsLoading: boolean;
  links: Link[];
  osUpdate?: {
    os: boolean;
    plugin: boolean;
  };
  osxSelectedVersion?: {
    version: VersionTag;
    isLatest: boolean;
    isPrepared: boolean;
  };
  pluginSelectedVersion?: {
    address: string;
    version: VersionTag;
    isLatest: boolean;
    isPrepared: boolean;
  };
}

export type ProposalSettingsFormData = ProposalFormData & {
  areSettingsChanged: boolean;
  isMetadataChanged: boolean;
};

export interface ManageMembersFormData extends ProposalFormData {
  actions: Array<
    ActionAddAddress | ActionRemoveAddress | ActionUpdateMultisigPluginSettings
  >;
}

export interface MintTokensFormData extends ProposalFormData {
  actions: ActionMintToken[];
}

export type CreateProposalFormData = ProposalFormData;

export interface TokensWrappingFormData {
  mode: 'wrap' | 'unwrap';
  amount: string;
}

interface TokenFormData {
  tokenName: string;
  tokenSymbol: string;
  tokenImgUrl: string;
  tokenAddress: string;
  tokenDecimals: number;
  tokenBalance: string;
  tokenPrice?: number;
  isCustomToken: boolean;
}

type WithdrawFormDataAction = TokenFormData & {
  to: InputValue;
  from: string;
  amount: string;
  name: string; // This indicates the type of action; Deposit is NOT an action
};

export interface WithdrawFormData extends Omit<ProposalFormData, 'actions'> {
  actions: WithdrawFormDataAction[];
}
