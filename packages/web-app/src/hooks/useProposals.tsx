import {
  AddressListProposalListItem,
  Erc20ProposalListItem,
  ProposalSortBy,
} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';
import {HookData} from 'utils/types';

import {PluginTypes, usePluginClient} from './usePluginClient';

export type Proposal = Erc20ProposalListItem | AddressListProposalListItem;

/**
 * Retrieves list of proposals from SDK
 * NOTE: rename to useDaoProposals once the other hook has been deprecated
 * @param daoAddressOrEns
 * @param type plugin type
 * @returns list of proposals on plugin
 */
export function useProposals(
  daoAddressOrEns: string,
  type: PluginTypes
): HookData<Array<Proposal>> {
  const [data, setData] = useState<Array<Proposal>>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const client = usePluginClient(type);

  useEffect(() => {
    async function getDaoProposals() {
      try {
        setIsLoading(true);

        const proposals = await client?.methods.getProposals({
          sortBy: ProposalSortBy.CREATED_AT,
          daoAddressOrEns,
        });
        if (proposals) setData(proposals);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (daoAddressOrEns) getDaoProposals();
  }, [client?.methods, daoAddressOrEns]);

  return {data, error, isLoading};
}
