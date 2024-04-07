import {
  Client,
  MultisigClient,
  TokenVotingClient,
  VoteValues,
} from '@aragon/sdk-client';
import {PluginInstallItem} from '@aragon/sdk-client-common';

export type PluginClient = TokenVotingClient | MultisigClient;
export interface IBuildCreateDaoTransactionParams {
  client: Client;
  metadataUri: string;
  daoUri?: string;
  ensSubdomain?: string;
  trustedForwarder?: string;
  plugins: PluginInstallItem[];
}

export interface IBuildVoteOrApprovalTransactionParams {
  client: PluginClient;
  vote: VoteValues;
  proposalId: string;
  tryExecution?: boolean;
}
