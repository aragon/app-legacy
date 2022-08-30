import {CardProposal, CardProposalProps} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {useNetwork} from 'context/network';
import {Proposal} from 'hooks/useProposals';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {translateProposalDate} from 'utils/date';
import {i18n} from '../../../i18n.config';

type ProposalListProps = {
  proposals: Array<Proposal>;
};

const ProposalList: React.FC<ProposalListProps> = ({proposals}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  if (proposals.length === 0)
    return <p data-testid="proposalList">{t('governance.noProposals')}</p>;

  return (
    <div className="space-y-3" data-testid="proposalList">
      {mapToCardViewProposal(proposals, network).map(({id, ...proposal}) => (
        <CardProposal
          {...proposal}
          key={id}
          // TODO: uncomment when proposal details is fixed
          // onClick={() => navigate(`proposals/${id}`)}
          onClick={() => null}
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
      voteTitle: i18n.t('governance.proposals.voteTitle'),

      chainId: CHAIN_METADATA[network].id,
      publishLabel: i18n.t('governance.proposals.publishedBy'),
      publisherAddress: proposal.creatorAddress,
      alertMessage:
        translateProposalDate(
          proposal.status.toLowerCase(),
          proposal.startDate.getTime().toString(),
          proposal.endDate.getTime().toString()
        ) || undefined,
      stateLabel: [
        i18n.t('governance.proposals.states.draft'),
        i18n.t('governance.proposals.states.pending'),
        i18n.t('governance.proposals.states.active'),
        i18n.t('governance.proposals.states.executed'),
        i18n.t('governance.proposals.states.succeeded'),
        i18n.t('governance.proposals.states.defeated'),
      ],

      ...(proposal.status.toLowerCase() === 'active'
        ? {
            voteProgress: relativeVoteCount(
              Number(result.yes) || 0,
              totalVoteCount
            ),
            voteLabel: i18n.t('newProposal.configureActions.yesOption'),
            tokenAmount: totalVoteCount.toString(),
            ...('token' in proposal
              ? {tokenSymbol: proposal.token.symbol}
              : {}),
          }
        : {}),
    };
  });
}

export default ProposalList;
