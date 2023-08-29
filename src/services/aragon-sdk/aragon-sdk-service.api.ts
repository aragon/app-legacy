export interface IFetchDelegateeParams {
  tokenAddress: string;
}

export interface IFetchPastVotingPowerParams {
  tokenAddress: string;
  address: string;
  blockNumber: number;
}

export interface IFetchVotingPowerParams {
  tokenAddress: string;
  address: string;
}

export interface IDelegateTokensParams {
  tokenAddress: string;
  delegatee: string;
}
