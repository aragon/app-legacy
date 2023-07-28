import {TransferType} from '@aragon/sdk-client';
import {TokenType} from '@aragon/sdk-client-common';

import {useNetwork} from 'context/network';
import {constants} from 'ethers';
import {useEffect, useMemo} from 'react';
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
import {useTokenList} from 'services/token/queries/use-token';

export const usePollTransfersPrices = (
  transfers: IAssetTransfers
): HookData<{transfers: Transfer[]; totalTransfersValue: string}> => {
  const {network} = useNetwork();

  const assetTransfers = useMemo(
    () => mapToDaoTransfers(transfers, network),
    [transfers, network]
  );

  const tokenListParams = assetTransfers?.map(transfer => ({
    address: transfer.tokenAddress,
    network,
    symbol: transfer.tokenSymbol,
  }));
  const tokenResults = useTokenList(tokenListParams);

  const isLoading = tokenResults.some(result => result.isLoading);
  const isError = tokenResults.some(result => result.isError);
  const tokens = tokenResults.map(result => result.data);

  const processedData = useMemo(() => {
    let total = 0;

    const tokensWithMetadata = assetTransfers?.map(
      (transfer, index: number) => {
        let calculatedPrice = 0;

        if (tokens[index]?.price) {
          calculatedPrice =
            Number(transfer.tokenAmount) * Number(tokens[index]?.price);
          total = total + calculatedPrice;
        }

        return {
          ...transfer,
          usdValue: `$${calculatedPrice.toFixed(2)}`,
          tokenImgUrl: tokens[index]?.imgUrl ?? '',
        };
      }
    );

    const totalTransfersValue = `$${total.toFixed(2)}`;

    return {transfers: tokensWithMetadata, totalTransfersValue};
  }, [assetTransfers, tokens]);

  return {
    data: processedData,
    isError,
    isLoading,
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
