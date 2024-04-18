import {VocdoniCensus3Client, VocdoniSDKClient} from '@vocdoni/sdk';
import {TokenDaoMember} from '../../hooks/useDaoMembers';
import {ProposalMetadata} from '@aragon/sdk-client-common';
import {GaslessProposalCreationParams} from 'utils/types';

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

export interface ICreateAccountParams {
  vocdoniClient: VocdoniSDKClient;
}

export interface ICreateVocdoniElectionParams extends IGetCensus3TokenParams {
  metadata: ProposalMetadata;
  data: GaslessProposalCreationParams;
  vocdoniClient: VocdoniSDKClient;
}

export interface IGetCensus3TokenParams {
  census3: VocdoniCensus3Client;
  tokenAddress: string;
  chainId: number;
  pluginAddress: string;
  createToken: (pluginAddress: string, tokenAddress?: string) => Promise<void>;
}
