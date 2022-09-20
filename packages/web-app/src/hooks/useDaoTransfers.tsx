import {IAssetTransfers} from '@aragon/sdk-client/dist/internal/interfaces/client';
import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {useClient} from './useClient';
import {useReactiveVar} from '@apollo/client';

import {pendingDeposits} from 'context/apolloClient';

export const useDaoTransfers = (
  daoAddressOrEns: Address
): HookData<IAssetTransfers> => {
  const {client} = useClient();

  const [data, setData] = useState<IAssetTransfers>({
    deposits: [],
    withdrawals: [],
  });
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const pendingDepositsTxs = useReactiveVar(pendingDeposits);

  useEffect(() => {
    async function getTransfers() {
      try {
        setIsLoading(true);

        const transfers = await client?.methods.getTransfers(daoAddressOrEns);
        if (transfers) {
          if (pendingDepositsTxs.length > 0) {
            for (let i = 0; i < pendingDepositsTxs.length; ) {
              const tx = pendingDepositsTxs[i];

              for (let j = 0; j < transfers.deposits.length; j++) {
                const deposit = transfers.deposits[j];
                if (deposit.transactionId === tx.transactionId) {
                  pendingDepositsTxs.splice(i, 1);
                  break;
                }
                if (j === transfers.deposits.length - 1) {
                  i++;
                }
              }
            }

            localStorage.setItem(
              'pendingDeposits',
              JSON.stringify(pendingDepositsTxs)
            );
          }

          setData({
            ...transfers,
            deposits: [...pendingDepositsTxs, ...transfers.deposits],
          });
        }
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getTransfers();
  }, [client?.methods, daoAddressOrEns, pendingDepositsTxs]);

  return {data, error, isLoading};
};
