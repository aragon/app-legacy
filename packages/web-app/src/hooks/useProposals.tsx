import {useReactiveVar} from '@apollo/client';
import {
  AddressListProposalListItem,
  Erc20ProposalListItem,
  ProposalSortBy,
} from '@aragon/sdk-client';
import {pendingProposalsVar} from 'context/apolloClient';
import {usePrivacyContext} from 'context/privacyContext';
import {useCallback, useEffect, useState} from 'react';
import {PENDING_PROPOSALS_KEY} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';
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

  const {preferences} = usePrivacyContext();
  const proposalCache = useReactiveVar(pendingProposalsVar);

  const augmentProposalsWithCache = useCallback(
    (fetchedProposals: Proposal[]) => {
      const newCache = {...proposalCache};
      const augmentedProposals = [...fetchedProposals];

      for (const key in proposalCache) {
        if (fetchedProposals.some(p => p.id === key)) {
          // proposal already picked up
          delete newCache[key];
        } else {
          augmentedProposals.unshift({...proposalCache[key]} as Proposal);
        }
      }

      // cache and store new values
      pendingProposalsVar(newCache);
      if (preferences?.functional) {
        localStorage.setItem(
          PENDING_PROPOSALS_KEY,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }

      return augmentedProposals;
    },

    // intentionally leaving out proposalCache so that this doesn't
    // get re-run when items are removed from the cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [preferences?.functional]
  );

  useEffect(() => {
    async function getDaoProposals() {
      try {
        setIsLoading(true);

        const proposals = await client?.methods.getProposals({
          sortBy: ProposalSortBy.CREATED_AT,
          daoAddressOrEns,
        });

        setData([...augmentProposalsWithCache(proposals || [])]);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (daoAddressOrEns) getDaoProposals();
  }, [augmentProposalsWithCache, client?.methods, daoAddressOrEns]);

  return {data, error, isLoading};
}
