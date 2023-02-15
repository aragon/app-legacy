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
import {Address} from '@aragon/ui-components/src/utils/addresses';

import {TimeFilter, TransferTypes} from './constants';

/*************************************************
 *                   Finance types               *
 *************************************************/
/**
 * Token with basic information populated from external api and/or blockchain
 * Market information is not included
 */
export type BaseTokenInfo = {
  address: Address;
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
  sender: Address;
  transferType: TransferTypes.Deposit;
};
export type Withdraw = BaseTransfer & {
  proposalId: ProposalId;
  to: Address;
  transferType: TransferTypes.Withdraw;
};

export type Transfer = Deposit | Withdraw;

/*************************************************
 *                  Proposal types               *
 *************************************************/

export type ProposalData = UncategorizedProposalData & {
  type: 'draft' | 'pending' | 'active' | 'succeeded' | 'executed' | 'defeated';
};

type Seconds = string;

export type UncategorizedProposalData = {
  id: string;
  metadata: ProposalMetadata;
  vote: VotingData;
  execution: ExecutionData;
  creator: string;
};

type ProposalMetadata = {
  title: string;
  description: string;
  resources?: ProposalResource[];
  published?: BlockChainInteraction;
  executed?: BlockChainInteraction;
};

export type ProposalResource = {
  name: string;
  url: string;
};

type BlockChainInteraction = {
  date: Seconds;
  block: string;
};

export type VotingData = {
  start: Seconds;
  end: Seconds;
  total: number;
  results: Record<string, number>; // e.g. option -> amount of votes
  tokenSymbol: string;
};

type ExecutionData = {
  from: Address;
  to: Address;
  amount: number;
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
  | 'external_contract'
  | 'modify_token_voting_settings'
  | 'modify_metadata'
  | 'modify_multisig_voting_settings';

// TODO Refactor ActionWithdraw With the new input structure
export type ActionWithdraw = {
  amount: number;
  name: 'withdraw_assets';
  to: Address;
  tokenAddress: Address;
  tokenBalance: number;
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
    memberWallets: {
      address: Address;
    }[];
  };
};

export type ActionRemoveAddress = {
  name: 'remove_address';
  inputs: {
    memberWallets: {
      address: Address;
    }[];
  };
};

export type ActionMintToken = {
  name: 'mint_tokens';
  inputs: {
    mintTokensToWallets: {
      address: string;
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
  | ActionUpdateMultisigPluginSettings;

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

export type TransactionItem = {
  type: TransferTypes;
  data: {
    sender: string;
    amount: number;
    tokenContract: Address;
  };
};

/* MISCELLANEOUS TYPES ======================================================= */
export type Dao = {
  address: string;
};

/* UTILITY TYPES ============================================================ */

/** Return type for data hooks */
export type HookData<T> = {
  data: T;
  isLoading: boolean;
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
};

// TODO: Fill out as we go
export type SmartContractAction = {};

export type SmartContract = {
  actions: Array<SmartContractAction>;
  address: string;
  logo?: string;
  name: string;
};

/**
 * Opaque class encapsulating a proposal id, which can
 * be globally unique or just unique per plugin address
 */
export class ProposalId {
  private id: string;

  constructor(val: Number | string) {
    if (typeof val === 'string' && val.includes('_')) {
      val = Number(val.split('_')[1].substring(2));
    }
    this.id = val.toString();
  }

  /** Returns proposal id in form needed for SDK */
  export() {
    return Number(this.id);
  }

  /** Make the proposal id globally unique by combining with an address (should be plugin address) */
  makeGloballyUnique(address: string): string {
    const idHex = '0x' + Number(this.id).toString(16);
    return `${address}_${idHex}`;
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
