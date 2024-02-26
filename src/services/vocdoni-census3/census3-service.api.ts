import {VocdoniCensus3Client, VocdoniSDKClient} from '@vocdoni/sdk';

export interface IFetchVotingPowerByCensusId {
  vocdoniClient: VocdoniSDKClient;
  holderAddress: string;
  censusId: string;
}

export interface IFetchVotingPowerByTokenAddress {
  census3Client: VocdoniCensus3Client;
  tokenId: string;
  chainId: number;
  holderId: string;
}
