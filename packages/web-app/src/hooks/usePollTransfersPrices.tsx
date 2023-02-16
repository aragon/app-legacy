import {useApolloClient} from '@apollo/client';
import {TokenType, TransferType} from '@aragon/sdk-client';

import {useNetwork} from 'context/network';
import {constants} from 'ethers';
import {useEffect, useState} from 'react';
import {fetchTokenData} from 'services/prices';
import {
  CHAIN_METADATA,
  SupportedNetworks,
  TransferTypes,
} from 'utils/constants';
import {formatDate} from 'utils/date';
import {formatUnits} from 'utils/library';
import {HookData, ProposalId, Transfer} from 'utils/types';
import {i18n} from '../../i18n.config';
import {IAssetTransfers} from './useDaoTransfers';

export const usePollTransfersPrices = (
  transfers: IAssetTransfers
): HookData<{transfers: Transfer[]; totalTransfersValue: string}> => {
  const client = useApolloClient();
  const {network} = useNetwork();

  const [data, setData] = useState<Transfer[]>([]);
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);
  const [totalTransfersValue, setTotalTransfersValue] = useState('');

  useEffect(() => {
    const fetchMetadata = async (assetTransfers: Transfer[]) => {
      try {
        setLoading(true);
        let total = 0;

        // fetch token metadata from external api
        const metadata = await Promise.all(
          assetTransfers?.map(transfer => {
            return fetchTokenData(
              transfer.tokenAddress,
              client,
              network,
              transfer.tokenSymbol
            );
          })
        );

        // map metadata to token balances
        const tokensWithMetadata: Transfer[] = assetTransfers?.map(
          (transfer, index: number) => {
            let calculatedPrice = 0;

            if (metadata[index]?.price) {
              calculatedPrice =
                Number(transfer.tokenAmount) * Number(metadata[index]?.price);
              total = total + calculatedPrice;
            }

            return {
              ...transfer,
              usdValue: `$${calculatedPrice.toFixed(2)}`,
              tokenImgUrl: metadata[index]?.imgUrl || '',
            };
          }
        );
        setData(tokensWithMetadata);
        setTotalTransfersValue(`$${total.toFixed(2)}`);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      }

      setLoading(false);
    };

    if (transfers) fetchMetadata(mapToDaoTransfers(transfers, network));
  }, [network, client, transfers]);

  return {
    data: {transfers: data, totalTransfersValue},
    error,
    isLoading: loading,
  };
};

/**
 * Map SDK data to DAO transfer
 * We should not do this in the SDK
 * @param transfers Asset transfers from the SDK
 * @param network Currently selected network
 * @returns List of objects of type Transfer
 */
function mapToDaoTransfers(
  transfers: IAssetTransfers,
  network: SupportedNetworks
): Transfer[] {
  return transfers.map(transfer => {
    const mappedTransfer = {
      usdValue: '',
      tokenImgUrl: '',
      id: transfer.transactionId,
      transaction: transfer.transactionId,
      transferTimestamp: transfer.creationDate?.getTime(),

      ...(transfer.tokenType === 'native'
        ? {
            tokenAddress: constants.AddressZero,
            tokenName: CHAIN_METADATA[network].nativeCurrency.name,
            tokenSymbol: CHAIN_METADATA[network].nativeCurrency.symbol,
            tokenAmount: formatUnits(
              transfer.amount,
              CHAIN_METADATA[network].nativeCurrency.decimals
            ),
          }
        : transfer.tokenType === TokenType.ERC20
        ? {
            tokenName: transfer.token.name,
            tokenAddress: transfer.token.address,
            tokenSymbol: transfer.token.symbol,
            tokenAmount: formatUnits(transfer.amount, transfer.token.decimals),
          }
        : {
            tokenName: transfer.token.name,
            tokenAddress: transfer.token.address,
            tokenSymbol: transfer.token.symbol,
            tokenAmount: '', // TODO work out how to get this value
          }),
    };

    // map differences
    if (transfer.type === TransferType.DEPOSIT) {
      return {
        ...mappedTransfer,
        title: i18n.t('labels.deposit'),
        sender: transfer.from,
        transferType: TransferTypes.Deposit as TransferTypes.Deposit,
        transferDate: transfer.creationDate
          ? `${formatDate(transfer.creationDate.getTime() / 1000, 'relative')}`
          : i18n.t('labels.pendingTransaction'),
      };
    } else {
      return {
        ...mappedTransfer,
        title: i18n.t('labels.withdraw'),
        transferType: TransferTypes.Withdraw as TransferTypes.Withdraw,
        to: transfer.to,
        proposalId: new ProposalId(transfer.proposalId),
        isPending: false,
        transferDate: `${formatDate(
          transfer.creationDate.getTime() / 1000,
          'relative'
        )}`,
      } as Transfer;
    }
  });
}
