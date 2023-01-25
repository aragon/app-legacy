import {useApolloClient} from '@apollo/client';
import {
  AddresslistVotingClient,
  DaoAction,
  TokenVotingClient,
  TokenVotingProposal,
  VotingMode,
} from '@aragon/sdk-client';
import {
  Breadcrumb,
  ButtonText,
  IconChevronDown,
  IconChevronUp,
  IconGovernance,
  Link,
  Tag,
  WidgetStatus,
} from '@aragon/ui-components';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';
import {withTransaction} from '@elastic/apm-rum-react';
import TipTapLink from '@tiptap/extension-link';
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Big from 'big.js';
import {formatDistanceToNow, Locale} from 'date-fns';
import * as Locales from 'date-fns/locale';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {ExecutionWidget} from 'components/executionWidget';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {
  ProposalVoteResults,
  TerminalTabs,
  VotingTerminal,
} from 'containers/votingTerminal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProposalTransactionContext} from 'context/proposalTransaction';
import {useSpecificProvider} from 'context/providers';
import {useCache} from 'hooks/useCache';
import {useClient} from 'hooks/useClient';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoProposal} from 'hooks/useDaoProposal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {useWalletCanVote} from 'hooks/useWalletCanVote';
import {CHAIN_METADATA} from 'utils/constants';
import {
  decodeAddMembersToAction,
  decodeMetadataToAction,
  decodeMintTokensToAction,
  decodePluginSettingsToAction,
  decodeRemoveMembersToAction,
  decodeWithdrawToAction,
  formatUnits,
} from 'utils/library';
import {NotFound} from 'utils/paths';
import {
  getProposalStatusSteps,
  getTerminalProps,
  isErc20VotingProposal,
} from 'utils/proposals';
import {Action} from 'utils/types';

// TODO: @Sepehr Please assign proper tags on action decoding
const PROPOSAL_TAGS = ['Finance', 'Withdraw'];

const NumberFormatter = new Intl.NumberFormat('en-US');

const Proposal: React.FC = () => {
  const {t, i18n} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();

  const navigate = useNavigate();
  const {id: proposalId} = useParams();

  const {data: dao} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(dao);

  const {data: daoSettings} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const {client} = useClient();
  const {set, get} = useCache();
  const apolloClient = useApolloClient();

  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);
  const {address, isConnected, isOnWrongNetwork} = useWallet();

  const [decodedActions, setDecodedActions] =
    useState<(Action | undefined)[]>();

  const {
    handleSubmitVote,
    handleExecuteProposal,
    isLoading: paramsAreLoading,
    pluginAddress,
    pluginType,
    voteSubmitted,
    executionFailed,
    transactionHash,
  } = useProposalTransactionContext();

  const {
    data: proposal,
    error: proposalError,
    isLoading: proposalIsLoading,
  } = useDaoProposal(dao, proposalId!, pluginType);

  const {data: canVote} = useWalletCanVote(
    address,
    proposalId!,
    pluginAddress,
    pluginType
  );

  const pluginClient = usePluginClient(pluginType);

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
      const mintTokenActions: {
        actions: Uint8Array[];
        index: number;
      } = {actions: [], index: 0};

      const proposalErc20Token = isErc20VotingProposal(proposal)
        ? proposal.token
        : undefined;

      const actionPromises: Promise<Action | undefined>[] =
        proposal.actions.map((action: DaoAction, index) => {
          const functionParams =
            client?.decoding.findInterface(action.data) ||
            pluginClient?.decoding.findInterface(action.data);

          switch (functionParams?.functionName) {
            case 'withdraw':
              return decodeWithdrawToAction(
                action.data,
                client,
                apolloClient,
                provider,
                network
              );
            case 'mint':
              if (mintTokenActions.actions.length === 0) {
                mintTokenActions.index = index;
              }
              mintTokenActions.actions.push(action.data);
              return Promise.resolve({} as Action);
            case 'addAllowedUsers':
              return decodeAddMembersToAction(
                action.data,
                pluginClient as AddresslistVotingClient
              );
            case 'removeAllowedUsers':
              return decodeRemoveMembersToAction(
                action.data,
                pluginClient as AddresslistVotingClient
              );
            case 'updateVotingSettings':
              return decodePluginSettingsToAction(
                action.data,
                pluginClient as TokenVotingClient,
                proposal.totalVotingWeight as bigint,
                proposalErc20Token
              );
            case 'setMetadata':
              return decodeMetadataToAction(action.data, client);
            default:
              return Promise.resolve({} as Action);
          }
        });

      if (proposalErc20Token && mintTokenActions.actions.length !== 0) {
        // Decode all the mint actions into one action with several addresses
        const decodedMintToken = decodeMintTokensToAction(
          mintTokenActions.actions,
          pluginClient as TokenVotingClient,
          proposalErc20Token.address,
          provider,
          network
        );

        // splice them back to the actions array with all the other actions
        actionPromises.splice(
          mintTokenActions.index,
          mintTokenActions.actions.length,
          decodedMintToken
        );
      }

      Promise.all(actionPromises).then(value => {
        setDecodedActions(value);
      });
    }
  }, [apolloClient, client, network, pluginClient, proposal, provider]);

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

  // show voter tab once user has voted
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

  // terminal props
  const mappedProps = useMemo(() => {
    if (proposal) return getTerminalProps(t, proposal, address);
  }, [address, proposal, t]);

  const canExecuteEarly = useCallback(() => {
    if (
      !isErc20VotingProposal(proposal) || // proposal is not token-based
      !mappedProps?.results || // no mapped data
      daoSettings?.votingMode !== VotingMode.EARLY_EXECUTION // early execution disabled
    ) {
      return false;
    }

    // check if proposal can be executed early
    const votes: Record<keyof ProposalVoteResults, Big> = {
      yes: Big(0),
      no: Big(0),
      abstain: Big(0),
    };

    for (const voteType in mappedProps.results) {
      votes[voteType as keyof ProposalVoteResults] = Big(
        mappedProps.results[
          voteType as keyof ProposalVoteResults
        ].value.toString()
      );
    }

    // renaming for clarity, should be renamed in later versions of sdk
    const supportThreshold = proposal.settings.minSupport;

    // those who didn't vote (this is NOT voting abstain)
    const absentee = formatUnits(
      Big(proposal.totalVotingWeight.toString())
        .minus(proposal.usedVotingWeight.toString())
        .toString(),
      proposal.token.decimals
    );

    return (
      // participation reached
      mappedProps?.missingParticipation === 0 &&
      // support threshold met
      votes.yes.div(votes.yes.add(votes.no)).gt(supportThreshold) &&
      // even if absentees show up and all vote against, still cannot change outcome
      votes.yes.div(votes.yes.add(votes.no).add(absentee)).gt(supportThreshold)
    );
  }, [
    daoSettings?.votingMode,
    proposal,
    mappedProps?.missingParticipation,
    mappedProps?.results,
  ]);

  const executionStatus = useMemo(() => {
    switch (proposal?.status) {
      case 'Succeeded':
        if (executionFailed) return 'executable-failed';
        else return 'executable';
      case 'Executed':
        return 'executed';
      case 'Defeated':
        return 'defeated';
      case 'Active':
        if (canExecuteEarly()) return 'executable';
        else return 'default';
      case 'Pending':
      default:
        return 'default';
    }
  }, [canExecuteEarly, executionFailed, proposal?.status]);

  // whether current user has voted
  const voted = useMemo(() => {
    return address &&
      proposal?.votes.some(
        voter =>
          voter.address.toLowerCase() === address.toLowerCase() &&
          voter.vote !== undefined
      )
      ? true
      : false;
  }, [address, proposal?.votes]);

  // vote button and status
  const [voteStatus, buttonLabel] = useMemo(() => {
    let voteStatus = '';
    let voteButtonLabel = '';

    if (!proposal?.status || !proposal?.endDate || !proposal?.startDate)
      return [voteStatus, voteButtonLabel];

    voteButtonLabel = voted
      ? canVote
        ? t('votingTerminal.status.revote')
        : t('votingTerminal.status.voteSubmitted')
      : t('votingTerminal.voteOver');

    switch (proposal.status) {
      case 'Pending':
        {
          const locale = (Locales as Record<string, Locale>)[i18n.language];
          const timeUntilNow = formatDistanceToNow(proposal.startDate, {
            includeSeconds: true,
            locale,
          });

          voteButtonLabel = t('votingTerminal.voteNow');
          voteStatus = t('votingTerminal.status.pending', {timeUntilNow});
        }
        break;
      case 'Succeeded':
        voteStatus = t('votingTerminal.status.succeeded');
        break;
      case 'Executed':
        voteStatus = t('votingTerminal.status.executed');
        break;
      case 'Defeated':
        voteStatus = t('votingTerminal.status.defeated');

        break;
      case 'Active':
        {
          const locale = (Locales as Record<string, Locale>)[i18n.language];
          const timeUntilEnd = formatDistanceToNow(proposal.endDate, {
            includeSeconds: true,
            locale,
          });

          voteStatus = t('votingTerminal.status.active', {timeUntilEnd});

          // haven't voted
          if (!voted) voteButtonLabel = t('votingTerminal.voteNow');
        }
        break;
    }
    return [voteStatus, voteButtonLabel];
  }, [
    proposal?.endDate,
    proposal?.startDate,
    proposal?.status,
    t,
    voted,
    i18n.language,
    canVote,
  ]);

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
      return isErc20VotingProposal(proposal)
        ? t('votingTerminal.status.ineligibleTokenBased', {
            token: proposal.token.name,
          })
        : t('votingTerminal.status.ineligibleWhitelist');
    }
  }, [address, canVote, isOnWrongNetwork, proposal, t]);

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
        NumberFormatter.format(proposal.creationBlockNumber),
        executionFailed,
        NumberFormatter.format(proposal.executionBlockNumber),
        proposal.executionDate
      );
  }, [
    proposal?.creationDate,
    proposal?.endDate,
    proposal?.startDate,
    proposal?.status,
    proposal?.creationBlockNumber,
    proposal?.executionBlockNumber,
    proposal?.executionDate,
    executionFailed,
  ]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (proposalError) {
    navigate(NotFound, {replace: true, state: {invalidProposal: proposalId}});
  }

  if (paramsAreLoading || proposalIsLoading || detailsAreLoading || !proposal) {
    return <Loading />;
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
              <Tag label={tag} key={tag} />
            ))}
          </BadgeContainer>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={
                proposal?.creatorAddress.toLowerCase() ===
                address?.toLowerCase()
                  ? t('labels.you')
                  : shortenAddress(proposal?.creatorAddress || '')
              }
              href={`${CHAIN_METADATA[network].explorer}/address/${proposal?.creatorAddress}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{proposal?.metadata.summary}</SummaryText>
        {proposal.metadata.description && !expandedProposal && (
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
          {proposal.metadata.description && expandedProposal && (
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
            onVoteSubmitClicked={vote =>
              handleSubmitVote(
                vote,
                (proposal as TokenVotingProposal).token?.address
              )
            }
            {...mappedProps}
          />

          <ExecutionWidget
            actions={decodedActions}
            status={executionStatus}
            onExecuteClicked={handleExecuteProposal}
            txhash={transactionHash}
          />
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
