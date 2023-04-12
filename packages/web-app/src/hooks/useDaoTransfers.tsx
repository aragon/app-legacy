import {useReactiveVar} from '@apollo/client';
import {
  SortDirection,
  Transfer,
  TransferSortBy,
  TransferType,
} from '@aragon/sdk-client';
import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {useEffect, useMemo, useState} from 'react';

import {pendingDeposits} from 'context/apolloClient';
import {HookData} from 'utils/types';
import {useClient} from './useClient';
import {
  CHAIN_METADATA,
  PENDING_DEPOSITS_KEY,
  alchemyApiKeys,
} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';
import {useNetwork} from 'context/network';
import {getTokenInfo} from 'utils/tokens';
import {useSpecificProvider} from 'context/providers';

export type IAssetTransfers = Transfer[];

export const useDaoTransfers = (
  daoAddressOrEns: Address
): HookData<Transfer[]> => {
  const {client} = useClient();
  const {network} = useNetwork();

  const [data, setData] = useState<Transfer[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const pendingDepositsTxs = useReactiveVar(pendingDeposits);
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  const url = `${CHAIN_METADATA[network].alchemyApi}/${alchemyApiKeys[network]}`;

  const options = useMemo(
    () => ({
      method: 'POST',
      headers: {accept: 'application/json', 'content-type': 'application/json'},
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: '0x0',
            toBlock: 'latest',
            toAddress: daoAddressOrEns,
            category: ['erc20'],
            withMetadata: true,
            excludeZeroValue: true,
          },
        ],
      }),
    }),
    [daoAddressOrEns]
  );

  useEffect(() => {
    async function getTransfers() {
      try {
        setIsLoading(true);

        const transfers = await client?.methods.getDaoTransfers({
          sortBy: TransferSortBy.CREATED_AT,
          daoAddressOrEns,
          direction: SortDirection.DESC,
        });

        // Fetch the token list using the Alchemy API
        const res = await fetch(url, options);
        const alchemyTransfersList = await res.json();

        // // Define a list of promises to fetch ERC20 token balances
        const erc20TransfersListPromises =
          alchemyTransfersList.result.transfers.map(async (transfer: any) => {
            const {name} = await getTokenInfo(
              transfer.rawContract.address,
              provider,
              CHAIN_METADATA[network].nativeCurrency
            );

            return {
              type: 'deposit',
              tokenType: 'erc20',
              amount: BigInt(transfer.rawContract.value),
              creationDate: new Date(transfer.metadata.blockTimestamp),
              from: transfer.from,
              to: daoAddressOrEns,
              token: {
                address: transfer.rawContract.address,
                decimals: Number(transfer.rawContract.decimal),
                name,
                symbol: transfer.asset,
              },
              transactionId: transfer.hash,
            };
          });

        const erc20DepositsList = await Promise.all(erc20TransfersListPromises);

        // console.log('transfersList', depositLists);

        if (transfers?.length) {
          const subgraphTransfers = transfers.filter(
            t => t.type === TransferType.WITHDRAW || t.tokenType === 'native'
          );

          console.log('deposits', subgraphTransfers, erc20DepositsList);
        }

        if (transfers?.length) {
          const subgraphTransfers = transfers.filter(
            t => t.type === TransferType.WITHDRAW || t.tokenType === 'native'
          );

          const deposits = transfers.filter(
            t => t.type === TransferType.DEPOSIT
          );

          for (let i = 0; i < pendingDepositsTxs.length; ) {
            const tx = pendingDepositsTxs[i];

            for (let j = 0; j < deposits.length; j++) {
              const deposit = deposits[j];
              if (deposit.transactionId === tx.transactionId) {
                pendingDepositsTxs.splice(i, 1);
                break;
              }
              if (j === deposits.length - 1) {
                i++;
              }
            }
          }

          localStorage.setItem(
            PENDING_DEPOSITS_KEY,
            JSON.stringify(pendingDepositsTxs, customJSONReplacer)
          );

          setData([
            ...pendingDepositsTxs,
            ...subgraphTransfers,
            ...erc20DepositsList,
          ]);
        }
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getTransfers();
  }, [
    client?.methods,
    daoAddressOrEns,
    network,
    options,
    pendingDepositsTxs,
    provider,
    url,
  ]);

  return {data, error, isLoading};
};
