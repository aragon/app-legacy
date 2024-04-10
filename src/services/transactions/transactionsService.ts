import {
  DAOFactory,
  DAOFactory__factory,
  PluginRepo__factory,
  Multisig__factory,
  TokenVoting__factory,
} from '@aragon/osx-ethers';
import {VocdoniVoting__factory} from '@vocdoni/gasless-voting-ethers';
import {toUtf8Bytes} from 'ethers/lib/utils';
import {zeroAddress} from 'viem';
import {
  IBuildCreateDaoTransactionParams,
  IBuildCreateGaslessProposalTransactionParams,
  IBuildCreateMultisigProposalTransactionParams,
  IBuildCreateTokenVotingProposalTransactionParams,
  IBuildExecuteMultisigProposalTransactionParams,
} from './transactionsService.api';
import {ITransaction} from './domain/transaction';
import {decodeProposalId, hexToBytes} from '@aragon/sdk-client-common';

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
      metadataUri,
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
        toUtf8Bytes(metadataUri),
        actions,
        BigInt(0),
        Math.round(startTimestamp / 1000),
        Math.round(endTimestamp / 1000),
        creatorVote,
        executeOnPass
      );

    return transaction as ITransaction;
  };

  buildCreateGaslessProposalTransaction = async (
    params: IBuildCreateGaslessProposalTransactionParams
  ): Promise<ITransaction> => {
    const {
      client,
      actions = [],
      pluginAddress,
      startDate,
      endDate,
      tokenCensus,
      electionId,
    } = params;

    const signer = client.web3.getConnectedSigner();

    const gaslessVotingContract = VocdoniVoting__factory.connect(
      pluginAddress,
      signer
    );

    const startTimestamp = startDate?.getTime() || 0;
    const endTimestamp = endDate?.getTime() || 0;
    const minTallyDurationTimestamp = 0;

    const votingParams = {
      startDate: BigInt(Math.round(startTimestamp / 1000)),
      voteEndDate: BigInt(Math.round(endTimestamp / 1000)),
      tallyEndDate: BigInt(Math.round(minTallyDurationTimestamp / 1000)),
      securityBlock: BigInt(0),
      totalVotingPower: tokenCensus.weight!,
      censusURI: tokenCensus.censusURI!,
      censusRoot: hexToBytes(tokenCensus.censusId!),
    };

    const transaction =
      await gaslessVotingContract.populateTransaction.createProposal(
        hexToBytes(electionId),
        BigInt(0),
        votingParams,
        actions
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
    params: IBuildExecuteMultisigProposalTransactionParams
  ): Promise<ITransaction> => {
    const {proposalId, client} = params;

    const signer = client.web3.getConnectedSigner();
    const {pluginAddress, id} = decodeProposalId(proposalId);
    const multisigContract = Multisig__factory.connect(pluginAddress, signer);

    const transaction = await multisigContract.populateTransaction.execute(id);

    return transaction as ITransaction;
  };
}

export const transactionsService = new TransactionsService();
