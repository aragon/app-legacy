import {
  Badge,
  Breadcrumb,
  ButtonText,
  IconChevronDown,
  IconChevronUp,
  IconGovernance,
  Link,
  WidgetStatus,
} from '@aragon/ui-components';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';
import {withTransaction} from '@elastic/apm-rum-react';
import TipTapLink from '@tiptap/extension-link';
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {VotingTerminal} from 'containers/votingTerminal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import format from 'date-fns/format';
import formatDistance from 'date-fns/formatDistance';
import {useCache} from 'hooks/useCache';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {DetailedProposal, useDaoProposal} from 'hooks/useDaoProposal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {PluginTypes} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {getFormattedUtcOffset, KNOWN_FORMATS} from 'utils/date';
import {
  getErc20MinimumApproval,
  getErc20Results,
  getErc20VotersAndParticipation,
  getProposalStatusSteps,
  getWhitelistMinimumApproval,
  getWhitelistResults,
  getWhitelistVoterParticipation,
  isTokenBasedProposal,
} from 'utils/proposals';
import {i18n} from '../../i18n.config';
import {ExecutionWidget} from 'components/executionWidget';
import {useClient} from 'hooks/useClient';
import {useApolloClient} from '@apollo/client';
import {ActionWithdraw} from 'utils/types';
import {decodeWithdrawToAction} from 'utils/library';

// TODO: @Sepehr Please assign proper tags on action decoding
const PROPOSAL_TAGS = ['Finance', 'Withdraw'];
const TEMP_VOTING_POWER = 1600;

const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {id} = useParams();
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();
  const apolloClient = useApolloClient();
  const [decodedActions, setDecodedActions] =
    useState<(ActionWithdraw | undefined)[]>();
  const {client} = useClient();

  const {set, get} = useCache();

  const {network} = useNetwork();
  const {address, isConnected, isOnWrongNetwork} = useWallet();

  const {data: daoId, loading: paramIsLoading} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId || ''
  );
  const {data: proposal, isLoading: proposalIsLoading} = useDaoProposal(
    id || '',
    daoDetails?.plugins[0].instanceAddress || '',
    daoDetails?.plugins[0].id as PluginTypes
  );

  // ref used to hold "memories" of previous "state"
  // across renders in order to automate the following states:
  // loggedOut -> login modal => switch network modal -> vote options selection;
  const statusRef = useRef({wasNotLoggedIn: false, wasOnWrongNetwork: false});

  // voting
  const [votingInProcess, setVotingInProcess] = useState(false);
  const [expandedProposal, setExpandedProposal] = useState(false);

  // TODO: please replace this with proper logic from voting gating
  const canVote = useState(true);

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      TipTapLink.configure({
        openOnClick: false,
      }),
    ],
  });

  /*************************************************
   *                     Hooks                     *
   *************************************************/
  useEffect(() => {
    if (proposal && editor) {
      editor.commands.setContent(proposal.metadata.description, true);
    }
  }, [editor, proposal]);

  useEffect(() => {
    if (proposal) {
      const actionPromises = proposal.actions.map(action => {
        const functionParams = client?.decoding.findInterface(action.data);
        switch (functionParams?.functionName) {
          case 'withdraw':
            return decodeWithdrawToAction(
              action.data,
              client,
              apolloClient,
              network
            );
          default:
            return Promise.resolve({} as ActionWithdraw);
        }
      });
      Promise.all(actionPromises).then(value => {
        setDecodedActions(value);
      });
    }
  }, [apolloClient, client, network, proposal]);

  const executionStatus = useMemo(() => {
    switch (proposal?.status) {
      case 'Succeeded':
        return 'executable';
      case 'Executed':
        // TODO: add cases for failed execution
        // executionStatus = 'executable-failed';
        return 'executed';
      case 'Defeated':
        return 'defeated';
      case 'Active':
      case 'Pending':
      default:
        return 'default';
    }
  }, [proposal?.status]);

  // caches the status for breadcrumb
  useEffect(() => {
    if (proposal && proposal.status !== get('proposalStatus'))
      set('proposalStatus', proposal.status);
  }, [get, proposal, set]);

  useEffect(() => {
    // was not logged in but now logged in
    if (statusRef.current.wasNotLoggedIn && isConnected) {
      if (isOnWrongNetwork) {
        open('network');
      }

      // logged out is technically on wrong network
      statusRef.current.wasOnWrongNetwork = true;

      // reset reference
      statusRef.current.wasNotLoggedIn = false;
    }
  }, [isConnected, canVote, isOnWrongNetwork, open]);

  useEffect(() => {
    // wrong network, no wallet -> no options
    if (isOnWrongNetwork || !address || !canVote) setVotingInProcess(false);

    // was on wrong network but now on correct network
    if (statusRef.current.wasOnWrongNetwork && !isOnWrongNetwork) {
      if (canVote) setVotingInProcess(true);

      // reset "state"
      statusRef.current.wasOnWrongNetwork = false;
    }
  }, [address, canVote, isOnWrongNetwork]);

  // whether current user has voted
  const voted = useMemo(() => {
    return address && proposal?.votes.some(voter => voter.address === address)
      ? true
      : false;
  }, [address, proposal?.votes]);

  // vote button and status
  const [voteStatus, buttonLabel] = useMemo(() => {
    let voteStatus = '';
    let voteButtonLabel = '';

    if (!proposal?.status || !proposal?.endDate || !proposal?.startDate)
      return [voteStatus, voteButtonLabel];

    switch (proposal.status) {
      case 'Pending':
        voteStatus = t('votingTerminal.status.pending', {
          startDate: formatDistance(new Date(proposal.startDate), new Date()),
        });
        break;
      case 'Succeeded':
        voteStatus = t('votingTerminal.status.succeeded');
        voteButtonLabel = t('votingTerminal.status.voteSubmitted');

        break;
      case 'Executed':
        voteStatus = t('votingTerminal.status.executed');
        voteButtonLabel = t('votingTerminal.status.voteSubmitted');
        break;
      case 'Defeated':
        voteStatus = t('votingTerminal.status.defeated');
        voteButtonLabel = t('votingTerminal.status.voteSubmitted');

        break;
      case 'Active':
        voteStatus = t('votingTerminal.status.active', {
          endDate: formatDistance(new Date(), new Date(proposal.endDate)),
        });

        // haven't voted
        voteButtonLabel = voted
          ? t('votingTerminal.status.voteSubmitted')
          : t('votingTerminal.voteNow');
        break;
    }
    return [voteStatus, voteButtonLabel];
  }, [proposal?.endDate, proposal?.startDate, proposal?.status, t, voted]);

  // vote button state and handler
  const {voteNowDisabled, onClick} = useMemo(() => {
    if (proposal?.status !== 'Active') return {voteNowDisabled: true};

    // not logged in
    if (!address) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('wallet');
          statusRef.current.wasNotLoggedIn = true;
        },
      };
    }

    // wrong network
    else if (address && isOnWrongNetwork) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('network');
          statusRef.current.wasOnWrongNetwork = true;
        },
      };
    }

    // member, not yet voted
    else if (address && !isOnWrongNetwork && canVote) {
      return {
        voteNowDisabled: false,
        onClick: () => setVotingInProcess(true),
      };
    } else return {voteNowDisabled: true};
  }, [address, canVote, isOnWrongNetwork, open, proposal?.status]);

  // alert message, only shown when not eligible to vote
  const alertMessage = useMemo(() => {
    if (
      proposal &&
      proposal.status === 'Active' &&
      address &&
      !isOnWrongNetwork &&
      !canVote
    ) {
      // presence of token delineates token voting proposal
      // people add types to these things!!
      return isTokenBasedProposal(proposal)
        ? t('votingTerminal.status.ineligibleTokenBased', {
            token: proposal.token.name,
          })
        : t('votingTerminal.status.ineligibleWhitelist');
    }
  }, [address, canVote, isOnWrongNetwork, proposal, t]);

  // terminal props
  const terminalPropsFromProposal = useMemo(() => {
    if (proposal) return getTerminalProps(proposal);
  }, [proposal]);

  // status steps for proposal
  const proposalSteps = useMemo(() => {
    if (
      proposal?.status &&
      proposal?.startDate &&
      proposal?.endDate &&
      proposal?.creationDate
    )
      return getProposalStatusSteps(
        proposal.status,
        proposal.startDate,
        proposal.endDate,
        proposal.creationDate,
        '123,123,123',
        new Date() // TODO: change to proposal.executionDate from sdk
      );
  }, [
    proposal?.creationDate,
    proposal?.endDate,
    proposal?.startDate,
    proposal?.status,
  ]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (paramIsLoading || proposalIsLoading || detailsAreLoading) {
    return <Loading />;
  }

  return (
    <Container>
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
        <ProposalTitle>{proposal?.metadata.title}</ProposalTitle>
        <ContentWrapper>
          <BadgeContainer>
            {PROPOSAL_TAGS.map((tag: string) => (
              <Badge label={tag} key={tag} />
            ))}
          </BadgeContainer>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={
                proposal?.creatorAddress === address?.toLowerCase()
                  ? t('labels.you')
                  : shortenAddress(proposal?.creatorAddress || '')
              }
              href={`${CHAIN_METADATA[network].explorer}/address/${proposal?.creatorAddress}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{proposal?.metadata.summary}</SummaryText>
        {!expandedProposal && (
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
          {expandedProposal && (
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

          {proposal && (
            <VotingTerminal
              statusLabel={voteStatus}
              alertMessage={alertMessage}
              onVoteClicked={onClick}
              onCancelClicked={() => setVotingInProcess(false)}
              voteButtonLabel={buttonLabel}
              voteNowDisabled={voteNowDisabled}
              votingInProcess={votingInProcess}
              {...terminalPropsFromProposal}
            />
          )}

          <ExecutionWidget actions={decodedActions} status={executionStatus} />
        </ProposalContainer>
        <AdditionalInfoContainer>
          <ResourceList links={proposal?.metadata.resources} />
          <WidgetStatus steps={proposalSteps || []} />
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

// get terminal props from proposal
function getTerminalProps(proposal: DetailedProposal) {
  let token;
  let voters;
  let participation;
  let results;
  let approval;
  let strategy;

  if (isTokenBasedProposal(proposal)) {
    // token
    token = {
      name: proposal.token.name,
      symbol: proposal.token.symbol,
    };

    // voters
    const ptcResults = getErc20VotersAndParticipation(
      proposal.votes,
      proposal.token,
      proposal.usedVotingWeight
    );
    voters = ptcResults.voters;

    // participation summary
    participation = ptcResults.summary;

    // results
    results = getErc20Results(
      proposal.result,
      proposal.token.decimals,
      proposal.usedVotingWeight
    );

    // min approval
    approval = getErc20MinimumApproval(
      proposal.settings.minSupport,
      proposal.usedVotingWeight,
      proposal.token
    );

    // strategy
    strategy = i18n.t('votingTerminal.tokenVoting');
  } else {
    // voters
    const ptcResults = getWhitelistVoterParticipation(
      proposal.votes,
      // TODO: add proposal.votingPower when on SDK,
      TEMP_VOTING_POWER
    );
    voters = ptcResults.voters;

    // participation summary
    participation = ptcResults.summary;

    // results
    results = getWhitelistResults(
      proposal.result,
      // TODO: add proposal.votingPower when on SDK,
      TEMP_VOTING_POWER
    );

    // approval
    approval = getWhitelistMinimumApproval(
      proposal.settings.minSupport,
      // TODO: add proposal.votingPower when on SDK,
      TEMP_VOTING_POWER
    );

    // strategy
    strategy = i18n.t('votingTerminal.multisig');
  }

  return {
    token,
    status: proposal.status,
    voters,
    results,
    approval,
    strategy,
    participation,

    startDate: `${format(
      proposal.startDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,

    endDate: `${format(
      proposal.endDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,
  };
}
