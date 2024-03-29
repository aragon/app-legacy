import {useSendTransaction} from 'hooks/useSendTransaction';
import {ITransaction} from 'services/transactions/domain/transaction';
import {TransactionReceipt} from 'viem';
import {createDaoUtils} from '../utils';
import {CreateDaoFormData} from 'utils/types';
import {useFormContext} from 'react-hook-form';
import {IBuildCreateDaoTransactionParams} from 'services/transactions/transactionsService.api';
import {CHAIN_METADATA} from 'utils/constants';
import {useAddFollowedDaoMutation} from 'hooks/useFollowedDaos';
import {useAddPendingDaoMutation} from 'hooks/usePendingDao';
import {useNetwork} from 'context/network';
import {useCensus3CreateToken} from 'hooks/useCensus3';
import {GaslessPluginName} from 'hooks/usePluginClient';

export interface IUseSendCreateDaoTransactionParams {
  /**
   * Process name for logging.
   */
  process: string;
  /**
   * CreateDao transaction to be sent.
   */
  transaction?: ITransaction;
  /**
   * IPFS id of the DAO metadata.
   */
  metadataCid?: string;
  /**
   * Parameters for the CreateDao transaction.
   */
  createDaoParams?: Omit<IBuildCreateDaoTransactionParams, 'client'>;
}

export const useSendCreateDaoTransaction = (
  params: IUseSendCreateDaoTransactionParams
) => {
  const {process, transaction, metadataCid, createDaoParams} = params;

  const {network} = useNetwork();

  const {getValues} = useFormContext<CreateDaoFormData>();
  const formValues = getValues();
  const {blockchain, membership, votingType, isCustomToken, tokenAddress} =
    formValues;

  const addFavoriteDaoMutation = useAddFollowedDaoMutation();
  const addPendingDaoMutation = useAddPendingDaoMutation();

  const {createToken} = useCensus3CreateToken({
    chainId: blockchain.id,
    pluginType:
      membership === 'token' && votingType === 'gasless'
        ? GaslessPluginName
        : undefined,
  });

  const handleCreateDaoSuccess = (txReceipt: TransactionReceipt) => {
    const {daoAddress, pluginAddresses} =
      createDaoUtils.getDaoAddressesFromReceipt(txReceipt)!;
    const metadata = createDaoUtils.formValuesToDaoMetadata(
      formValues,
      metadataCid
    );

    const {ensSubdomain = '', plugins = []} = createDaoParams!;

    addPendingDaoMutation.mutateAsync({
      daoAddress: daoAddress.toLowerCase(),
      network,
      daoDetails: {
        ...createDaoParams!,
        metadata,
        creationDate: new Date(),
      },
    });

    addFavoriteDaoMutation.mutateAsync({
      dao: {
        address: daoAddress.toLowerCase(),
        chain: CHAIN_METADATA[network].id,
        ensDomain: ensSubdomain,
        plugins: [
          {
            id:
              membership === 'token'
                ? 'token-voting.plugin.dao.eth'
                : 'multisig.plugin.dao.eth',
            data: plugins[0].data,
          },
        ],
        metadata: {
          name: metadata.name,
          avatar: metadata.avatar,
          description: metadata.description,
        },
      },
    });

    if (votingType === 'gasless' && membership === 'token') {
      createToken(
        pluginAddresses[0],
        !isCustomToken ? tokenAddress?.address : undefined
      );
    }
  };

  const sendTransactionResults = useSendTransaction({
    logContext: {stack: [process], data: formValues},
    transaction,
    onSuccess: handleCreateDaoSuccess,
  });

  return sendTransactionResults;
};
