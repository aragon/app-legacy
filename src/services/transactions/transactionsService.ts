import {
  DAOFactory,
  DAOFactory__factory,
  PluginRepo__factory,
  TokenVoting__factory,
  Multisig__factory,
} from '@aragon/osx-ethers';
import {toUtf8Bytes} from 'ethers/lib/utils';
import {zeroAddress} from 'viem';
import {
  IBuildCreateDaoTransactionParams,
  IBuildVoteOrApprovalTransactionParams,
} from './transactionsService.api';
import {ITransaction} from './domain/transaction';
import {decodeProposalId} from '@aragon/sdk-client-common';
import {isMultisigClient, isTokenVotingClient} from 'hooks/usePluginClient';

class TransactionsService {
  buildCreateDaoTransaction = async (
    params: IBuildCreateDaoTransactionParams
  ): Promise<ITransaction> => {
    const {
      client,
      ensSubdomain = '',
      metadataUri,
      daoUri = '',
      trustedForwarder = zeroAddress,
      plugins,
    } = params;

    const signer = client.web3.getConnectedSigner();
    const daoFactoryAddress = client.web3.getAddress('daoFactoryAddress');

    const daoFactoryInstance = DAOFactory__factory.connect(
      daoFactoryAddress,
      signer
    );

    const pluginInstallationData: DAOFactory.PluginSettingsStruct[] = [];

    for (const plugin of plugins) {
      const repo = PluginRepo__factory.connect(plugin.id, signer);

      const currentRelease = await repo.latestRelease();
      const latestVersion =
        await repo['getLatestVersion(uint8)'](currentRelease);

      pluginInstallationData.push({
        pluginSetupRef: {
          pluginSetupRepo: repo.address,
          versionTag: latestVersion.tag,
        },
        data: plugin.data,
      });
    }

    const createDaoParams = {
      subdomain: ensSubdomain,
      metadata: toUtf8Bytes(metadataUri),
      daoURI: daoUri,
      trustedForwarder: trustedForwarder,
    };

    const transaction = await daoFactoryInstance.populateTransaction.createDao(
      createDaoParams,
      pluginInstallationData
    );

    return transaction as ITransaction;
  };
  buildVoteOrApprovalTransaction = async (
    params: IBuildVoteOrApprovalTransactionParams
  ): Promise<ITransaction> => {
    const {client, vote, proposalId, tryExecution = false} = params;

    const signer = client.web3.getConnectedSigner();

    const {pluginAddress, id} = decodeProposalId(proposalId);

    if (isTokenVotingClient(client)) {
      const tokenVotingContract = TokenVoting__factory.connect(
        pluginAddress,
        signer
      );

      const transaction = await tokenVotingContract.populateTransaction.vote(
        id,
        vote,
        false
      );

      return transaction as ITransaction;
    } else if (isMultisigClient(client)) {
      const multisigContract = Multisig__factory.connect(pluginAddress, signer);

      const transaction = await multisigContract.populateTransaction.approve(
        id,
        tryExecution
      );

      return transaction as ITransaction;
    } else {
      throw new Error('Unsupported plugin type');
    }
  };
}

export const transactionsService = new TransactionsService();
