import {
  DAOFactory,
  DAOFactory__factory,
  PluginRepo__factory,
} from '@aragon/osx-ethers';
import {toUtf8Bytes} from 'ethers/lib/utils';
import {zeroAddress} from 'viem';
import {IBuildCreateDaoTransactionParams} from './transactionsService.api';
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

    plugins.forEach(async plugin => {
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
    });

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
}

export const transactionsService = new TransactionsService();
