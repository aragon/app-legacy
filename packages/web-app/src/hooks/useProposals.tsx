import {useReactiveVar} from '@apollo/client';
import {
  AddressListProposalListItem,
  Erc20ProposalListItem,
  ProposalSortBy,
} from '@aragon/sdk-client';
import {BigNumber} from 'ethers';
import {useCallback, useEffect, useState} from 'react';

import {pendingProposalsVar, pendingVotesVar} from 'context/apolloClient';
import {usePrivacyContext} from 'context/privacyContext';
import {PENDING_PROPOSALS_KEY} from 'utils/constants';
import {customJSONReplacer, generateCachedProposalId} from 'utils/library';
import {isTokenBasedProposal, MappedVotes} from 'utils/proposals';
import {
  AddressListVote,
  DetailedProposal,
  Erc20ProposalVote,
  HookData,
} from 'utils/types';

import {PluginTypes, usePluginClient} from './usePluginClient';

export type Proposal = Erc20ProposalListItem | AddressListProposalListItem;

/**
 * Retrieves list of proposals from SDK
 * NOTE: rename to useDaoProposals once the other hook has been deprecated
 * @param daoAddress
 * @param type plugin type
 * @returns list of proposals on plugin
 */
export function useProposals(
  daoAddress: string,
  type: PluginTypes
): HookData<Array<Proposal>> {
  const [data, setData] = useState<Array<Proposal>>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const client = usePluginClient(type);

  const {preferences} = usePrivacyContext();
  const cachedVotes = useReactiveVar(pendingVotesVar);
  const proposalCache = useReactiveVar(pendingProposalsVar);

  const augmentProposalsWithCache = useCallback(
    (fetchedProposals: Proposal[]) => {
      const newCache = {...proposalCache};
      const augmentedProposals = [...fetchedProposals];

      for (const key in proposalCache) {
        const cachedProposalIsFetched = fetchedProposals.some(
          p => key === generateCachedProposalId(daoAddress, p.id)
        );

        // proposal already picked up; delete it
        if (cachedProposalIsFetched) {
          delete newCache[key];
        } else {
          // proposal not yet fetched, augment and add votes if necessary
          augmentedProposals.unshift({
            ...addVoteToProposal(proposalCache[key], cachedVotes[key]),
          } as Proposal);
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
    [daoAddress, preferences?.functional]
  );

  useEffect(() => {
    async function getDaoProposals() {
      try {
        setIsLoading(true);

        const proposals = await client?.methods.getProposals({
          sortBy: ProposalSortBy.CREATED_AT,
          daoAddressOrEns: daoAddress,
        });

        setData([...augmentProposalsWithCache(proposals || [])]);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (daoAddress) getDaoProposals();
  }, [augmentProposalsWithCache, client?.methods, daoAddress]);

  return {data, error, isLoading};
}

/**
 * Augment proposal with vote
 * @param proposal proposal to be augmented with vote
 * @param vote
 * @returns a proposal augmented with a singular vote, or
 * the given proposal if no vote is given.
 */
function addVoteToProposal(
  proposal: DetailedProposal,
  vote: AddressListVote | Erc20ProposalVote
): Proposal {
  if (!vote) return proposal;

  // calculate new vote values including cached ones
  const voteValue = MappedVotes[vote.vote];
  if (isTokenBasedProposal(proposal)) {
    // Token-based calculation
    return {
      ...proposal,

      result: {
        ...proposal.result,
        [voteValue]: BigNumber.from(proposal.result[voteValue])
          .add((vote as Erc20ProposalVote).weight)
          .toBigInt(),
      },
    };
  } else {
    // AddressList calculation
    return {
      ...proposal,

      result: {
        ...proposal.result,
        [voteValue]: proposal.result[voteValue] + 1,
      },
    };
  }
}
