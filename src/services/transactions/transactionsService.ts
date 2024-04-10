import {
  DAOFactory,
  DAOFactory__factory,
  PluginRepo__factory,
  Multisig__factory,
  TokenVoting__factory,
} from '@aragon/osx-ethers';
import {toUtf8Bytes} from 'ethers/lib/utils';
import {zeroAddress} from 'viem';
import {
  IBuildCreateDaoTransactionParams,
  IBuildExecuteMultisigProposalTransactionParams,
  IBuildExecuteTokenVotingProposalTransactionParams,
} from './transactionsService.api';
import {ITransaction} from './domain/transaction';
import {decodeProposalId} from '@aragon/sdk-client-common';

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

  buildExecuteMultisigProposalTransaction = async (
    params: IBuildExecuteMultisigProposalTransactionParams
  ): Promise<ITransaction> => {
    const {proposalId, client} = params;

    const signer = client.web3.getConnectedSigner();
    const {pluginAddress, id} = decodeProposalId(proposalId);
    const multisigContract = Multisig__factory.connect(pluginAddress, signer);

    const transaction = await multisigContract.populateTransaction.execute(id);

    return transaction as ITransaction;
  };

  buildExecuteTokenVotingProposalTransaction = async (
    params: IBuildExecuteTokenVotingProposalTransactionParams
  ): Promise<ITransaction> => {
    const {proposalId, client} = params;

    const signer = client.web3.getConnectedSigner();
    const {pluginAddress, id} = decodeProposalId(proposalId);
    const tokenVotingContract = TokenVoting__factory.connect(
      pluginAddress,
      signer
    );

    const transaction =
      await tokenVotingContract.populateTransaction.execute(id);

    return transaction as ITransaction;
  };
}

export const transactionsService = new TransactionsService();
