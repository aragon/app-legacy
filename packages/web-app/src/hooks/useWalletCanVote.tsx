import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';

/**
 * Check whether wallet is eligible to vote on proposal
 * @param address wallet address
 * @param proposalId proposal id
 * @param pluginAddress plugin for which voting eligibility will be calculated
 * @param pluginType plugin type
 * @returns whether given wallet address is allowed to vote on proposal with given id
 */
export const useWalletCanVote = (
  address: string | null,
  proposalId: string,
  pluginAddress: string,
  pluginType?: PluginTypes
): HookData<boolean> => {
  const [data, setData] = useState(false);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const client = usePluginClient(pluginAddress, pluginType);

  useEffect(() => {
    async function fetchCanVote() {
      if (!address || !proposalId || !pluginAddress || !pluginType) {
        setData(false);
        return;
      }

      try {
        setIsLoading(true);

        const canVote = await client?.methods.canVote({
          address,
          proposalId,
          pluginAddress,
        });

        if (canVote !== undefined) setData(canVote);
        else setData(false);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCanVote();
  }, [address, client?.methods, pluginAddress, pluginType, proposalId]);

  return {data, error, isLoading};
};
