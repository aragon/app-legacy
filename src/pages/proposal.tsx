import {
  Breadcrumb,
  ButtonText,
  IconChevronDown,
  IconChevronUp,
  IconGovernance,
  Link,
  WidgetStatus,
} from '@aragon/ods';
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
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import sanitizeHtml from 'sanitize-html';
import styled from 'styled-components';

import {ExecutionWidget} from 'components/executionWidget';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {TerminalTabs, VotingTerminal} from 'containers/votingTerminal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProposalTransactionContext} from 'context/proposalTransaction';
import {useProviders} from 'context/providers';
import {useCache} from 'hooks/useCache';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {MultisigMember, useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoProposal} from 'hooks/useDaoProposal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  useVotingSettings,
} from 'hooks/useVotingSettings';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {useWalletCanVote} from 'hooks/useWalletCanVote';
import {useTokenAsync} from 'services/token/queries/use-token';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {constants} from 'ethers';
import {
  decodeAddMembersToAction,
  decodeMetadataToAction,
  decodeMintTokensToAction,
  decodeMultisigSettingsToAction,
  decodePluginSettingsToAction,
  decodeRemoveMembersToAction,
  decodeToExternalAction,
  decodeWithdrawToAction,
  shortenAddress,
  toDisplayEns,
} from 'utils/library';
import {NotFound} from 'utils/paths';
import {
  getLiveProposalTerminalProps,
  getProposalExecutionStatus,
  getProposalStatusSteps,
  getVoteButtonLabel,
  getVoteStatus,
  isEarlyExecutable,
  isErc20VotingProposal,
  isMultisigProposal,
  stripPlgnAdrFromProposalId,
} from 'utils/proposals';
import {Action, ProposalId} from 'utils/types';
import {useDaoToken} from 'hooks/useDaoToken';
import {BigNumber} from 'ethers';
import {usePastVotingPower} from 'services/aragon-sdk/queries/use-past-voting-power';
import {Address} from 'viem';
import {useBalance} from 'wagmi';
import {UpdateVerificationCard} from 'containers/updateVerificationCard';

// TODO: @Sepehr Please assign proper tags on action decoding
// const PROPOSAL_TAGS = ['Finance', 'Withdraw'];

const PENDING_PROPOSAL_STATUS_INTERVAL = 1000 * 10;
const PROPOSAL_STATUS_INTERVAL = 1000 * 60;
const NumberFormatter = new Intl.NumberFormat('en-US');

export const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();
  const navigate = useNavigate();
  const fetchToken = useTokenAsync();

  const {dao, id: urlId} = useParams();
  const proposalId = useMemo(
    () => (urlId ? new ProposalId(urlId) : undefined),
    [urlId]
  );

  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const isMultisigDAO = pluginType === 'multisig.plugin.dao.eth';

  const {data: daoToken} = useDaoToken(pluginAddress);
  const {data: votingSettings} = useVotingSettings({pluginAddress, pluginType});

  const {
    data: {members},
  } = useDaoMembers(pluginAddress, pluginType);

  const allowVoteReplacement =
    isTokenVotingSettings(votingSettings) &&
    votingSettings.votingMode === VotingMode.VOTE_REPLACEMENT;

  const {client} = useClient();
  const {set, get} = useCache();

  const {network} = useNetwork();
  const {api: provider} = useProviders();
  const {address, isConnected, isOnWrongNetwork} = useWallet();

  const [voteStatus, setVoteStatus] = useState('');
  const [intervalInMills, setIntervalInMills] = useState(0);
  const [decodedActions, setDecodedActions] =
    useState<(Action | undefined)[]>();

  const {
    handleSubmitVote,
    handleExecuteProposal,
    isLoading: paramsAreLoading,
    voteSubmitted,
    executionFailed,
    transactionHash,
  } = useProposalTransactionContext();

  const {
    data: proposal,
    error: proposalError,
    isLoading: proposalIsLoading,
  } = useDaoProposal(
    daoDetails?.address as string,
    proposalId!,
    pluginType,
    pluginAddress,
    intervalInMills
  );

  const {data: canVote} = useWalletCanVote(
    address,
    proposalId!,
    pluginAddress,
    pluginType,
    proposal?.status as string
  );

  const {data: tokenBalanceData} = useBalance({
    address: address as Address,
    token: daoToken?.address as Address,
    chainId: CHAIN_METADATA[network as SupportedNetworks].id,
    enabled: address != null && daoToken != null,
  });
  const tokenBalance = BigNumber.from(tokenBalanceData?.value ?? 0);

  const {data: pastVotingPower = constants.Zero} = usePastVotingPower(
    {
      address: address as string,
      tokenAddress: daoToken?.address as string,
      blockNumber: proposal?.creationBlockNumber as number,
    },
    {enabled: address != null && daoToken != null && proposal != null}
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

  // Display the voting-power gating dialog when user has balance but delegated
  // his token to someone else
  const displayVotingGate =
    !isMultisigDAO &&
    tokenBalance.gt(constants.Zero) &&
    pastVotingPower.lte(constants.Zero);

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
    if (proposal && editor) {
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
    if (proposal?.status) {
      setTerminalTab(
        proposal.status === ProposalStatus.PENDING ? 'info' : 'breakdown'
      );
    }
  }, [proposal?.status]);

  // decode proposal actions
  useEffect(() => {
    if (!proposal) return;

    let mintTokenActionsIndex = 0;
    const mintTokenActionsData: Uint8Array[] = [];
    const proposalErc20Token = isErc20VotingProposal(proposal)
      ? proposal.token
      : undefined;

    const multisigClient = pluginClient as MultisigClient;
    const tokenVotingClient = pluginClient as TokenVotingClient;

    const getAction = async (action: DaoAction, index: number) => {
      const functionParams =
        client?.decoding.findInterface(action.data) ||
        pluginClient?.decoding.findInterface(action.data);

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
        case 'addAddresses':
          return decodeAddMembersToAction(action.data, multisigClient);
        case 'removeAddresses':
          return decodeRemoveMembersToAction(action.data, multisigClient);
        case 'updateVotingSettings':
          return decodePluginSettingsToAction(
            action.data,
            tokenVotingClient,
            (proposal as TokenVotingProposal).totalVotingWeight as bigint,
            proposalErc20Token
          );
        case 'updateMultisigSettings':
          return decodeMultisigSettingsToAction(action.data, multisigClient);
        case 'setMetadata':
          return decodeMetadataToAction(action.data, client);
        default: {
          try {
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

            return decodeToExternalAction(
              action,
              proposal.dao.address,
              network,
              t
            );
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
          (proposal as TokenVotingProposal).totalVotingWeight,
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
  }, [client, network, pluginClient, proposal, provider, fetchToken, t]);

  // caches the status for breadcrumb
  useEffect(() => {
    if (proposal && proposal.status !== get('proposalStatus'))
      set('proposalStatus', proposal.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.status]);

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
      if (canVote) setVotingInProcess(true);
    }
  }, [
    canVote,
    isConnected,
    isOnWrongNetwork,
    statusRef.current.wasOnWrongNetwork,
  ]);

  // show voter tab once user has voted
  useEffect(() => {
    if (voteSubmitted) {
      setTerminalTab('voters');
      setVotingInProcess(false);
    }
  }, [voteSubmitted]);

  useEffect(() => {
    if (proposal) {
      // set the very first time
      setVoteStatus(getVoteStatus(proposal, t));

      const interval = setInterval(async () => {
        const v = getVoteStatus(proposal, t);

        // remove interval timer once the proposal has started
        if (proposal.startDate.valueOf() <= new Date().valueOf()) {
          clearInterval(interval);
          setIntervalInMills(PROPOSAL_STATUS_INTERVAL);
          setVoteStatus(v);
        } else if (proposal.status === 'Pending') {
          setVoteStatus(v);
        }
      }, PENDING_PROPOSAL_STATUS_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [proposal, t]);

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
        isMultisigProposal(proposal) ? (members as MultisigMember[]) : undefined
      );
  }, [address, votingSettings, members, proposal, t]);

  // get early execution status
  let canExecuteEarly = false;

  if (proposal && mappedProps) {
    if (isTokenVotingSettings(votingSettings)) {
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
  const executionStatus = useMemo(
    () =>
      getProposalExecutionStatus(
        proposal?.status,
        canExecuteEarly,
        executionFailed
      ),
    [canExecuteEarly, executionFailed, proposal?.status]
  );

  // whether current user has voted
  const voted = useMemo(() => {
    if (!address || !proposal) return false;

    if (isMultisigProposal(proposal)) {
      return proposal.approvals.some(
        a =>
          // remove the call to strip plugin address when sdk returns proper plugin address
          stripPlgnAdrFromProposalId(a).toLowerCase() === address.toLowerCase()
      );
    } else {
      return proposal.votes.some(
        voter =>
          voter.address.toLowerCase() === address.toLowerCase() &&
          voter.vote !== undefined
      );
    }
  }, [address, proposal]);

  // vote button and status
  const buttonLabel = useMemo(() => {
    if (proposal) {
      return getVoteButtonLabel(proposal, canVote, voted, t);
    }
  }, [proposal, voted, canVote, t]);

  // vote button state and handler
  const {voteNowDisabled, onClick} = useMemo(() => {
    // disable voting on non-active proposals
    if (proposal?.status !== 'Active') return {voteNowDisabled: true};

    // disable approval on multisig when wallet has voted
    if (isMultisigDAO && (voted || voteSubmitted))
      return {voteNowDisabled: true};

    // disable voting on mv with no vote replacement when wallet has voted
    if (!allowVoteReplacement && (voted || voteSubmitted))
      return {voteNowDisabled: true};

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

    // needs voting power
    else if (displayVotingGate) {
      return {
        voteNowDisabled: false,
        onClick: () => open('delegationGating'),
      };
    }

    // member, not yet voted
    else if (canVote) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          if (isMultisigDAO) {
            handleSubmitVote(VoteValues.YES);
          } else {
            setVotingInProcess(true);
          }
        },
      };
    } else return {voteNowDisabled: true};
  }, [
    address,
    allowVoteReplacement,
    displayVotingGate,
    canVote,
    handleSubmitVote,
    isOnWrongNetwork,
    isMultisigDAO,
    open,
    proposal?.status,
    voteSubmitted,
    voted,
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
      handleExecuteProposal();
    }
  };

  // alert message, only shown when not eligible to vote
  const alertMessage = useMemo(() => {
    if (
      proposal &&
      proposal.status === 'Active' && // active proposal
      address && // logged in
      !isOnWrongNetwork && // on proper network
      !voted && // haven't voted
      !canVote && // cannot vote
      !displayVotingGate // user delegated tokens
    ) {
      // presence of token delineates token voting proposal
      // people add types to these things!!
      return isErc20VotingProposal(proposal)
        ? t('votingTerminal.status.ineligibleTokenBased', {
            token: proposal.token.name,
          })
        : t('votingTerminal.status.ineligibleWhitelist');
    }
  }, [
    address,
    canVote,
    isOnWrongNetwork,
    proposal,
    t,
    voted,
    displayVotingGate,
  ]);

  // status steps for proposal
  const proposalSteps = useMemo(() => {
    if (proposal) {
      return getProposalStatusSteps(
        t,
        proposal.status,
        pluginType,
        proposal.startDate,
        proposal.endDate,
        proposal.creationDate,
        proposal.creationBlockNumber
          ? NumberFormatter.format(proposal.creationBlockNumber)
          : '',
        executionFailed,
        proposal.executionBlockNumber
          ? NumberFormatter.format(proposal.executionBlockNumber!)
          : '',
        proposal.executionDate || undefined
      );
    } else return [];
  }, [proposal, t, pluginType, executionFailed]);

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
              navigate(
                generatePath(path, {
                  network,
                  dao: toDisplayEns(daoDetails?.ensDomain) || dao,
                })
              )
            }
            crumbs={breadcrumbs}
            icon={<IconGovernance />}
            tag={tag}
          />
        )}
        <ProposalTitle>{proposal?.metadata.title}</ProposalTitle>
        <ContentWrapper>
          {/* <BadgeContainer>
            {PROPOSAL_TAGS.map((tag: string) => (
              <Tag label={tag} key={tag} />
            ))}
          </BadgeContainer> */}
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

          <UpdateVerificationCard proposal={proposal} />

          <VotingTerminal
            status={proposal.status}
            daoToken={daoToken}
            blockNumber={proposal?.creationBlockNumber}
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
            pluginType={pluginType}
            actions={decodedActions}
            status={executionStatus}
            onExecuteClicked={handleExecuteNowClicked}
            txhash={transactionHash || proposal?.executionTxHash || undefined}
          />
        </ProposalContainer>
        <AdditionalInfoContainer>
          <ResourceList links={proposal?.metadata.resources} />
          <WidgetStatus steps={proposalSteps} />
        </AdditionalInfoContainer>
      </ContentContainer>
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'col-span-full desktop:col-start-2 desktop:col-end-12',
})``;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-2 desktop:p-0 tablet:px-3 pt-2',
})``;

const ProposalTitle = styled.p.attrs({
  className: 'font-bold text-ui-800 text-3xl',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'flex flex-col tablet:flex-row gap-x-3 gap-y-1.5',
})``;

// const BadgeContainer = styled.div.attrs({
//   className: 'flex flex-wrap gap-x-1.5',
// })``;

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
