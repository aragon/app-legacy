import {CardProposal, CardProposalProps} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {Proposal} from 'hooks/useProposals';
import {
  CHAIN_METADATA,
  PROPOSAL_STATE_LABELS,
  SupportedNetworks,
} from 'utils/constants';
import {translateProposalDate} from 'utils/date';
import {i18n} from '../../../i18n.config';
import {trackEvent} from 'services/analytics';
import {formatUnits} from 'utils/library';
import {abbreviateTokenAmount} from 'utils/tokens';

type ProposalListProps = {
  proposals: Array<Proposal>;
};

const ProposalList: React.FC<ProposalListProps> = ({proposals}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {dao} = useParams();
  const navigate = useNavigate();

  if (proposals.length === 0)
    return <p data-testid="proposalList">{t('governance.noProposals')}</p>;

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
  proposals: Array<Proposal>,
  network: SupportedNetworks
): Array<CardViewProposal> {
  return proposals.map(({metadata, result, ...proposal}) => {
    const totalVoteCount =
      Number(result.abstain) + Number(result.yes) + Number(result.no);

    return {
      id: proposal.id,
      title: metadata.title,
      description: metadata.summary,
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
              Number(result.yes) || 0,
              totalVoteCount
            ),
            voteLabel: i18n.t('labels.yes'),
            tokenAmount:
              'token' in proposal
                ? abbreviateTokenAmount(
                    parseFloat(
                      Number(
                        formatUnits(result.yes, proposal.token.decimals)
                      ).toFixed(2)
                    ).toString()
                  )
                : totalVoteCount.toString(),
            ...('token' in proposal
              ? {tokenSymbol: proposal.token.symbol}
              : {}),
          }
        : {}),
    };
  });
}

export default ProposalList;
