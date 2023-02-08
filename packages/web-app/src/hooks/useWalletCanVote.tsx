import {useEffect, useState} from 'react';
import {MultisigClient, TokenVotingClient} from '@aragon/sdk-client';

import {stripPlgnAdrFromProposalId} from 'utils/proposals';
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

  const isMultisigClient = pluginType === 'multisig.plugin.dao.eth';
  const isTokenVotingClient = pluginType === 'token-voting.plugin.dao.eth';

  const client = usePluginClient(pluginType);

  useEffect(() => {
    async function fetchCanVote() {
      if (!address || !proposalId || !pluginAddress || !pluginType) {
        setData(false);
        return;
      }

      try {
        setIsLoading(true);
        let canVote;

        if (isMultisigClient) {
          canVote = await (client as MultisigClient)?.methods.canApprove({
            proposalId: BigInt(stripPlgnAdrFromProposalId(proposalId)),
            pluginAddress,
            addressOrEns: address,
          });
        } else if (isTokenVotingClient) {
          canVote = await (client as TokenVotingClient)?.methods.canVote({
            address,
            proposalId: stripPlgnAdrFromProposalId(proposalId),
            pluginAddress,
          });
        }

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
  }, [
    address,
    client,
    isMultisigClient,
    isTokenVotingClient,
    pluginAddress,
    pluginType,
    proposalId,
  ]);

  return {data, error, isLoading};
};
