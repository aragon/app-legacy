import {VocdoniCensus3Client, VocdoniSDKClient} from '@vocdoni/sdk';
import {TokenDaoMember} from '../../hooks/useDaoMembers';

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

export interface IFetchCensus3VotingPowerParams {
  holders: TokenDaoMember[];
  censusId?: string | null;
  tokenId?: string;
}

export interface ICensus3VotingPowerProps {
  page?: number;
  tokenId?: string;
}

export interface ICensus3TokenProps {
  tokenAddress: string;
}
