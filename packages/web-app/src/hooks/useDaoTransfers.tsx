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
import {useProviders} from 'context/providers';

export type IAssetTransfers = Transfer[];

type AlchemyTransfer = {
  from: string;
  rawContract: {
    address: string;
    value: string;
    decimals: string;
  };
  metadata: {
    blockTimestamp: string;
  };
  hash: string;
};

function sortByCreatedAt(a: Transfer, b: Transfer): number {
  return b.creationDate.getTime() - a.creationDate.getTime();
}

/**
 * @param daoAddressOrEns
 * @returns List if transfers
 */

export const useDaoTransfers = (
  daoAddressOrEns: Address
): HookData<Transfer[]> => {
  const {client} = useClient();
  const {network} = useNetwork();

  const [data, setData] = useState<Transfer[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const pendingDepositsTxs = useReactiveVar(pendingDeposits);
  const {infura: provider} = useProviders();

  const url = `${CHAIN_METADATA[network].alchemyApi}/${alchemyApiKeys[network]}`;

  // Memoize options to prevent unnecessary re-renders
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

        // Fetch client transfers from the subgraph
        const clientTransfers = await client?.methods.getDaoTransfers({
          sortBy: TransferSortBy.CREATED_AT,
          daoAddressOrEns,
          direction: SortDirection.DESC,
        });

        let subgraphTransfers: Transfer[] = [];

        // Fetch the token list using the Alchemy API
        const res = await fetch(url, options);
        const alchemyTransfersList = await res.json();

        // filter the erc20 token deposits
        const erc20DepositsListPromises =
          alchemyTransfersList.result.transfers.map(
            async ({from, rawContract, metadata, hash}: AlchemyTransfer) => {
              const {name, symbol, decimals} = await getTokenInfo(
                rawContract.address,
                provider,
                CHAIN_METADATA[network].nativeCurrency
              );

              return {
                type: 'deposit',
                tokenType: 'erc20',
                amount: BigInt(rawContract.value),
                creationDate: new Date(metadata.blockTimestamp),
                from: from,
                to: daoAddressOrEns,
                token: {
                  address: rawContract.address,
                  decimals,
                  name,
                  symbol,
                },
                transactionId: hash,
              };
            }
          );

        const erc20DepositsList = await Promise.all(erc20DepositsListPromises);

        if (clientTransfers?.length) {
          subgraphTransfers = clientTransfers.filter(
            t => t.type === TransferType.WITHDRAW || t.tokenType === 'native'
          );

          const deposits = clientTransfers.filter(
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
        }

        /* ETH Transfers and withdraws exists in Subgraph therefore only erc20 transfers
          fetched from alchemy api */
        const transfers = [
          ...pendingDepositsTxs,
          ...subgraphTransfers,
          ...erc20DepositsList,
        ].sort(sortByCreatedAt);

        setData(transfers);
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
