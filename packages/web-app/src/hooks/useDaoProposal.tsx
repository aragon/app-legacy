/**
 * NOTE: Because most of these hooks merely returns the fetched
 * data, we can later extract the similar logic into a hook of it's own
 * so we don't have to rewrite the fetch and return pattern every time
 */

import {useReactiveVar} from '@apollo/client';
import {
  AddressListProposal,
  ClientAddressList,
  Erc20Proposal,
} from '@aragon/sdk-client';
import {BigNumber, constants} from 'ethers';
import {useCallback, useEffect, useState} from 'react';

import {pendingProposalsVar, pendingVotesVar} from 'context/apolloClient';
import {isTokenBasedProposal, MappedVotes} from 'utils/proposals';
import {DetailedProposal, Erc20ProposalVote, HookData} from 'utils/types';
import {useClient} from './useClient';
import {PluginTypes, usePluginClient} from './usePluginClient';
import {usePrivacyContext} from 'context/privacyContext';
import {PENDING_PROPOSALS_KEY, PENDING_VOTES_KEY} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';

/**
 * Retrieve a single detailed proposal
 * @param proposalId id of proposal to retrieve
 * @param pluginAddress plugin from which proposals will be retrieved
 * @param pluginType plugin type
 * @returns a detailed proposal
 */

export enum ProposalStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  SUCCEEDED = 'Succeeded',
  EXECUTED = 'Executed',
  DEFEATED = 'Defeated',
}

export const useDaoProposal = (
  proposalId: string,
  pluginAddress: string,
  pluginType: PluginTypes
): HookData<DetailedProposal | undefined> => {
  const [data, setData] = useState<DetailedProposal>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const {client: globalClient} = useClient();
  const pluginClient = usePluginClient(pluginType);

  const {preferences} = usePrivacyContext();
  const cachedVotes = useReactiveVar(pendingVotesVar);
  const cachedProposals = useReactiveVar(pendingProposalsVar);

  const daoAddress = '0x1234567890123456789012345678901234567890';

  // TODO: this method is for dummy usage only, Will remove later

  const getEncodedAction = useCallback(() => {
    const members: string[] = [
      '0x1357924680135792468013579246801357924680',
      '0x2468013579246801357924680135792468013579',
      '0x0987654321098765432109876543210987654321',
    ];

    if (!globalClient || !pluginClient) return;
    const encodedWithdrawAction = globalClient.encoding.withdrawAction(
      daoAddress,
      {
        recipientAddress: '0x1234567890123456789012345678901234567890',
        amount: BigInt('10000000000000000000000'),
        tokenAddress: constants.AddressZero,
        reference: 'test',
      }
    );

    if (pluginType === 'addresslistvoting.dao.eth') {
      const encodedAddMembersAction = Promise.resolve(
        (pluginClient as ClientAddressList).encoding.addMembersAction(
          pluginAddress,
          members
        )
      );

      const encodedRemoveMembersAction = Promise.resolve(
        (pluginClient as ClientAddressList).encoding.removeMembersAction(
          daoAddress,
          members
        )
      );

      return Promise.all([
        encodedWithdrawAction,
        encodedAddMembersAction,
        encodedRemoveMembersAction,
      ]);
    } else return Promise.all([encodedWithdrawAction]);
  }, [globalClient, pluginAddress, pluginClient, pluginType]);

  // add cached vote to proposal and recalculate dependent info
  const augmentProposalWithCache = useCallback(
    (proposal: DetailedProposal) => {
      const cachedVote = cachedVotes[proposal.id];

      // no cache return original proposal
      if (!cachedVote) return proposal;

      // if vote in cache is included delete it
      if (proposal.votes.some(voter => voter.address === cachedVote.address)) {
        const newCache = {...cachedVotes};
        delete newCache[proposal.id];

        pendingVotesVar({...newCache});
        if (preferences?.functional) {
          localStorage.setItem(
            PENDING_VOTES_KEY,
            JSON.stringify(newCache, customJSONReplacer)
          );
        }
        return proposal;
      }

      const voteValue = MappedVotes[cachedVote.vote];
      if (isTokenBasedProposal(proposal)) {
        return {
          ...proposal,
          votes: [...proposal.votes, {...cachedVote}],
          result: {
            ...proposal.result,
            [voteValue]: BigNumber.from(proposal.result[voteValue])
              .add((cachedVote as Erc20ProposalVote).weight)
              .toBigInt(),
          },
          usedVotingWeight: BigNumber.from(proposal.usedVotingWeight)
            .add((cachedVote as Erc20ProposalVote).weight)
            .toBigInt(),
        } as Erc20Proposal;
      } else {
        return {
          ...proposal,
          votes: [...proposal.votes, {...cachedVote}],
          result: {
            ...proposal.result,
            [voteValue]: proposal.result[voteValue] + 1,
          },
        } as AddressListProposal;
      }
    },
    [cachedVotes, preferences?.functional]
  );

  useEffect(() => {
    async function getDaoProposal() {
      try {
        setIsLoading(true);
        const cachedProposal = cachedProposals[proposalId];
        const proposal = await pluginClient?.methods.getProposal(proposalId);

        const encodedActions = await getEncodedAction();
        if (proposal && encodedActions) proposal.actions = encodedActions;

        if (proposal) {
          setData({...augmentProposalWithCache(proposal)});

          // remove cache there's already a proposal
          if (cachedProposal) {
            pendingProposalsVar({});
            if (preferences?.functional) {
              localStorage.setItem(PENDING_PROPOSALS_KEY, '{}');
            }
          }
        } else if (cachedProposal) {
          setData({
            ...augmentProposalWithCache(cachedProposal),
          });
        }
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    getDaoProposal();
  }, [
    augmentProposalWithCache,
    cachedProposals,
    getEncodedAction,
    pluginClient?.methods,
    preferences?.functional,
    proposalId,
  ]);

  return {data, error, isLoading};
};
