import {useApolloClient} from '@apollo/client';
import {ClientAddressList} from '@aragon/sdk-client';
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

import {ExecutionWidget} from 'components/executionWidget';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {TerminalTabs, VotingTerminal} from 'containers/votingTerminal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProposalTransactionContext} from 'context/proposalTransaction';
import formatDistance from 'date-fns/formatDistance';
import {useCache} from 'hooks/useCache';
import {useClient} from 'hooks/useClient';
import {useDaoProposal} from 'hooks/useDaoProposal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {usePluginClient} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {useWalletCanVote} from 'hooks/useWalletCanVote';
import {CHAIN_METADATA} from 'utils/constants';
import {
  decodeAddMembersToAction,
  decodeRemoveMembersToAction,
  decodeWithdrawToAction,
} from 'utils/library';
import {NotFound} from 'utils/paths';
import {
  getProposalStatusSteps,
  getTerminalProps,
  isTokenBasedProposal,
} from 'utils/proposals';
import {Action} from 'utils/types';

// TODO: @Sepehr Please assign proper tags on action decoding
const PROPOSAL_TAGS = ['Finance', 'Withdraw'];

const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {dao, id: proposalId} = useParams();
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();

  const apolloClient = useApolloClient();
  const [decodedActions, setDecodedActions] =
    useState<(Action | undefined)[]>();
  const {client} = useClient();

  const {set, get} = useCache();

  const {network} = useNetwork();
  const {address, isConnected, isOnWrongNetwork} = useWallet();

  const {
    handleSubmitVote,
    isLoading: paramsAreLoading,
    pluginAddress,
    pluginType,
    voteSubmitted,
  } = useProposalTransactionContext();

  const {
    data: proposal,
    error: proposalError,
    isLoading: proposalIsLoading,
  } = useDaoProposal(proposalId!, pluginAddress, pluginType);

  const {data: canVote} = useWalletCanVote(
    address,
    proposalId!,
    pluginAddress,
    pluginType
  );

  const pluginClient = usePluginClient(pluginAddress, pluginType);

  // ref used to hold "memories" of previous "state"
  // across renders in order to automate the following states:
  // loggedOut -> login modal => switch network modal -> vote options selection;
  const statusRef = useRef({wasNotLoggedIn: false, wasOnWrongNetwork: false});

  // voting
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('info');
  const [votingInProcess, setVotingInProcess] = useState(false);
  const [expandedProposal, setExpandedProposal] = useState(false);

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
      const actionPromises: Promise<Action | undefined>[] =
        proposal.actions.map(action => {
          const functionParams =
            client?.decoding.findInterface(action.data) ||
            pluginClient?.decoding.findInterface(action.data);

          switch (functionParams?.functionName) {
            case 'withdraw':
              return decodeWithdrawToAction(
                action.data,
                client,
                apolloClient,
                network
              );
            case 'mint':
            case 'addWhitelistedUsers':
              return decodeAddMembersToAction(
                action.data,
                pluginClient as ClientAddressList
              );
            case 'removeWhitelistedUsers':
              return decodeRemoveMembersToAction(
                action.data,
                pluginClient as ClientAddressList
              );
            default:
              return Promise.resolve({} as Action);
          }
        });

      Promise.all(actionPromises).then(value => {
        setDecodedActions(value);
      });
    }
  }, [apolloClient, client, network, pluginClient, proposal]);

  // caches the status for breadcrumb
  useEffect(() => {
    if (proposal && proposal.status !== get('proposalStatus'))
      set('proposalStatus', proposal.status);
  }, [get, proposal, set]);

  useEffect(() => {
    // was not logged in but now logged in
    if (statusRef.current.wasNotLoggedIn && isConnected) {
      // reset ref
      statusRef.current.wasNotLoggedIn = false;

      // logged out technically wrong network
      statusRef.current.wasOnWrongNetwork = true;

      // throw network modal
      if (isOnWrongNetwork) {
        open('network');
      }
    }
  }, [isConnected, isOnWrongNetwork, open]);

  useEffect(() => {
    // all conditions unmet close voting in process
    if (isOnWrongNetwork || !isConnected || !canVote) {
      setVotingInProcess(false);
    }

    // was on the wrong network but now on the right one
    if (statusRef.current.wasOnWrongNetwork && !isOnWrongNetwork) {
      // reset ref
      statusRef.current.wasOnWrongNetwork = false;

      // show voting in process
      if (canVote) setVotingInProcess(true);
    }
  }, [
    canVote,
    isConnected,
    isOnWrongNetwork,
    statusRef.current.wasOnWrongNetwork,
  ]);

  useEffect(() => {
    if (voteSubmitted) {
      setTerminalTab('voters');
      setVotingInProcess(false);
    }
  }, [voteSubmitted]);

  // caches the status for breadcrumb
  useEffect(() => {
    if (proposal && proposal.status !== get('proposalStatus'))
      set('proposalStatus', proposal.status);
  }, [get, proposal, set]);

  useEffect(() => {
    // was not logged in but now logged in
    if (statusRef.current.wasNotLoggedIn && isConnected) {
      // reset ref
      statusRef.current.wasNotLoggedIn = false;

      // logged out technically wrong network
      statusRef.current.wasOnWrongNetwork = true;

      // throw network modal
      if (isOnWrongNetwork) {
        open('network');
      }
    }
  }, [isConnected, isOnWrongNetwork, open]);

  useEffect(() => {
    // all conditions unmet close voting in process
    if (isOnWrongNetwork || !isConnected || !canVote) {
      setVotingInProcess(false);
    }

    // was on the wrong network but now on the right one
    if (statusRef.current.wasOnWrongNetwork && !isOnWrongNetwork) {
      // reset ref
      statusRef.current.wasOnWrongNetwork = false;

      // show voting in process
      if (canVote) setVotingInProcess(true);
    }
  }, [
    canVote,
    isConnected,
    isOnWrongNetwork,
    statusRef.current.wasOnWrongNetwork,
  ]);

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
    else if (isOnWrongNetwork) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('network');
          statusRef.current.wasOnWrongNetwork = true;
        },
      };
    }

    // member, not yet voted
    else if (canVote) {
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
    if (proposal) return getTerminalProps(proposal, address);
  }, [proposal, address]);

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
        '456,456,456',
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
  if (paramsAreLoading || proposalIsLoading || !proposal) {
    return <Loading />;
  }

  if (proposalError) {
    navigate(NotFound, {replace: true, state: {invalidProposal: proposalId}});
  }

  return (
    <Container>
      <HeaderContainer>
        {!isDesktop && (
          <Breadcrumb
            onClick={(path: string) =>
              navigate(generatePath(path, {network, dao}))
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

          <VotingTerminal
            statusLabel={voteStatus}
            selectedTab={terminalTab}
            alertMessage={alertMessage}
            onTabSelected={setTerminalTab}
            onVoteClicked={onClick}
            onCancelClicked={() => setVotingInProcess(false)}
            voteButtonLabel={buttonLabel}
            voteNowDisabled={voteNowDisabled}
            votingInProcess={votingInProcess}
            onVoteSubmitClicked={handleSubmitVote}
            {...terminalPropsFromProposal}
          />

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
