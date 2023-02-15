import {CardProposal, CardProposalProps, Spinner} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {trackEvent} from 'services/analytics';
import {
  CHAIN_METADATA,
  PROPOSAL_STATE_LABELS,
  SupportedNetworks,
} from 'utils/constants';
import {translateProposalDate} from 'utils/date';
import {formatUnits} from 'utils/library';
import {isErc20VotingProposal} from 'utils/proposals';
import {abbreviateTokenAmount} from 'utils/tokens';
import {ProposalListItem} from 'utils/types';
import {i18n} from '../../../i18n.config';

type ProposalListProps = {
  proposals: Array<ProposalListItem>;
  isLoading?: boolean;
};

const ProposalList: React.FC<ProposalListProps> = ({proposals, isLoading}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {dao} = useParams();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-7">
        <Spinner size="default" />
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="flex justify-center items-center h-7 text-gray-600">
        <p data-testid="proposalList">{t('governance.noProposals')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="proposalList">
      {mapToCardViewProposal(proposals, network).map(({id, ...proposal}) => (
        <CardProposal
          {...proposal}
          key={id}
          onClick={() => {
            trackEvent('governance_viewProposal_clicked', {
              proposal_id: id,
              dao_address: dao,
            });
            navigate(`proposals/${id}`);
          }}
        />
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
export function mapToCardViewProposal(
  proposals: Array<ProposalListItem>,
  network: SupportedNetworks
): Array<CardViewProposal> {
  return proposals.map(proposal => {
    if (isErc20VotingProposal(proposal)) {
      const totalVoteCount =
        Number(proposal.result.abstain) +
        Number(proposal.result.yes) +
        Number(proposal.result.no);

      return {
        id: proposal.id,
        title: proposal.metadata.title,
        description: proposal.metadata.summary,
        process: proposal.status.toLowerCase() as CardProposalProps['process'],
        explorer: CHAIN_METADATA[network].explorer,
        publisherAddress: proposal.creatorAddress,
        publishLabel: i18n.t('governance.proposals.publishedBy'),
        voteTitle: i18n.t('governance.proposals.voteTitle'),
        stateLabel: PROPOSAL_STATE_LABELS,

        alertMessage: translateProposalDate(
          proposal.status,
          proposal.startDate,
          proposal.endDate
        ),

        ...(proposal.status.toLowerCase() === 'active'
          ? {
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
            }
          : {}),
      };
    }

    return {
      id: proposal.id,
      title: proposal.metadata.title,
      description: proposal.metadata.summary,
      explorer: CHAIN_METADATA[network].explorer,
      publisherAddress: proposal.creatorAddress,
      publishLabel: i18n.t('governance.proposals.publishedBy'),
      voteTitle: i18n.t('governance.proposals.voteTitle'),
      stateLabel: PROPOSAL_STATE_LABELS,
    } as CardViewProposal;
  });
}

export default ProposalList;
