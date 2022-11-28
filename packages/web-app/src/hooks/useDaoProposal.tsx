import {useReactiveVar} from '@apollo/client';
import {AddressListProposal, Erc20Proposal} from '@aragon/sdk-client';
import {BigNumber} from 'ethers';
import {useCallback, useEffect, useMemo, useState} from 'react';

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
  const cachedProposals = useReactiveVar(pendingProposalsVar);

  const cachedProposalId = useMemo(
    () => generateCachedProposalId(daoAddress, proposalId),
    [daoAddress, proposalId]
  );

  // add cached vote to proposal and recalculate dependent info
  const augmentProposalWithCache = useCallback(
    (proposal: DetailedProposal) => {
      const cachedVote = cachedVotes[cachedProposalId];

      // no cache return original proposal
      if (!cachedVote) return proposal;

      // if vote in cache is included delete it
      if (proposal.votes.some(voter => voter.address === cachedVote.address)) {
        const newCache = {...cachedVotes};
        delete newCache[cachedProposalId];

        pendingVotesVar({...newCache});
        if (preferences?.functional) {
          localStorage.setItem(
            PENDING_VOTES_KEY,
            JSON.stringify(newCache, customJSONReplacer)
          );
        }
        return proposal;
      } else {
        // return proposal with cached vote
        return addVoteToProposal(proposal, cachedVote);
      }
    },
    [cachedProposalId, cachedVotes, preferences?.functional]
  );

  useEffect(() => {
    async function getDaoProposal() {
      try {
        setIsLoading(true);
        const cachedProposal = cachedProposals[cachedProposalId];
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
    cachedProposalId,
    cachedProposals,
    pluginClient?.methods,
    preferences?.functional,
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
