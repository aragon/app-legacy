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

/** Token populated with the current price, and price change percentage for given filter */
export type TokenWithMarketData = TokenWithMetadata & {
  marketData?: {
    price: number;
    treasuryShare: number;
    valueChangeDuringInterval: number;
    percentageChangedDuringInterval: number;
  };
};

/** Token populated with DAO treasury information; final iteration to be displayed */
export type VaultToken = TokenWithMarketData & {
  treasurySharePercentage?: number;
};

export type PollTokenOptions = {interval?: number; filter: TimeFilter};

// Transfers
type Deposit = {
  __typename: TransferTypes.Deposit;
  sender: Address;
};

type Withdraw = {
  __typename: TransferTypes.Withdraw;

  to: Address;
  proposal: {
    id: string;
  };
};

/** The Dao transfer */
export type DaoTransfer = {
  amount: number;
  createdAt: number;
  dao: {
    id: string;
  };
  token: TokenBalance['token'];
  id: string;
  reference: string;
  transaction: string;
} & (Withdraw | Deposit);

/** A transfer transaction */
export type Transfer = {
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
} & (
  | {transferType: TransferTypes.Deposit; sender: Address}
  | {transferType: TransferTypes.Withdraw; to: Address; proposalId: string}
);

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

type ProposalResource = {
  title: string;
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

/* GENERIC HOOK RETURN TYPE ================================================= */

/** Return type for data hooks */
export type HookData<T> = {
  data: T;
  isLoading: boolean;
  error?: Error;
};

export type Nullable<T> = T | null;

export type SupportedChainId = 1 | 4;

export type ActionParameter = {
  type: ActionsTypes;
  title: string;
  subtitle: string;
};

/**
 * Allowed Actions for each dao
 */
export type ActionsTypes =
  | 'add_address'
  | 'remove_address'
  | 'withdraw_assets'
  | 'mint_token'
  | 'external_contract'
  | 'modify_settings';

export type ActionWithdraw = {
  amount: number;
  name: 'withdraw_assets';
  to: Address;
  tokenAddress: Address;
  tokenBalance: number;
  tokenImgUrl: '';
  tokenName: string;
  tokenPrice: number;
  tokenSymbol: string;
};

// TODO: merge these types
export type ActionAddAddress = {
  inputs: {
    memberWallets: {
      address: Address;
    }[];
  };
};

export type ActionTokenMinting = {
  inputs: {
    mintTokensToWallets: {
      address: Address;
      amount: number;
    }[];
  };
};

export type Action = ActionWithdraw | ActionAddAddress | ActionTokenMinting;

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

export type StringIndexed = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type Dao = {
  address: string;
};
