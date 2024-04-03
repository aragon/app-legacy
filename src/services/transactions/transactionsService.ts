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
  IBuildCreateMultisigProposalTransactionParams,
  IBuildCreateTokenVotingProposalTransactionParams,
} from './transactionsService.api';
import {ITransaction} from './domain/transaction';

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

  buildCreateMultisigProposalTransaction = async (
    params: IBuildCreateMultisigProposalTransactionParams
  ): Promise<ITransaction> => {
    const {
      client,
      pluginAddress,
      actions = [],
      startDate,
      endDate,
      approve = false,
      tryExecution = false,
    } = params;

    const signer = client.web3.getConnectedSigner();

    const multisigContract = Multisig__factory.connect(pluginAddress, signer);

    const startTimestamp = startDate?.getTime() ?? 0;
    const endTimestamp = endDate?.getTime() ?? 0;

    const transaction =
      await multisigContract.populateTransaction.createProposal(
        toUtf8Bytes(params.metadataUri),
        actions,
        BigInt(0),
        approve,
        tryExecution,
        Math.round(startTimestamp / 1000),
        Math.round(endTimestamp / 1000)
      );

    return transaction as ITransaction;
  };

  buildCreateTokenVotingProposalTransaction = async (
    params: IBuildCreateTokenVotingProposalTransactionParams
  ): Promise<ITransaction> => {
    const {
      client,
      pluginAddress,
      actions = [],
      startDate,
      endDate,
      creatorVote = 0,
      executeOnPass = false,
    } = params;

    const signer = client.web3.getConnectedSigner();

    const multisigContract = TokenVoting__factory.connect(
      pluginAddress,
      signer
    );

    const startTimestamp = startDate?.getTime() ?? 0;
    const endTimestamp = endDate?.getTime() ?? 0;

    const transaction =
      await multisigContract.populateTransaction.createProposal(
        toUtf8Bytes(params.metadataUri),
        actions,
        BigInt(0),
        Math.round(startTimestamp / 1000),
        Math.round(endTimestamp / 1000),
        creatorVote,
        executeOnPass
      );

    return transaction as ITransaction;
  };
}

export const transactionsService = new TransactionsService();
