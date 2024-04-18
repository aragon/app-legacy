import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Breadcrumb, WidgetStatus} from '@aragon/ods-old';
import {Button, IconType} from '@aragon/ods';
import {
  MultisigClient,
  MultisigProposal,
  TokenVotingClient,
  TokenVotingProposal,
  VoteValues,
  VotingMode,
} from '@aragon/sdk-client';
import {DaoAction, ProposalStatus} from '@aragon/sdk-client-common';
import TipTapLink from '@tiptap/extension-link';
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {useTranslation} from 'react-i18next';
import {generatePath, Link, useNavigate, useParams} from 'react-router-dom';
import sanitizeHtml from 'sanitize-html';
import styled from 'styled-components';

import {ExecutionWidget} from 'components/executionWidget';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {
  TerminalTabs,
  VotingTerminal,
  VotingTerminalProps,
} from 'containers/votingTerminal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProposalTransactionContext} from 'context/proposalTransaction';
import {useProviders} from 'context/providers';
import {useCache} from 'hooks/useCache';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoToken} from 'hooks/useDaoToken';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {
  GaslessPluginName,
  PluginTypes,
  usePluginClient,
} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {useWalletCanVote} from 'hooks/useWalletCanVote';
import {useProposal} from 'services/aragon-sdk/queries/use-proposal';
import {
  isGaslessVotingSettings,
  isMultisigVotingSettings,
  isTokenVotingSettings,
  useVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {useTokenAsync} from 'services/token/queries/use-token';
import {CHAIN_METADATA} from 'utils/constants';
import {featureFlags} from 'utils/featureFlags';
import {
  GaslessVotingClient,
  GaslessVotingProposal,
} from '@vocdoni/gasless-voting';
import {BigNumber, constants} from 'ethers';
import {usePastVotingPower} from 'services/aragon-sdk/queries/use-past-voting-power';
import {
  decodeAddMembersToAction,
  decodeApplyUpdateAction,
  decodeGaslessSettingsToAction,
  decodeMetadataToAction,
  decodeMintTokensToAction,
  decodeMultisigSettingsToAction,
  decodeOSUpdateActions,
  decodePluginSettingsToAction,
  decodeRemoveMembersToAction,
  decodeToExternalAction,
  decodeUpgradeToAndCallAction,
  decodeWithdrawToAction,
  shortenAddress,
  toDisplayEns,
} from 'utils/library';
import {DaoMember, NotFound} from 'utils/paths';
import {
  getLiveProposalTerminalProps,
  getProposalExecutionStatus,
  getProposalStatusSteps,
  getVoteButtonLabel,
  getVoteStatus,
  isEarlyExecutable,
  isErc20VotingProposal,
  isGaslessProposal,
  isMultisigProposal,
} from 'utils/proposals';
import {Action} from 'utils/types';
import {GaslessVotingTerminal} from '../containers/votingTerminal/gaslessVotingTerminal';
import {useGaslessHasAlreadyVote} from '../context/useGaslessVoting';
import {UpdateVerificationCard} from 'containers/updateVerificationCard';
import {VoteOrApprovalDialog} from 'containers/VoteOrApprovalDialog/VoteOrApprovalDialog';

export const PENDING_PROPOSAL_STATUS_INTERVAL = 1000 * 10;
export const PROPOSAL_STATUS_INTERVAL = 1000 * 60;
const NumberFormatter = new Intl.NumberFormat('en-US');

export const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();
  const navigate = useNavigate();
  const fetchToken = useTokenAsync();

  const {dao, id: proposalId} = useParams();

  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const isMultisigPlugin = pluginType === 'multisig.plugin.dao.eth';
  const isTokenVotingPlugin = pluginType === 'token-voting.plugin.dao.eth';
  const isGaslessVotingPlugin = pluginType === GaslessPluginName;

  const {data: daoToken} = useDaoToken(pluginAddress);

  const {
    data: {members},
  } = useDaoMembers(pluginAddress, pluginType, {
    enabled: isMultisigPlugin,
  });

  const {client} = useClient();
  const {set, get} = useCache();

  const {network} = useNetwork();
  const {api: provider} = useProviders();
  const {address, isConnected, isOnWrongNetwork} = useWallet();

  const [voteStatus, setVoteStatus] = useState('');
  const [decodedActions, setDecodedActions] =
    useState<(Action | undefined)[]>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tryExecution, setTryExecution] = useState(false);
  const [vote, setVote] = useState<VoteValues>();
  const [votingPower, setVotingPower] = useState<BigNumber>(BigNumber.from(0));
  const [voteTokenAddress, setVoteTokenAddress] = useState<
    string | undefined
  >();
  const [replacingVote, setReplacingVote] = useState(false);
  const [voteOrApprovalSubmitted, setVoteOrApprovalSubmitted] = useState(false);

  const {
    handlePrepareExecution,
    isLoading: paramsAreLoading,
    executionFailed,
    executionTxHash,
  } = useProposalTransactionContext();

  const {
    data: proposal,
    isLoading: proposalIsLoading,
    isFetched: proposalIsFetched,
    isError: proposalError,
    refetch,
  } = useProposal(
    {
      pluginType: pluginType,
      id: proposalId ?? '',
    },
    {
      enabled: !!proposalId,

      // refetch active proposal data every minute
      refetchInterval: query =>
        query.state.data?.status === ProposalStatus.ACTIVE
          ? PROPOSAL_STATUS_INTERVAL
          : false,
    }
  );

  const {data: votingSettings} = useVotingSettings(
    {
      pluginAddress,
      pluginType,
      blockNumber: proposal?.creationBlockNumber,
    },
    {enabled: !!proposal?.creationBlockNumber}
  );

  const proposalStatus = proposal?.status;

  const isSuccessfulMultisigSignalingProposal =
    isMultisigProposal(proposal) &&
    proposal.status === ProposalStatus.SUCCEEDED &&
    proposal.actions.length === 0 &&
    isMultisigVotingSettings(votingSettings) &&
    votingSettings.minApprovals <= proposal.approvals.length;

  // checking only after voting settings and proposal are available
  // so that the status isn't transitioning from "Succeeded" to "Approved"
  // for a successful signalling Multisig proposal
  let displayedProposalStatus = '';
  if (votingSettings && proposal) {
    displayedProposalStatus = isSuccessfulMultisigSignalingProposal
      ? t('votingTerminal.status.approved')
      : proposal.status;
  }

  const {data: canVote} = useWalletCanVote(
    address,
    proposalId!,
    pluginAddress,
    pluginType,
    proposal?.status as string,
    isGaslessProposal(proposal) ? proposal.vochainProposalId : undefined
  );

  const shouldFetchPastVotingPower =
    address != null &&
    daoToken != null &&
    proposal != null &&
    proposal.status === ProposalStatus.ACTIVE;

  const {data: pastVotingPower = constants.Zero} = usePastVotingPower(
    {
      address: address as string,
      tokenAddress: daoToken?.address as string,
      blockNumber: proposal?.creationBlockNumber as number,
      network,
    },
    {
      enabled: shouldFetchPastVotingPower,
    }
  );

  const {hasAlreadyVote: gaslessAlreadyVote} = useGaslessHasAlreadyVote({
    proposal,
  });

  const pluginClient = usePluginClient(pluginType);

  // ref used to hold "memories" of previous "state"
  // across renders in order to automate the following states:
  // loggedOut -> login modal => switch network modal -> vote options selection;
  const statusRef = useRef({wasNotLoggedIn: false, wasOnWrongNetwork: false});

  // voting
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('info');
  const [votingInProcess, setVotingInProcess] = useState(false);
  const [expandedProposal, setExpandedProposal] = useState(false);

  // Display the delegation gating dialog when user cannot vote on token-based proposal
  const displayDelegationVoteGating = !isMultisigPlugin && !canVote;

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

  // set editor data
  useEffect(() => {
    if (proposal && editor && proposal.metadata.description) {
      editor.commands.setContent(
        // Default list of allowed tags and attributes - https://www.npmjs.com/package/sanitize-html#default-options
        sanitizeHtml(proposal.metadata.description, {
          // the disallowedTagsMode displays the disallowed tags to be rendered as a string
          disallowedTagsMode: 'recursiveEscape',
        }),
        true
      );
    }
  }, [editor, proposal]);

  useEffect(() => {
    if (proposalStatus) {
      setTerminalTab(
        proposalStatus === ProposalStatus.PENDING ? 'info' : 'breakdown'
      );
    }
  }, [proposalStatus]);

  const proposalAndClientsExist = !!proposal && !!client && !!pluginClient;
  const proposalErc20Token =
    proposalAndClientsExist && isErc20VotingProposal(proposal)
      ? proposal.token
      : undefined;
  const totalVotingWeight = (proposal as TokenVotingProposal)
    ?.totalVotingWeight;
  const daoAddress = proposal?.dao.address || '';

  // decode proposal actions
  useEffect(() => {
    if (!proposalAndClientsExist) return;

    let mintTokenActionsIndex = 0;
    const mintTokenActionsData: Uint8Array[] = [];

    const multisigClient = pluginClient as MultisigClient;
    const tokenVotingClient = pluginClient as TokenVotingClient;
    const gaslessVotingClient = pluginClient as GaslessVotingClient;

    const getAction = async (action: DaoAction, index: number) => {
      const functionParams =
        client?.decoding.findInterface(action.data) ||
        pluginClient?.decoding.findInterface(action.data);

      // Check if "mint" proposal action was made through SCC or MintToken Action
      if (
        functionParams?.functionName === 'mint' &&
        action.to !== proposalErc20Token?.address
      ) {
        functionParams.functionName = 'mintSCCAction';
      }

      switch (functionParams?.functionName) {
        case 'transfer':
          return decodeWithdrawToAction(
            action.data,
            client,
            provider,
            network,
            action.to,
            action.value,
            fetchToken
          );
        case 'mint':
          if (mintTokenActionsData.length === 0) mintTokenActionsIndex = index;
          mintTokenActionsData.push(action.data);
          return;
        case 'addExecutionMultisigMembers':
          return decodeAddMembersToAction(action.data, gaslessVotingClient);
        case 'removeExecutionMultisigMembers':
          return decodeRemoveMembersToAction(action.data, multisigClient);
        case 'addAddresses':
          return decodeAddMembersToAction(action.data, multisigClient);
        case 'removeAddresses':
          return decodeRemoveMembersToAction(action.data, multisigClient);
        case 'updateVotingSettings':
          return decodePluginSettingsToAction(
            action.data,
            tokenVotingClient,
            totalVotingWeight,
            proposalErc20Token
          );
        case 'updateMultisigSettings':
          return decodeMultisigSettingsToAction(action.data, multisigClient);
        case 'setMetadata':
          return decodeMetadataToAction(action.data, client);
        case 'upgradeToAndCall':
          return decodeUpgradeToAndCallAction(action, client);
        case 'updatePluginSettings':
          return decodeGaslessSettingsToAction(
            action.data,
            gaslessVotingClient,
            (proposal as GaslessVotingProposal).totalVotingWeight,
            proposalErc20Token
          );
        case 'grant':
        case 'revoke': {
          return decodeOSUpdateActions(
            daoAddress,
            t,
            action,
            network,
            provider
          );
        }
        default: {
          try {
            // check if the action is a plugin apply update action
            // calling no function name is provided for this custom action
            const decodedApplyUpdate = decodeApplyUpdateAction(action, client);

            if (decodedApplyUpdate) {
              return decodedApplyUpdate;
            }

            // check if withdraw action
            const decodedAction = await decodeWithdrawToAction(
              action.data,
              client,
              provider,
              network,
              action.to,
              action.value,
              fetchToken
            );

            // assume that the action is a valid native withdraw
            // if the token name is the same as the chain native token
            if (
              decodedAction?.tokenName.toLowerCase() ===
              CHAIN_METADATA[network].nativeCurrency.name.toLowerCase()
            ) {
              return decodedAction;
            }
          } catch (error) {
            console.warn(
              'decodeWithdrawToAction failed, trying decodeToExternalAction'
            );

            return decodeToExternalAction(action, daoAddress, network, t);
          }
        }
      }
    };

    const processActions = async () => {
      const actionPromises: Promise<Action | undefined>[] =
        proposal.actions.map(getAction);

      // decode mint tokens actions with all the addresses together
      if (proposalErc20Token && mintTokenActionsData.length !== 0) {
        const decodedMintToken = decodeMintTokensToAction(
          mintTokenActionsData,
          pluginClient as TokenVotingClient,
          proposalErc20Token.address,
          totalVotingWeight,
          provider,
          network
        );

        actionPromises[mintTokenActionsIndex] =
          Promise.resolve(decodedMintToken);
      }

      const results = await Promise.all(actionPromises);
      setDecodedActions(results);
    };

    processActions();
  }, [
    proposalAndClientsExist,
    proposalErc20Token,
    totalVotingWeight,
    daoAddress,
    proposal,
    client,
    network,
    pluginClient,
    provider,
    fetchToken,
    t,
  ]);

  // caches the status for breadcrumb
  useEffect(() => {
    if (displayedProposalStatus !== get('proposalStatus'))
      set('proposalStatus', displayedProposalStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedProposalStatus]);

  // handle can vote and wallet connection status
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
      if (canVote && !isMultisigPlugin) setVotingInProcess(true);
    }
  }, [
    canVote,
    isConnected,
    isMultisigPlugin,
    isOnWrongNetwork,
    statusRef.current.wasOnWrongNetwork,
  ]);

  // show voter tab once user has voted
  useEffect(() => {
    if (voteOrApprovalSubmitted) {
      setTerminalTab('voters');
      setVotingInProcess(false);
    }
  }, [voteOrApprovalSubmitted]);

  useEffect(() => {
    if (proposal) {
      // set the very first time
      setVoteStatus(getVoteStatus(proposal, t));

      const interval = setInterval(async () => {
        const v = getVoteStatus(proposal, t);

        // remove interval timer once the proposal has started
        if (proposal.startDate.valueOf() <= new Date().valueOf()) {
          clearInterval(interval);
          setVoteStatus(v);
          if (proposalStatus === ProposalStatus.PENDING) {
            refetch();
          }
        } else if (proposalStatus === ProposalStatus.PENDING) {
          setVoteStatus(v);
        }
      }, PENDING_PROPOSAL_STATUS_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [proposal, proposalStatus, refetch, t]);

  /*************************************************
   *              Handlers and Callbacks           *
   *************************************************/

  // terminal props
  const mappedProps = useMemo(() => {
    if (proposal && votingSettings)
      return getLiveProposalTerminalProps(
        t,
        proposal,
        address,
        votingSettings,
        isMultisigProposal(proposal) ? members : undefined
      );
  }, [address, members, proposal, t, votingSettings]);

  // get early execution status
  let canExecuteEarly = false;

  if (proposal && mappedProps) {
    if (isGaslessVotingSettings(votingSettings)) {
      canExecuteEarly = false;
    } else if (isTokenVotingSettings(votingSettings)) {
      canExecuteEarly = isEarlyExecutable(
        mappedProps?.missingParticipation,
        proposal,
        mappedProps?.results,
        votingSettings.votingMode
      );
    } else if (isMultisigVotingSettings(votingSettings)) {
      canExecuteEarly =
        (proposal as MultisigProposal)?.approvals?.length >=
        votingSettings.minApprovals;
    }
  }

  // proposal execution status
  const executionStatus = getProposalExecutionStatus(
    proposalStatus,
    canExecuteEarly,
    executionFailed,
    undefined
  );

  // whether current user has voted
  let voted = false;

  if (address == null || proposal == null) {
    voted = false;
  } else if (isMultisigProposal(proposal)) {
    voted = proposal.approvals.some(
      a => a.toLowerCase() === address.toLowerCase()
    );
  } else if (isGaslessProposal(proposal)) {
    voted = gaslessAlreadyVote;
  } else {
    voted = proposal.votes.some(
      voter =>
        voter.address.toLowerCase() === address.toLowerCase() &&
        voter.vote != null
    );
  }

  // multisig proposal must have at least one action to trigger
  // approve and execute flow
  const executableWithNextApproval =
    isMultisigProposal(proposal) &&
    (proposal.status === ProposalStatus.PENDING ||
      proposal.status === ProposalStatus.ACTIVE) &&
    isMultisigVotingSettings(votingSettings) &&
    proposal.actions.length > 0 &&
    proposal.approvals.length + 1 >= votingSettings.minApprovals;

  // vote button label
  let voteButtonLabel = '';
  if (proposal && votingSettings) {
    voteButtonLabel = getVoteButtonLabel(
      proposal,
      votingSettings,
      voted,
      executableWithNextApproval && !voted,
      t
    );
  }

  // vote button status
  const canRevote =
    isTokenVotingSettings(votingSettings) &&
    votingSettings.votingMode === VotingMode.VOTE_REPLACEMENT;

  const connectedToRightNetwork = isConnected && !isOnWrongNetwork;

  const votingDisabled =
    // can only vote on active proposals
    proposal?.status !== ProposalStatus.ACTIVE ||
    // when disconnected or on wrong network,
    // login and network modals should be shown respectively
    (connectedToRightNetwork &&
      // need to check canVote status on Multisig because
      // the delegation modals are not shown for Multisig
      ((isMultisigPlugin && (voted || canVote === false)) ||
        (isGaslessVotingPlugin && (voted || canVote === false)) ||
        (isTokenVotingPlugin && voted && !canRevote)));

  const handleApprovalClick = useCallback(
    (tryExecution: boolean) => {
      if (address == null) {
        open('wallet');
        statusRef.current.wasNotLoggedIn = true;
      } else if (isOnWrongNetwork) {
        open('network');
        statusRef.current.wasOnWrongNetwork = true;
      } else if (canVote && proposal?.id) {
        setIsDialogOpen(true);
        setTryExecution(tryExecution);
      }
    },
    [address, canVote, isOnWrongNetwork, open, proposal?.id]
  );

  const handleVoteClick = useCallback(() => {
    if (address == null) {
      open('wallet');
      statusRef.current.wasNotLoggedIn = true;
    } else if (isOnWrongNetwork) {
      open('network');
      statusRef.current.wasOnWrongNetwork = true;
    } else if (displayDelegationVoteGating && !isGaslessProposal(proposal)) {
      return open('delegationGating', {proposal});
    } else if (canVote) {
      setVotingInProcess(true);
    }
  }, [
    address,
    canVote,
    displayDelegationVoteGating,
    proposal,
    isOnWrongNetwork,
    open,
  ]);

  // handler for execution
  const handleExecuteNowClicked = () => {
    if (!address) {
      open('wallet');
      statusRef.current.wasNotLoggedIn = true;
    } else if (isOnWrongNetwork) {
      // don't allow execution on wrong network
      open('network');
    } else {
      handlePrepareExecution();
    }
  };

  const displayAlertMessage =
    isMultisigPlugin && // is multisig plugin
    proposal?.status === 'Active' && // active proposal
    address && // logged in
    !isOnWrongNetwork && // on proper network
    !voted && // haven't voted
    !canVote; // cannot vote

  const alertMessage = displayAlertMessage
    ? t('votingTerminal.status.ineligibleWhitelist')
    : undefined;

  let proposalStateEndate = proposal?.endDate;
  // If is gasless proposal and is defeated because is not approved, but the offchain election passed, use the tally end date
  if (
    proposal &&
    isGaslessProposal(proposal) &&
    proposal.status === ProposalStatus.DEFEATED &&
    proposal.canBeApproved // Offchain election passed
  ) {
    proposalStateEndate = proposal.tallyEndDate;
  }
  // status steps for proposal
  const proposalSteps = proposal
    ? getProposalStatusSteps(
        t,
        proposal.status,
        pluginType,
        proposal.startDate,
        // If is gasless the proposal ends after the expiration period
        proposalStateEndate!,
        proposal.creationDate,
        proposal.creationBlockNumber
          ? NumberFormatter.format(proposal.creationBlockNumber)
          : '',
        executionFailed,
        isSuccessfulMultisigSignalingProposal,
        proposal.executionBlockNumber
          ? NumberFormatter.format(proposal.executionBlockNumber!)
          : '',
        proposal.executionDate ?? undefined
      )
    : [];

  /*************************************************
   *                     Render                    *
   *************************************************/
  const isLoading = paramsAreLoading || proposalIsLoading || detailsAreLoading;

  if (proposalError || (proposalIsFetched && proposal == null)) {
    navigate(NotFound, {replace: true, state: {invalidProposal: proposalId}});
    return null;
  }

  if (isLoading || proposal == null) {
    return <Loading />;
  }

  // Store voting terminal props
  const votingTerminalProps: VotingTerminalProps = {
    ...mappedProps,
    title: isMultisigProposal(proposal)
      ? t('votingTerminal.multisig.title')
      : isTokenVotingPlugin
      ? t('votingTerminal.title')
      : undefined, // Title will be shown on the GaslessVotingTerminal
    status: proposalStatus,
    pluginType,
    daoToken,
    blockNumber: proposal.creationBlockNumber,
    statusLabel: isGaslessProposal(proposal) ? undefined : voteStatus, // Status will be shown on the GaslessVotingTerminal,
    selectedTab: terminalTab,
    alertMessage,
    onTabSelected: setTerminalTab,
    onVoteClicked: handleVoteClick,
    onApprovalClicked: handleApprovalClick,
    onCancelClicked: () => setVotingInProcess(false),
    voteButtonLabel,
    voteNowDisabled: votingDisabled,
    votingInProcess,
    voted: voted,
    executableWithNextApproval,
    onVoteSubmitClicked: vote => {
      setVote(vote);
      setVotingPower(pastVotingPower);
      if (isGaslessProposal(proposal)) {
        setVote(vote);
        setVoteTokenAddress(proposal.token?.address);
      } else {
        setVoteTokenAddress((proposal as TokenVotingProposal).token?.address);
        setReplacingVote(!!(voted || voteOrApprovalSubmitted));
      }
      setIsDialogOpen(true);
    },
  };

  return (
    <Container>
      <HeaderContainer>
        {!isDesktop && (
          <Breadcrumb
            onClick={(path: string) =>
              navigate(
                generatePath(path, {
                  network,
                  dao: toDisplayEns(daoDetails?.ensDomain) || dao,
                })
              )
            }
            crumbs={breadcrumbs}
            icon={IconType.APP_PROPOSALS}
            tag={tag}
          />
        )}
        <ProposalTitle>{proposal.metadata.title}</ProposalTitle>
        <ContentWrapper>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              to={generatePath(DaoMember, {
                network,
                dao,
                user: proposal.creatorAddress,
              })}
              className="inline-flex max-w-full cursor-pointer items-center space-x-3 truncate rounded font-semibold text-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring focus-visible:ring-primary active:text-primary-800"
            >
              {proposal.creatorAddress.toLowerCase() === address?.toLowerCase()
                ? t('labels.you')
                : shortenAddress(proposal.creatorAddress)}
            </Link>
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{proposal.metadata.summary}</SummaryText>
        {proposal.metadata.description && !expandedProposal && (
          <Button
            className="w-full md:w-max"
            size="lg"
            variant="tertiary"
            iconRight={IconType.CHEVRON_DOWN}
            onClick={() => setExpandedProposal(true)}
          >
            {t('governance.proposals.buttons.readFullProposal')}
          </Button>
        )}
      </HeaderContainer>

      <ContentContainer expandedProposal={expandedProposal}>
        <ProposalContainer>
          {proposal.metadata.description && expandedProposal && (
            <>
              <StyledEditorContent editor={editor} />
              <Button
                className="mt-6 w-full md:w-max"
                variant="tertiary"
                size="md"
                iconRight={IconType.CHEVRON_UP}
                onClick={() => setExpandedProposal(false)}
              >
                {t('governance.proposals.buttons.closeFullProposal')}
              </Button>
            </>
          )}

          {proposal &&
            (proposalStatus === ProposalStatus.ACTIVE ||
              proposalStatus === ProposalStatus.SUCCEEDED) &&
            featureFlags.getValue('VITE_FEATURE_FLAG_OSX_UPDATES') ===
              'true' && <UpdateVerificationCard proposalId={proposalId} />}
          {votingSettings && isGaslessProposal(proposal) ? (
            <GaslessVotingTerminal
              proposal={proposal}
              votingStatusLabel={voteStatus}
              pluginAddress={pluginAddress}
              statusRef={statusRef}
              onExecuteClicked={handleExecuteNowClicked}
              actions={decodedActions}
              connectedToRightNetwork={connectedToRightNetwork}
              pluginType={pluginType}
            >
              <VotingTerminal
                {...votingTerminalProps}
                className={
                  'border border-t-0 border-neutral-100 bg-neutral-0 px-4 py-5 md:p-6'
                }
              />
            </GaslessVotingTerminal>
          ) : (
            votingSettings && (
              <>
                <VotingTerminal {...votingTerminalProps} />
                <ExecutionWidget
                  pluginType={pluginType}
                  actions={decodedActions}
                  status={executionStatus}
                  onExecuteClicked={handleExecuteNowClicked}
                  txhash={
                    executionTxHash || proposal.executionTxHash || undefined
                  }
                />
              </>
            )
          )}
        </ProposalContainer>
        <AdditionalInfoContainer>
          <ResourceList links={proposal.metadata.resources} />
          <WidgetStatus steps={proposalSteps} />
        </AdditionalInfoContainer>
      </ContentContainer>

      <VoteOrApprovalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        tryExecution={tryExecution}
        pluginType={pluginType}
        vote={vote}
        votingPower={votingPower}
        replacingVote={replacingVote}
        voteTokenAddress={voteTokenAddress}
        setVoteOrApprovalSubmitted={setVoteOrApprovalSubmitted}
      />
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'col-span-full xl:col-start-2 xl:col-end-12',
})``;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-4 xl:p-0 md:px-6 pt-4',
})``;

const ProposalTitle = styled.p.attrs({
  className: 'font-semibold text-neutral-800 text-4xl leading-tight',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'flex flex-col md:flex-row gap-x-6 gap-y-3',
})``;

const ProposerLink = styled.div.attrs({
  className: 'text-neutral-500',
})``;

const SummaryText = styled.p.attrs({
  className: 'text-xl leading-normal text-neutral-600',
})``;

const ProposalContainer = styled.div.attrs({
  className: 'space-y-6 md:w-3/5 text-neutral-600',
})``;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'space-y-6 md:w-2/5',
})``;

type ContentContainerProps = {
  expandedProposal: boolean;
};

const ContentContainer = styled.div.attrs<ContentContainerProps>(
  ({expandedProposal}) => ({
    className: `${
      expandedProposal ? 'md:mt-10' : 'md:mt-16'
    } mt-6 md:flex md:space-x-6 space-y-6 md:space-y-0`,
  })
)<ContentContainerProps>``;
