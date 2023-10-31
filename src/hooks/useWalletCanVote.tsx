import {
  MultisigClient,
  TokenVotingClient,
  VoteValues,
} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';
import {HookData, ProposalId} from 'utils/types';
import {
  GaselessPluginName,
  PluginTypes,
  usePluginClient,
} from './usePluginClient';
import {useClient as useVocdoniClient} from '@vocdoni/react-providers';

/**
 * Check whether wallet is eligible to vote on proposal
 * @param address wallet address
 * @param proposalId proposal id
 * @param pluginAddress plugin for which voting eligibility will be calculated
 * @param pluginType plugin type
 * @param proposalStatus
 * @param gaslessProposalId if is a gasless proposal, the id of the proposal on the vochain
 * @returns whether given wallet address is allowed to vote on proposal with given id
 */
export const useWalletCanVote = (
  address: string | null,
  proposalId: string,
  pluginAddress: string,
  pluginType?: PluginTypes,
  proposalStatus?: string,
  gaslessProposalId?: string
): HookData<boolean> => {
  const [data, setData] = useState([false, false, false] as
    | boolean[]
    | boolean);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const isMultisigClient = pluginType === 'multisig.plugin.dao.eth';
  const isTokenVotingClient = pluginType === 'token-voting.plugin.dao.eth';
  const isGaslessVoting = pluginType === GaselessPluginName;

  const client = usePluginClient(pluginType);
  const {client: vocdoniClient} = useVocdoniClient();

  useEffect(() => {
    async function fetchOnchainVoting() {
      let canVote;

      if (isMultisigClient) {
        canVote = [
          await (client as MultisigClient)?.methods.canApprove({
            proposalId,
            approverAddressOrEns: address,
          }),
        ];
      } else if (isTokenVotingClient) {
        const canVoteValuesPromises = [
          VoteValues.ABSTAIN,
          VoteValues.NO,
          VoteValues.YES,
        ].map(vote => {
          return (client as TokenVotingClient)?.methods.canVote({
            voterAddressOrEns: address,
            proposalId,
            vote,
          });
        });
        canVote = await Promise.all(canVoteValuesPromises);
      }

      if (canVote !== undefined) setData(canVote);
      else setData([false, false, false]);
    }

    async function fetchCanVoteGasless() {
      let canVote = false;
      if (gaslessProposalId) {
        canVote = await vocdoniClient.isInCensus(gaslessProposalId);
        if (canVote) {
          canVote =
            (await vocdoniClient.hasAlreadyVoted(gaslessProposalId)) === null;
        }
      }
      setData(canVote);
    }

    async function fetchCanVote() {
      if (!address || !proposalId || !pluginAddress || !pluginType) {
        setData(false);
        return;
      }

      try {
        setIsLoading(true);
        isGaslessVoting
          ? await fetchCanVoteGasless()
          : await fetchOnchainVoting();
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
    isGaslessVoting,
    isTokenVotingClient,
    gaslessProposalId,
    pluginAddress,
    pluginType,
    proposalId,
    proposalStatus,
    vocdoniClient,
  ]);

  return {
    data: Array.isArray(data) ? data.some(v => v) : data,
    error,
    isLoading,
  };
};
