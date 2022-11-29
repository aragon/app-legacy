import {useReactiveVar} from '@apollo/client';
import {AddressListProposal, Erc20Proposal} from '@aragon/sdk-client';
import {BigNumber} from 'ethers';
import {useCallback, useEffect, useState} from 'react';

import {pendingProposalsVar, pendingVotesVar} from 'context/apolloClient';
import {usePrivacyContext} from 'context/privacyContext';
import {PENDING_PROPOSALS_KEY, PENDING_VOTES_KEY} from 'utils/constants';
import {customJSONReplacer, generateCachedProposalId} from 'utils/library';
import {isTokenBasedProposal, MappedVotes} from 'utils/proposals';
import {
  AddressListVote,
  DetailedProposal,
  Erc20ProposalVote,
  HookData,
} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';

/**
 * Retrieve a single detailed proposal
 * @param proposalId id of proposal to retrieve
 * @param pluginType plugin type
 * @returns a detailed proposal
 */
export const useDaoProposal = (
  daoAddress: string,
  proposalId: string,
  pluginType: PluginTypes
): HookData<DetailedProposal | undefined> => {
  const [data, setData] = useState<DetailedProposal>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const pluginClient = usePluginClient(pluginType);

  const {preferences} = usePrivacyContext();
  const cachedVotes = useReactiveVar(pendingVotesVar);
  const proposalCache = useReactiveVar(pendingProposalsVar);

  // add cached vote to proposal and recalculate dependent info
  const augmentWithVoteCache = useCallback(
    (proposal: DetailedProposal) => {
      const id = generateCachedProposalId(daoAddress, proposalId);
      const cachedVote = cachedVotes[id];

      // no cache return original proposal
      if (!cachedVote) return proposal;

      // vote in cache is returned from SDK, delete cache
      if (proposal.votes.some(v => v.address === cachedVote.address)) {
        const newVoteCache = {...cachedVotes};
        delete newVoteCache[id];

        // update cache
        pendingVotesVar(newVoteCache);
        if (preferences?.functional) {
          localStorage.setItem(
            PENDING_VOTES_KEY,
            JSON.stringify(newVoteCache, customJSONReplacer)
          );
        }

        return proposal;
      } else {
        // augment with cached vote
        return addVoteToProposal(proposal, cachedVote);
      }
    },
    [cachedVotes, daoAddress, preferences?.functional, proposalId]
  );

  useEffect(() => {
    async function getDaoProposal() {
      try {
        setIsLoading(true);

        const cachedProposal = proposalCache[daoAddress][proposalId];

        const proposal = await pluginClient?.methods.getProposal(proposalId);
        if (proposal) {
          setData({
            ...augmentWithVoteCache(proposal),
          });

          // remove cached proposal if it exists
          if (cachedProposal) {
            const newCache = {...proposalCache};
            delete newCache[daoAddress][proposalId];

            // update new values
            pendingProposalsVar(newCache);

            if (preferences?.functional) {
              localStorage.setItem(
                PENDING_PROPOSALS_KEY,
                JSON.stringify(newCache, customJSONReplacer)
              );
            }
          }
        } else if (cachedProposal) {
          setData({
            ...augmentWithVoteCache(cachedProposal),
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
    augmentWithVoteCache,
    daoAddress,
    pluginClient?.methods,
    preferences?.functional,
    proposalCache,
    proposalId,
  ]);

  return {data, error, isLoading};
};

/**
 * Augment proposal with vote
 * @param proposal proposal to be augmented with vote
 * @param vote
 * @returns a proposal augmented with a singular vote
 */
function addVoteToProposal(
  proposal: DetailedProposal,
  vote: AddressListVote | Erc20ProposalVote
): DetailedProposal {
  // calculate new vote values including cached ones
  const voteValue = MappedVotes[vote.vote];
  if (isTokenBasedProposal(proposal)) {
    // Token-based calculation
    return {
      ...proposal,
      votes: [...proposal.votes, {...vote}],
      result: {
        ...proposal.result,
        [voteValue]: BigNumber.from(proposal.result[voteValue])
          .add((vote as Erc20ProposalVote).weight)
          .toBigInt(),
      },
      usedVotingWeight: BigNumber.from(proposal.usedVotingWeight)
        .add((vote as Erc20ProposalVote).weight)
        .toBigInt(),
    } as Erc20Proposal;
  } else {
    // AddressList calculation
    return {
      ...proposal,
      votes: [...proposal.votes, {...vote}],
      result: {
        ...proposal.result,
        [voteValue]: proposal.result[voteValue] + 1,
      },
    } as AddressListProposal;
  }
}
