/**
 * NOTE: Because most of these hooks merely returns the fetched
 * data, we can later extract the similar logic into a hook of it's own
 * so we don't have to rewrite the fetch and return pattern every time
 */

import {useReactiveVar} from '@apollo/client';
import {AddressListProposal, Erc20Proposal} from '@aragon/sdk-client';
import {BigNumber} from 'ethers';
import {useCallback, useEffect, useState} from 'react';

import {pendingProposalsVar, pendingVotesVar} from 'context/apolloClient';
import {isTokenBasedProposal, MappedVotes} from 'utils/proposals';
import {DetailedProposal, Erc20ProposalVote, HookData} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';
import {usePrivacyContext} from 'context/privacyContext';
import {PENDING_PROPOSALS_KEY, PENDING_VOTES_KEY} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';

/**
 * Retrieve a single detailed proposal
 * @param proposalId id of proposal to retrieve
 * @param pluginType plugin type
 * @returns a detailed proposal
 */

export const useDaoProposal = (
  proposalId: string,
  pluginType: PluginTypes
): HookData<DetailedProposal | undefined> => {
  const [data, setData] = useState<DetailedProposal>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const pluginClient = usePluginClient(pluginType);

  const {preferences} = usePrivacyContext();
  const cachedVotes = useReactiveVar(pendingVotesVar);
  const cachedProposals = useReactiveVar(pendingProposalsVar);

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
    if (proposalId) getDaoProposal();
  }, [
    augmentProposalWithCache,
    cachedProposals,
    pluginClient?.methods,
    preferences?.functional,
    proposalId,
  ]);

  return {data, error, isLoading};
};
