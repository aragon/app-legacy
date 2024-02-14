import {CardProposal, CardProposalProps} from '@aragon/ods-old';
import {MultisigProposalListItem} from '@aragon/sdk-client';
import {ProposalStatus} from '@aragon/sdk-client-common';
import {BigNumber} from 'ethers';
import {TFunction} from 'i18next';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {NavigateFunction, generatePath, useNavigate} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {
  CHAIN_METADATA,
  PROPOSAL_STATE_LABELS,
  SupportedNetworks,
} from 'utils/constants';
import {translateProposalDate} from 'utils/date';
import {featureFlags} from 'utils/featureFlags';
import {Proposal} from 'utils/paths';
import {
  TokenVotingOptions,
  getErc20Results,
  isErc20VotingProposal,
  stripPlgnAdrFromProposalId,
  isGaslessProposal,
} from 'utils/proposals';
import {ProposalListItem} from 'utils/types';
import {useIsUpdateProposal} from 'hooks/useIsUpdateProposal';
import {Spinner} from '@aragon/ods';

type ProposalListProps = {
  proposals: Array<ProposalListItem>;
  daoAddressOrEns: string;
  pluginAddress: string;
  pluginType: PluginTypes;
  isLoading?: boolean;
};

type OptionResult = {
  [K in TokenVotingOptions]: {
    value: string | number;
    percentage: number;
    option: K;
  };
};

function isMultisigProposalListItem(
  proposal: ProposalListItem | undefined
): proposal is MultisigProposalListItem {
  if (!proposal) return false;
  return 'approvals' in proposal;
}

type ProposalListItemProps = CardProposalProps & {
  proposalId: string;
};

const ProposalItem: React.FC<ProposalListItemProps> = ({
  proposalId,
  ...props
}) => {
  const {t} = useTranslation();
  const [{data: isPluginUpdate}, {data: isOSUpdate}] =
    useIsUpdateProposal(proposalId);

  return (
    <CardProposal
      {...props}
      bannerContent={
        (isPluginUpdate || isOSUpdate) &&
        featureFlags.getValue('VITE_FEATURE_FLAG_OSX_UPDATES') === 'true'
          ? t('update.proposal.bannerTitle')
          : ''
      }
    />
  );
};

type MappedProposal = CardProposalProps & {
  id: string;
  //actions: DaoAction[];
};

const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  daoAddressOrEns,
  pluginAddress,
  pluginType,
  isLoading,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {address} = useWallet();
  const navigate = useNavigate();

  const {data: members, isLoading: areMembersLoading} = useDaoMembers(
    pluginAddress,
    pluginType,
    {countOnly: true}
  );

  const mappedProposals: MappedProposal[] = useMemo(
    () =>
      proposals.map(p =>
        proposal2CardProps(
          p,
          members.memberCount,
          network,
          navigate,
          t,
          daoAddressOrEns,
          address
        )
      ),
    [
      proposals,
      members.memberCount,
      network,
      navigate,
      t,
      daoAddressOrEns,
      address,
    ]
  );

  if (isLoading || areMembersLoading) {
    return (
      <div className="flex h-14 items-center justify-center">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (mappedProposals.length === 0) {
    return (
      <div className="flex h-14 items-center justify-center text-neutral-600">
        <p data-testid="proposalList">{t('governance.noProposals')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="proposalList">
      {mappedProposals.map(({id, ...p}) => (
        <ProposalItem {...p} proposalId={id} key={id} />
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

/**
 * Map SDK proposals to proposals to be displayed as CardProposals
 * @param proposals proposal list from SDK
 * @param network supported network name
 * @returns list of proposals ready to be display as CardProposals
 */
export function proposal2CardProps(
  proposal: ProposalListItem,
  memberCount: number,
  network: SupportedNetworks,
  navigate: NavigateFunction,
  t: TFunction,
  daoAddressOrEns: string,
  address: string | null
): MappedProposal {
  const publisherDisplayName =
    address && proposal.creatorAddress.toLowerCase() === address.toLowerCase()
      ? t('labels.you')
      : proposal.creatorAddress;

  const props = {
    id: proposal.id,
    title: proposal.metadata.title,
    description: proposal.metadata.summary,
    explorer: CHAIN_METADATA[network].explorer,
    publisherAddress: proposal.creatorAddress,
    publisherDisplayName,
    publishLabel: t('governance.proposals.publishedBy'),
    process: proposal.status.toLowerCase() as CardProposalProps['process'],
    //actions: proposal.actions,
    onClick: () => {
      trackEvent('governance_viewProposal_clicked', {
        proposal_id: proposal.id,
        dao_address: proposal.dao.address,
      });
      navigate(
        generatePath(Proposal, {
          network,
          dao: daoAddressOrEns,
          id: proposal.id,
        })
      );
    },
  };

  if (isGaslessProposal(proposal)) {
    let alertMessage;
    if (proposal.status === ProposalStatus.SUCCEEDED) {
      const preStr = t('labels.approvals');
      alertMessage = `${preStr} ${translateProposalDate(
        ProposalStatus.ACTIVE,
        proposal.endDate,
        proposal.tallyEndDate
      )}`;
    } else {
      alertMessage = translateProposalDate(
        proposal.status,
        proposal.startDate,
        proposal.endDate
      );
    }
    const specificProps = {
      voteTitle: t('governance.proposals.voteTitle'),
      stateLabel: PROPOSAL_STATE_LABELS,
      alertMessage: alertMessage,
      title: proposal.metadata.title,
      description: proposal.metadata.description,
    };
    return {...props, ...specificProps};
  } else if (isErc20VotingProposal(proposal)) {
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
      const results = getErc20Results(proposal.result, proposal.token.decimals);

      // The winning option is the outcome of the proposal if duration was to be reached
      // as is. Note that the "yes" option can only be "winning" if it has met the support
      // threshold criteria (N_yes / (N_yes + N_no)) > supportThreshold
      let winningOption: OptionResult[TokenVotingOptions] | undefined;

      const yesNoCount = BigNumber.from(proposal.result.yes).add(
        proposal.result.no
      );

      // if there are any votes find the winning option
      if (yesNoCount.gt(0)) {
        if (
          BigNumber.from(proposal.result.yes).div(yesNoCount).toNumber() >
          proposal.settings.supportThreshold
        ) {
          winningOption = {...results.yes, option: 'yes'};
        } else {
          // technically abstain never "wins" the vote, but showing on UI
          // if there are more 'abstain' votes than 'no' votes
          winningOption = BigNumber.from(proposal.result.no).gte(
            proposal.result.abstain
          )
            ? {...results.no, option: 'no'}
            : {...results.abstain, option: 'abstain'};
        }
      } else {
        if (BigNumber.from(proposal.result.abstain).gt(0))
          winningOption = {...results.abstain, option: 'abstain'};
      }

      // show winning vote option
      if (winningOption) {
        const options: {[k in TokenVotingOptions]: string} = {
          yes: t('votingTerminal.yes'),
          no: t('votingTerminal.no'),
          abstain: t('votingTerminal.abstain'),
        };

        const votedAlertLabel = proposal.votes?.some(
          v => v.address.toLowerCase() === address?.toLowerCase()
        )
          ? t('governance.proposals.alert.voted')
          : undefined;

        const activeProps = {
          voteProgress: winningOption.percentage,
          voteLabel: options[winningOption.option],
          tokenSymbol: proposal.token.symbol,
          tokenAmount: winningOption.value.toString(),
          votedAlertLabel,
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
      process:
        proposal.status === ProposalStatus.SUCCEEDED
          ? (t(
              'votingTerminal.status.approved'
            ).toLowerCase() as CardProposalProps['process'])
          : props.process,
      voteTitle: t('votingTerminal.approvedBy'),
      stateLabel: PROPOSAL_STATE_LABELS,
      alertMessage: translateProposalDate(
        proposal.status,
        proposal.startDate,
        proposal.endDate
      ),
    };
    if (proposal.status.toLowerCase() === 'active') {
      const votedAlertLabel = proposal.approvals?.some(
        v =>
          stripPlgnAdrFromProposalId(v).toLowerCase() === address?.toLowerCase()
      )
        ? t('governance.proposals.alert.voted')
        : undefined;

      const activeProps = {
        votedAlertLabel,
        voteProgress: relativeVoteCount(proposal.approvals.length, memberCount),
        winningOptionValue: `${proposal.approvals.length} ${t(
          'votingTerminal.ofMemberCount',
          {memberCount}
        )}`,
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
