import {CardProposal, CardProposalProps, Spinner} from '@aragon/ui-components';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, NavigateFunction, useNavigate} from 'react-router-dom';

import {MultisigProposalListItem} from '@aragon/sdk-client';
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
import {formatUnits} from 'utils/library';
import {Proposal} from 'utils/paths';
import {isErc20VotingProposal} from 'utils/proposals';
import {abbreviateTokenAmount} from 'utils/tokens';
import {ProposalListItem} from 'utils/types';
import {i18n} from '../../../i18n.config';

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
        proposal2CardProps(p, members.members.length, network, navigate)
      ),
    [proposals, network, navigate, members.members]
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
  navigate: NavigateFunction
): {id: string} & CardProposalProps {
  const props = {
    id: proposal.id,
    title: proposal.metadata.title,
    description: proposal.metadata.summary,
    explorer: CHAIN_METADATA[network].explorer,
    publisherAddress: proposal.creatorAddress,
    publishLabel: i18n.t('governance.proposals.publishedBy'),
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
    const totalVoteCount =
      Number(proposal.result.abstain) +
      Number(proposal.result.yes) +
      Number(proposal.result.no);

    const specificProps = {
      voteTitle: i18n.t('governance.proposals.voteTitle'),
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
          Number(proposal.result.yes) || 0,
          totalVoteCount
        ),
        voteLabel: i18n.t('labels.yes'),

        tokenSymbol: proposal.token.symbol,
        tokenAmount: abbreviateTokenAmount(
          parseFloat(
            Number(
              formatUnits(proposal.result.yes, proposal.token.decimals)
            ).toFixed(2)
          ).toString()
        ),
      };
      return {...props, ...specificProps, ...activeProps};
    } else {
      return {...props, ...specificProps};
    }
  } else if (isMultisigProposalListItem(proposal)) {
    const specificProps = {
      voteTitle: i18n.t('governance.proposals.voteTitleMultisig'),
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
        voteLabel: i18n.t('votingTerminal.approvedBy'),
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
