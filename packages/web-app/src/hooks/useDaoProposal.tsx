import {useQuery} from '@apollo/client';
import {ProgressStatusProps} from '@aragon/ui-components';
import {format, formatDistance} from 'date-fns';
import {BigNumber} from 'ethers';
import {ERC20VOTING_PROPOSAL_DETAILS} from 'queries/proposals';
import {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {formatUnits} from 'utils/library';

import {categorizeProposal} from 'pages/governance';
import {getFormattedUtcOffset, KNOWN_FORMATS} from 'utils/date';
import {StringIndexed} from 'utils/types';
import {useWallet} from './useWallet';

/**
 * This hook/file extracts the data fetching and processing logic from the
 * ProposalDetails component. Depending on how the proposal is returned by
 * sdk, this may be deleted during proper integration, hence no actual
 * return type apart from the expected hook data.
 */

/* MOCK DATA ================================================================ */
type DisplayedVoter = {
  wallet: string;
  option: string;
  votingPower: string;
  tokenAmount: string;
};

const publishedDone: ProgressStatusProps = {
  label: 'Published',
  mode: 'done',
  date: '2021/11/16 4:30 PM UTC+2',
  block: '132,123,231',
};

const Votes: StringIndexed = {
  Yea: 'Yes',
  Nay: 'No',
  Abstain: 'Abstain',
};

const proposalTags = ['Finance', 'Withdraw'];

export const useDaoProposal = (proposalId?: string) => {
  const {address} = useWallet();
  const {t, i18n} = useTranslation();

  const {
    data: proposalData,
    loading: proposalLoading,
    error: proposalError,
  } = useQuery(ERC20VOTING_PROPOSAL_DETAILS, {variables: {id: proposalId}});

  /*************************************************
   *              Callbacks & Handlers             *
   *************************************************/
  const getStatusLabel = useCallback(
    (status: string, endDate: number) => {
      switch (status) {
        case 'pending':
          return t('votingTerminal.notStartedYet');

        case 'active':
          return t('votingTerminal.remainingTime', {
            time: formatDistance(new Date(), new Date(endDate)),
          });

        default:
          return t('votingTerminal.voteEnded');
      }
    },
    [t]
  );

  // remove this when integrating with sdk
  // since it maps the proposal subgraph data to displayed data
  // and sdk is supposed to do that
  const mappedProposal = useMemo(() => {
    if (!proposalData) return;

    let tokenParticipation = BigNumber.from(0);

    const {
      voters,
      pkg: {token},
      votingPower,
      yea,
      nay,
      abstain,
      startDate,
      endDate,
      createdAt,
      // supportRequiredPct, Note not using this currently because the one proposal created with script has it set to a crazy massive number
    } = proposalData.erc20VotingProposals[0];

    // get voters mapped
    const mappedVoters = voters.map(
      ({
        vote,
        weight,
        voter,
      }: {
        vote: string;
        weight: string;
        voter: {id: string};
      }) => {
        tokenParticipation = BigNumber.from(weight).add(tokenParticipation);

        return {
          wallet: voter.id,
          option: Votes[vote],
          votingPower: `${BigNumber.from(weight)
            .div(BigNumber.from(votingPower))
            .mul(100)
            .toString()}%`,
          tokenAmount: `${formatUnits(weight, token.decimals)} ${token.symbol}`,
        };
      }
    );

    // map proposal vote results
    const results = {
      yes: yea
        ? {
            value: formatUnits(yea, token.decimals),
            percentage: BigNumber.from(yea)
              .div(BigNumber.from(votingPower))
              .mul(100)
              .toString(),
          }
        : {value: '0', percentage: '0'},
      no: nay
        ? {
            value: formatUnits(nay, token.decimals),
            percentage: BigNumber.from(nay)
              .div(BigNumber.from(votingPower))
              .mul(100)
              .toString(),
          }
        : {value: '0', percentage: '0'},
      abstain: abstain
        ? {
            value: formatUnits(abstain, token.decimals),
            percentage: BigNumber.from(abstain)
              .div(BigNumber.from(votingPower))
              .mul(100)
              .toString(),
          }
        : {value: '0', percentage: '0'},
    };

    // get proposal category
    const status = categorizeProposal(
      proposalData.erc20VotingProposals[0]
    ).type;

    // TODO: check if dao member
    const canVote =
      status === 'active' && // vote open
      !(voters as DisplayedVoter[]).some(voter => voter.wallet === address); // haven't voted yet

    return {
      results,
      voteNowDisabled: !canVote, // yuck
      createdAt: `${format(
        Number(createdAt) * 1000,
        KNOWN_FORMATS.proposals
      )} ${getFormattedUtcOffset()}`,

      endDate: `${format(
        Number(endDate) * 1000,
        KNOWN_FORMATS.proposals
      )} ${getFormattedUtcOffset()}`,

      startDate: `${format(
        Number(startDate) * 1000,
        KNOWN_FORMATS.proposals
      )} ${getFormattedUtcOffset()}`,

      voters: mappedVoters,
      token: {name: token.name, symbol: token.symbol},

      approval: `${formatUnits(
        BigNumber.from(15).mul(BigNumber.from(votingPower)).div(100),
        token.decimals
      )} ${token.symbol} (15%)`,

      participation: `${formatUnits(
        tokenParticipation,
        token.decimals
      )} of ${formatUnits(votingPower, token.decimals)} ${
        token.symbol
      } (${tokenParticipation.div(BigNumber.from(votingPower)).mul(100)}%)`,

      status,
      statusLabel: getStatusLabel(status, Number(endDate) * 1000),
      strategy: token
        ? t('votingTerminal.tokenVoting')
        : t('votingTerminal.multisig'),
    };
  }, [address, getStatusLabel, proposalData, t]);

  // steps for step card
  const proposalSteps = useMemo(() => {
    const steps = [
      {
        ...publishedDone,
        date: mappedProposal?.createdAt,
        block:
          new Intl.NumberFormat(i18n.language).format(
            proposalData?.erc20VotingProposals?.[0]?.snapshotBlock as number
          ) || '',
      },
    ];

    if (
      mappedProposal?.status !== 'pending' &&
      mappedProposal?.status !== 'active'
    ) {
      steps.push({
        label: 'Executed',
        mode: 'succeeded',
        date: mappedProposal?.endDate,
        block:
          new Intl.NumberFormat(i18n.language).format(
            proposalData?.erc20VotingProposals?.[0]?.snapshotBlock as number
          ) || '',
      });
    }

    return steps;
  }, [
    i18n.language,
    proposalData?.erc20VotingProposals,
    mappedProposal?.createdAt,
    mappedProposal?.endDate,
    mappedProposal?.status,
  ]);

  return {
    data: {
      creator: proposalData?.erc20VotingProposals[0]?.creator,
      mappedProposal,
      proposalContent: PROPOSAL,
      proposalSteps,
      proposalTags,
    },
    isLoading: proposalLoading,
    error: proposalError,
  };
};

const PROPOSAL =
  "<p><strong>We LOVE pets!</strong><br /></p><p>As we all know, pets are amazing, and the feelings we experience because of their amazing existence are overwhelmingly powerful. But, of course, with great power comes great responsibility, and let's face it: many of us are not paragons of responsibility. We often need to set reminders for doggy bath time or kitty vet visit. </p><br /><p>In order to make sure that our pets are well taken cared of and that we enjoy the awesomeness that is adopting and raising a pet, I propose we create a sub DAO. </p><p>The new Pets United sub DAO would be an organization of pet owners (obviously) looking out for each other, and making sure that everyone is aware of new discounts at the groomer and that we present a united front when eventually we demand<strong> full citizenship </strong>for our pets!</p><br /><p>Looking forward to your comments!</p>";
