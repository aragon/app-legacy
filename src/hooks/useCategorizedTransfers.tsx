// import {getDateSections} from 'utils/date';

import {isThisMonth, isThisWeek} from 'date-fns';
import {useEffect, useState} from 'react';

import {HookData, Transfer} from 'utils/types';
import {useDaoTransfers} from './useDaoTransfers';
import {usePollTransfersPrices} from './usePollTransfersPrices';

export type CategorizedTransfer = {
  week: Transfer[];
  month: Transfer[];
  year: Transfer[];
};

/**
 * Split transfer data into three categories based on their date attribute.
 *
 * @return An object containing three array of transfers. One containing all
 * transfers before last month, one containing all transfer of the last month
 * (excluding the last week), and one containing only this weeks transfers.
 *
 */
export default function useCategorizedTransfers(
  daoAddress: string
): HookData<CategorizedTransfer> & {
  totalTransfers: string;
} {
  const {data: daoTransfers} = useDaoTransfers(daoAddress);
  const {
    data: {transfers, totalTransfersValue},
  } = usePollTransfersPrices(daoTransfers);

  // const sections = getDateSections(); // Sections will dynamically set based
  // on today date

  // Instead of using hard-coded data, this hook should eventually  get its data
  // from a graphQL client.

  const init: CategorizedTransfer = {
    week: [],
    month: [],
    year: [],
  };
  const [categorizedTransfers, setCategorizedTransfers] =
    useState<CategorizedTransfer>(init);

  useEffect(() => {
    const week: Transfer[] = [];
    const month: Transfer[] = [];
    const year: Transfer[] = [];

    transfers.forEach(t => {
      const millisecondsTimestamp = t.transferTimestamp as number;
      if (isThisWeek(millisecondsTimestamp)) {
        week.push(t);
      } else if (isThisMonth(millisecondsTimestamp)) {
        month.push(t);
      } else {
        year.push(t);
      }
    });
    setCategorizedTransfers({
      week,
      month,
      year,
    });
  }, [transfers, setCategorizedTransfers]);

  return {
    data: categorizedTransfers,
    totalTransfers: totalTransfersValue,
    isLoading: false,
  };
}
