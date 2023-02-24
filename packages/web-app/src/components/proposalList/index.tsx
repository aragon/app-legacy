import {MultisigProposalListItem} from '@aragon/sdk-client';
import {
  CardProposal,
  CardProposalProps,
} from '@aragon/ui-components/src/components/cards/cardProposal';
import {BigNumber} from 'ethers';
import React, {useMemo} from 'react';
import {TFunction, useTranslation} from 'react-i18next';
import {generatePath, NavigateFunction, useNavigate} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {trackEvent} from 'services/analytics';
import {
  CHAIN_METADATA,
  PROPOSAL_STATE_LABELS,
  SupportedNetworks,
} from 'utils/constants';
import {translateProposalDate} from 'utils/date';
import {Proposal} from 'utils/paths';
import {
  getErc20Results,
  isErc20VotingProposal,
  TokenVotingOptions,
} from 'utils/proposals';
import {ProposalListItem} from 'utils/types';
import {Spinner} from '@aragon/ui-components';

type ProposalListProps = {
  proposals: Array<ProposalListItem>;
  pluginAddress: string;
  pluginType: PluginTypes;
  isLoading?: boolean;
};

function isMultisigProposalListItem(
  proposal: ProposalListItem | undefined
): proposal is MultisigProposalListItem {
  if (!proposal) return false;
  return 'approvals' in proposal;
}

const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  pluginAddress,
  pluginType,
  isLoading,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();

  const {data: members, isLoading: areMembersLoading} = useDaoMembers(
    pluginAddress,
    pluginType
  );

  const mappedProposals: ({id: string} & CardProposalProps)[] = useMemo(
    () =>
      proposals.map(p =>
        proposal2CardProps(p, members.members.length, network, navigate, t)
      ),
    [proposals, members.members.length, network, navigate, t]
  );

  if (isLoading || areMembersLoading) {
    return (
      <div className="flex justify-center items-center h-7">
        <Spinner size="default" />
      </div>
    );
  }

  if (mappedProposals.length === 0) {
    return (
      <div className="flex justify-center items-center h-7 text-gray-600">
        <p data-testid="proposalList">{t('governance.noProposals')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="proposalList">
      {mappedProposals.map(({id, ...p}) => (
        <CardProposal {...p} key={id} />
      ))}
    </div>
  );
};

function relativeVoteCount(optionCount: number, totalCount: number) {
  if (totalCount === 0) {
    return 0;
  }
  return Math.round((optionCount / totalCount) * 100);
}

export type CardViewProposal = Omit<CardProposalProps, 'onClick'> & {
  id: string;
};

/**
 * Map SDK proposals to proposals to be displayed as CardProposals
 * @param proposals proposal list from SDK
 * @param network supported network name
 * @returns list of proposals ready to be display as CardProposals
 */
export function proposal2CardProps(
  proposal: ProposalListItem,
  membersCount: number,
  network: SupportedNetworks,
  navigate: NavigateFunction,
  t: TFunction
): {id: string} & CardProposalProps {
  const props = {
    id: proposal.id,
    title: proposal.metadata.title,
    description: proposal.metadata.summary,
    explorer: CHAIN_METADATA[network].explorer,
    publisherAddress: proposal.creatorAddress,
    publishLabel: t('governance.proposals.publishedBy'),
    process: proposal.status.toLowerCase() as CardProposalProps['process'],
    onClick: () => {
      trackEvent('governance_viewProposal_clicked', {
        proposal_id: proposal.id,
        dao_address: proposal.dao.address,
      });
      navigate(
        generatePath(Proposal, {
          network,
          dao: proposal.dao.address,
          id: proposal.id,
        })
      );
    },
  };

  if (isErc20VotingProposal(proposal)) {
    const specificProps = {
      voteTitle: t('governance.proposals.voteTitle'),
      stateLabel: PROPOSAL_STATE_LABELS,

      alertMessage: translateProposalDate(
        proposal.status,
        proposal.startDate,
        proposal.endDate
      ),
    };

    const proposalProps = {...props, ...specificProps};

    // calculate winning option for active proposal
    if (proposal.status.toLowerCase() === 'active') {
      const results = getErc20Results(
        proposal.result,
        proposal.token.decimals,
        proposal.totalVotingWeight
      );

      let biggestVoteOption;
      if (
        BigNumber.from(proposal.result.yes).gte(proposal.result.no) &&
        BigNumber.from(proposal.result.yes).gte(proposal.result.abstain)
      ) {
        biggestVoteOption = {
          ...results.yes,
          option: 'yes' as TokenVotingOptions,
        };
      } else if (
        BigNumber.from(proposal.result.no).gte(proposal.result.yes) &&
        BigNumber.from(proposal.result.no).gte(proposal.result.abstain)
      ) {
        biggestVoteOption = {...results.no, option: 'no' as TokenVotingOptions};
      } else {
        biggestVoteOption = {
          ...results.abstain,
          option: 'abstain' as TokenVotingOptions,
        };
      }

      // show winning vote option
      if (
        biggestVoteOption.percentage >
        // TODO: Change this from hardcoded value
        (proposal?.settings?.supportThreshold || 0.5) * 100
      ) {
        const options: {[k in TokenVotingOptions]: string} = {
          yes: t('votingTerminal.yes'),
          no: t('votingTerminal.no'),
          abstain: t('votingTerminal.abstain'),
        };

        const activeProps = {
          voteProgress: biggestVoteOption.percentage,
          voteLabel: options[biggestVoteOption.option],

          tokenSymbol: proposal.token.symbol,
          tokenAmount: biggestVoteOption.value.toString(),
        };
        return {...proposalProps, ...activeProps};
      }

      // don't show any voting options if neither of them has greater than
      // defined support threshold
      return proposalProps;
    } else {
      return proposalProps;
    }
  } else if (isMultisigProposalListItem(proposal)) {
    const specificProps = {
      voteTitle: t('governance.proposals.voteTitleMultisig'),
      stateLabel: PROPOSAL_STATE_LABELS,
      alertMessage: translateProposalDate(
        proposal.status,
        proposal.startDate,
        proposal.endDate
      ),
    };
    if (proposal.status.toLowerCase() === 'active') {
      const activeProps = {
        voteProgress: relativeVoteCount(
          proposal.approvals.length,
          membersCount
        ),
        voteLabel: t('votingTerminal.approvedBy'),
      };
      return {...props, ...specificProps, ...activeProps};
    } else {
      return {...props, ...specificProps};
    }
  } else {
    throw Error('invalid proposal type');
  }
}

export default ProposalList;
