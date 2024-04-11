import {
  Client,
  MultisigClient,
  TokenVotingClient,
  VoteValues,
} from '@aragon/sdk-client';
import {PluginInstallItem} from '@aragon/sdk-client-common';
import {GaslessVotingClient} from '@vocdoni/gasless-voting';

export type PluginClient =
  | TokenVotingClient
  | MultisigClient
  | GaslessVotingClient;
export interface IBuildCreateDaoTransactionParams {
  client: Client;
  metadataUri: string;
  daoUri?: string;
  ensSubdomain?: string;
  trustedForwarder?: string;
  plugins: PluginInstallItem[];
}

export interface IBuildVoteOrApprovalTransactionParams {
  pluginClient: PluginClient;
  vote: VoteValues;
  proposalId: string;
  tryExecution?: boolean;
}
