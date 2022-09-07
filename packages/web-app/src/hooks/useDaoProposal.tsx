/**
 * NOTE: Because most of these hooks merely returns the fetched
 * data, we can later extract the similar logic into a hook of it's own
 * so we don't have to rewrite the fetch and return pattern every time
 */

import {AddressListProposal, Erc20Proposal} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';

export type DetailedProposal = Erc20Proposal | AddressListProposal;

/**
 * Retrieve a single detailed proposal
 * @param proposalId id of proposal to retrieve
 * @param pluginAddress plugin from which proposals will be retrieved
 * @param type plugin type
 * @returns a detailed proposal
 */
export const useDaoProposal = (
  proposalId: string,
  pluginAddress: string,
  type: PluginTypes
): HookData<DetailedProposal | undefined> => {
  const [data, setData] = useState<DetailedProposal>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const client = usePluginClient(type, pluginAddress);

  useEffect(() => {
    async function getDaoProposal() {
      try {
        setIsLoading(true);

        const proposal = await client?.methods.getProposal(proposalId);
        if (proposal) setData(proposal);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getDaoProposal();
  }, [client?.methods, proposalId]);

  return {data, error, isLoading};
};
