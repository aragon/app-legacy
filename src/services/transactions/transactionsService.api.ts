import {Client} from '@aragon/sdk-client';
import {PluginInstallItem} from '@aragon/sdk-client-common';

export interface IBuildCreateDaoTransactionParams {
  client: Client;
  metadataUri: string;
  daoUri?: string;
  ensSubdomain?: string;
  trustedForwarder?: string;
  plugins: PluginInstallItem[];
}

export interface IBuildExecuteMultisigProposalTransactionParams {
  client: Client;
  proposalId: string;
}

export interface IBuildExecuteTokenVotingProposalTransactionParams {
  client: Client;
  proposalId: string;
}
