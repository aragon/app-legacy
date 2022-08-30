import {
  AddressListProposalListItem,
  Erc20ProposalListItem,
} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';
import {HookData} from 'utils/types';

import {PluginTypes, usePluginClient} from './usePluginClient';

export type Proposal = Erc20ProposalListItem | AddressListProposalListItem;

/**
 * Retrieves list of proposals from SDK
 * NOTE: rename to useDaoProposals once the other hook has been deprecated
 * @param pluginAddress plugin from which proposals will be retrieved
 * @param type plugin type
 * @returns list of proposals on plugin
 */
export function useProposals(
  pluginAddress: string,
  type: PluginTypes
): HookData<Array<Proposal>> {
  const [data, setData] = useState<Array<Proposal>>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const client = usePluginClient(type, pluginAddress);

  useEffect(() => {
    async function getDaoProposals() {
      try {
        setIsLoading(true);

        const proposals = await client?.methods.getProposals({limit: 10});
        if (proposals) setData(proposals);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getDaoProposals();
  }, [client?.methods]);

  return {data, error, isLoading};
}
