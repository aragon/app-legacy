import {
  Badge,
  Breadcrumb,
  ButtonText,
  CardExecution,
  IconChevronDown,
  IconGovernance,
  IconChevronUp,
  Link,
  ProgressStatusProps,
  WidgetStatus,
} from '@aragon/ui-components';
import styled from 'styled-components';
import useScreen from 'hooks/useScreen';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapLink from '@tiptap/extension-link';
import {useQuery} from '@apollo/client';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {format, formatDistance} from 'date-fns';

import ResourceList from 'components/resourceList';
import {StyledEditorContent} from 'containers/reviewProposal';
import {VotingTerminal} from 'containers/votingTerminal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {useNetwork} from 'context/network';
import {ERC20VOTING_PROPOSAL_DETAILS} from 'queries/proposals';
import {NotFound} from 'utils/paths';
import {useDaoParam} from 'hooks/useDaoParam';
import {Loading} from 'components/temporary';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {BigNumber} from 'ethers';
import {formatUnits} from 'utils/library';
import {StringIndexed} from 'utils/types';
import {getFormattedUtcOffset} from 'utils/date';
import {categorizeProposal} from './governance';
import {useCache} from 'hooks/useCache';
import {erc20VotingProposals} from 'queries/__generated__/erc20VotingProposals';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';

/* MOCK DATA ================================================================ */

const Votes: StringIndexed = {
  Yea: 'Yes',
  Nay: 'No',
  Abstain: 'Abstain',
};

// TODO: This is just some mock data. Remove this while integration
const publishedDone: ProgressStatusProps = {
  label: 'Published',
  mode: 'done',
  date: '2021/11/16 4:30 PM UTC+2',
  block: '132,123,231',
};

const proposalTags = ['Finance', 'Withdraw'];

/* PROPOSAL COMPONENT ======================================================= */

const DATE_FORMAT = 'yyyy/MM/dd hh:mm a';

const Proposal: React.FC = () => {
  const {data: daoId, loading: daoIdLoading, error: daoIdError} = useDaoParam();
  const {network} = useNetwork();
  const {address} = useWallet();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();
  const {t, i18n} = useTranslation();
  const {id} = useParams();
  const navigate = useNavigate();
  const {isDesktop} = useScreen();
  const {set, get} = useCache();

  let proposalId = '';
  if (!id) navigate(NotFound);
  else proposalId = id;

  const {
    data: proposalData,
    loading: proposalLoading,
    error: proposalError,
  } = useQuery(ERC20VOTING_PROPOSAL_DETAILS, {variables: {id: proposalId}});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metadata, setMetadata] = useState<Record<string, any> | undefined>();
  const [expandedProposal, setExpandedProposal] = useState(false);

  const editor = useEditor({
    editable: false,
    content: PROPOSAL, // TODO: remove this when proper data comes in
    extensions: [
      StarterKit,
      TipTapLink.configure({
        openOnClick: false,
      }),
    ],
  });

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
  const mapDataToView = useCallback(() => {
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
      open,
      // supportRequiredPct, Note not using this currently because the one proposal created with script has it set to a crazy massive number
    } = proposalData.erc20VotingProposals[0];

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

    const status = categorizeProposal(
      proposalData.erc20VotingProposals[0]
    ).type;

    return {
      results,
      voteNowDisabled: !open,

      createdAt: `${format(
        Number(createdAt) * 1000,
        DATE_FORMAT
      )} ${getFormattedUtcOffset()}`,

      endDate: `${format(
        Number(endDate) * 1000,
        DATE_FORMAT
      )} ${getFormattedUtcOffset()}`,

      startDate: `${format(
        Number(startDate) * 1000,
        DATE_FORMAT
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
    };
  }, [getStatusLabel, proposalData]);

  const terminalProps = useMemo(() => mapDataToView(), [mapDataToView]);
  const proposalSteps = useMemo(() => {
    const steps = [
      {
        ...publishedDone,
        date: terminalProps?.createdAt,
        block:
          new Intl.NumberFormat(i18n.language).format(
            proposalData?.erc20VotingProposals?.[0]?.snapshotBlock as number
          ) || '',
      },
    ];

    if (
      terminalProps?.status !== 'pending' &&
      terminalProps?.status !== 'active'
    ) {
      steps.push({
        label: 'Executed',
        mode: 'succeeded',
        date: terminalProps?.endDate,
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
    terminalProps?.createdAt,
    terminalProps?.endDate,
    terminalProps?.status,
  ]);

  useEffect(() => {
    // uncomment when integrating with sdk
    // if (!proposalLoading && proposalData) {
    //   setMetadata(JSON.parse(proposalData.erc20VotingProposals[0].metadata));
    // editor?.commands.setContent(metadata?.proposal, true);
    // }
    setMetadata({
      title: 'Create new Pets United Sub DAO',
      summary: "We're creating a new DAO to manage pets and their owners.",
      proposal: PROPOSAL,
    });
  }, []);

  useEffect(() => {
    const proposalStatus = get('proposalStatus');
    const daoProposals = proposalData?.erc20VotingProposals
      .map((p: erc20VotingProposals) => ({
        ...p,
        yea: Math.floor(Math.random() * 100),
        nay: Math.floor(Math.random() * 100),
      }))
      .map(categorizeProposal);
    if (daoProposals?.[0]?.type !== proposalStatus)
      set('proposalStatus', daoProposals?.[0]?.type);
  }, [get, proposalData, set]);

  // TODO Do we still need this? [VR 10-05-2022]
  // const publisher =
  //   publisherAddress === account ? 'you' : shortenAddress(publisherAddress);
  const creator = proposalData?.erc20VotingProposals[0]?.creator;
  const publisher = creator === address ? 'you' : shortenAddress(creator);

  if (proposalLoading || daoIdLoading) {
    return <Loading />;
  }

  if (proposalError || daoIdError) {
    return <p>Error. Check console</p>;
  }

  if (!editor) {
    return null;
  }

  return (
    <Container>
      {/* Proposal Header */}
      <HeaderContainer>
        {!isDesktop && (
          <Breadcrumb
            onClick={(path: string) =>
              navigate(generatePath(path, {network, daoId}))
            }
            crumbs={breadcrumbs}
            icon={<IconGovernance />}
            tag={tag}
          />
        )}
        <ProposalTitle>{metadata?.title}</ProposalTitle>
        <ContentWrapper>
          <BadgeContainer>
            {proposalTags.map(tag => (
              <Badge label={tag} key={tag} />
            ))}
          </BadgeContainer>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={publisher}
              href={`${CHAIN_METADATA[network].explorer}/address/${creator}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{metadata?.summary}</SummaryText>

        {metadata?.proposal && !expandedProposal && (
          <ButtonText
            className="w-full tablet:w-max"
            size="large"
            label={t('governance.proposals.buttons.readFullProposal')}
            mode="secondary"
            iconRight={<IconChevronDown />}
            onClick={() => setExpandedProposal(true)}
          />
        )}
      </HeaderContainer>

      <ContentContainer expandedProposal={expandedProposal}>
        <ProposalContainer>
          {metadata?.proposal && expandedProposal && (
            <>
              <StyledEditorContent editor={editor} />

              <ButtonText
                className="mt-3 w-full tablet:w-max"
                label={t('governance.proposals.buttons.closeFullProposal')}
                mode="secondary"
                iconRight={<IconChevronUp />}
                onClick={() => setExpandedProposal(false)}
              />
            </>
          )}

          {terminalProps && <VotingTerminal {...terminalProps} />}

          <CardExecution
            title="Execution"
            description="These smart actions are executed when the proposal reaches sufficient support. Find out which actions are executed."
            to="0x3430008404144CD5000005A44B8ac3f4DB2a3434"
            from="Patito DAO"
            toLabel="To"
            fromLabel="From"
            tokenName="DAI"
            tokenImageUrl="https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png"
            tokenSymbol="DAI"
            tokenCount="15,000,230.2323"
            treasuryShare="$1000.0"
          />
        </ProposalContainer>

        <AdditionalInfoContainer>
          <ResourceList links={[]} />
          <WidgetStatus steps={proposalSteps} />
        </AdditionalInfoContainer>
      </ContentContainer>
    </Container>
  );
};

export default withTransaction('Proposal', 'component')(Proposal);

const Container = styled.div.attrs({
  className: 'col-span-full desktop:col-start-2 desktop:col-end-12',
})``;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-2 desktop:p-0 px-2 tablet:px-3 pt-2',
})``;

const ProposalTitle = styled.p.attrs({
  className: 'font-bold text-ui-800 text-3xl',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'flex flex-col tablet:flex-row gap-x-3 gap-y-1.5',
})``;

const BadgeContainer = styled.div.attrs({
  className: 'flex flex-wrap gap-x-1.5',
})``;

const ProposerLink = styled.p.attrs({
  className: 'text-ui-500',
})``;

const SummaryText = styled.p.attrs({
  className: 'text-lg text-ui-600',
})``;

const ProposalContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-3/5',
})``;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-2/5',
})``;

type ContentContainerProps = {
  expandedProposal: boolean;
};

const ContentContainer = styled.div.attrs(
  ({expandedProposal}: ContentContainerProps) => ({
    className: `${
      expandedProposal ? 'tablet:mt-5' : 'tablet:mt-8'
    } mt-3 tablet:flex tablet:space-x-3 space-y-3 tablet:space-y-0`,
  })
)<ContentContainerProps>``;

const PROPOSAL =
  "<p><strong>We LOVE pets!</strong><br /></p><p>As we all know, pets are amazing, and the feelings we experience because of their amazing existence are overwhelmingly powerful. But, of course, with great power comes great responsibility, and let's face it: many of us are not paragons of responsibility. We often need to set reminders for doggy bath time or kitty vet visit. </p><br /><p>In order to make sure that our pets are well taken cared of and that we enjoy the awesomeness that is adopting and raising a pet, I propose we create a sub DAO. </p><p>The new Pets United sub DAO would be an organization of pet owners (obviously) looking out for each other, and making sure that everyone is aware of new discounts at the groomer and that we present a united front when eventually we demand<strong> full citizenship </strong>for our pets!</p><br /><p>Looking forward to your comments!</p>";
