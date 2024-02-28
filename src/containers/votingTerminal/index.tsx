import React, {useEffect, useMemo, useState} from 'react';
import {
  ButtonGroup,
  CheckboxListItem,
  Option,
  SearchInput,
  VoterType,
  VotersTable,
} from '@aragon/ods-old';
import {Button, AlertCard, AlertInline, EmptyState} from '@aragon/ods';
import {
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
  VoteValues,
} from '@aragon/sdk-client';
import {ProposalStatus} from '@aragon/sdk-client-common';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useProviders} from 'context/providers';
import {formatUnits} from 'ethers/lib/utils';
import {usePastVotingPowerAsync} from 'services/aragon-sdk/queries/use-past-voting-power';
import {Web3Address, shortenAddress} from 'utils/library';
import BreakdownTab from './breakdownTab';
import InfoTab from './infoTab';
import {GaslessPluginName, PluginTypes} from 'hooks/usePluginClient';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {DaoMember} from 'utils/paths';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';

export type ProposalVoteResults = {
  yes: {value: string | number; percentage: number};
  no: {value: string | number; percentage: number};
  abstain: {value: string | number; percentage: number};
};

export type TerminalTabs = 'voters' | 'breakdown' | 'info';

export type VotingTerminalProps = {
  title?: string;
  breakdownTabDisabled?: boolean;
  votersTabDisabled?: boolean;
  voteNowDisabled?: boolean;
  startDate?: string;
  endDate?: string;
  preciseEndDate?: string;
  minApproval?: number;
  minParticipation?: string;
  currentParticipation?: string;
  missingParticipation?: number;
  supportThreshold?: number;
  voters?: Array<VoterType>;
  status?: ProposalStatus;
  statusLabel?: string;
  strategy?: string;
  daoToken?: Erc20TokenDetails | Erc20WrapperTokenDetails;
  blockNumber?: Number;
  results?: ProposalVoteResults;
  approvals?: string[];
  voted?: boolean;
  votingInProcess?: boolean;
  voteOptions?: string;
  onApprovalClicked?: (tryExecution: boolean) => void;
  onVoteClicked?: React.MouseEventHandler<HTMLButtonElement>;
  onVoteSubmitClicked?: (vote: VoteValues) => void;
  onCancelClicked?: React.MouseEventHandler<HTMLButtonElement>;
  voteButtonLabel?: string;
  alertMessage?: string;
  selectedTab?: TerminalTabs;
  onTabSelected?: React.Dispatch<React.SetStateAction<TerminalTabs>>;
  pluginType: PluginTypes;
  executableWithNextApproval?: boolean;
  className?: string;
};

export const VotingTerminal: React.FC<VotingTerminalProps> = ({
  title,
  breakdownTabDisabled = false,
  votersTabDisabled = false,
  voteNowDisabled = false,
  currentParticipation,
  minApproval,
  minParticipation,
  missingParticipation = 0,
  supportThreshold,
  voters = [],
  results,
  approvals,
  daoToken,
  blockNumber,
  startDate,
  endDate,
  preciseEndDate,
  status,
  statusLabel,
  strategy,
  voted = false,
  voteOptions = '',
  onApprovalClicked,
  onVoteClicked,
  onVoteSubmitClicked,
  votingInProcess,
  onCancelClicked,
  voteButtonLabel,
  alertMessage,
  selectedTab = 'info',
  onTabSelected,
  pluginType,
  executableWithNextApproval = false,
  className,
}) => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [selectedVote, setSelectedVote] = useState<VoteValues>();
  const [displayedVoters, setDisplayedVoters] = useState<Array<VoterType>>([]);
  const {api: provider} = useProviders();
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();
  const {dao} = useParams();
  const fetchPastVotingPower = usePastVotingPowerAsync();

  const isMultisigProposal =
    (pluginType === 'multisig.plugin.dao.eth' ||
      pluginType === GaslessPluginName) && // If is gasless and have approvals or min approvals act as multisig voting terminal
    !!approvals &&
    !!minApproval;

  useEffect(() => {
    // fetch avatar for each voter
    async function fetchEns() {
      const response = await Promise.all(
        voters.map(async voter => {
          const wallet = await Web3Address.create(provider, voter.wallet);
          let balance;
          if (daoToken?.address && wallet.address) {
            balance = await fetchPastVotingPower({
              tokenAddress: daoToken.address as string,
              address: wallet.address as string,
              blockNumber: blockNumber as number,
              network,
            });
          }
          return {
            ...voter,
            tokenAmount: balance
              ? formatUnits(balance, daoToken?.decimals)
              : voter.tokenAmount,
            tokenSymbol: daoToken?.symbol,
            wallet: (wallet.ensName ?? wallet.address) as string,
            src: (wallet.avatar || wallet.address) as string,
          };
        })
      );
      setDisplayedVoters(response);
    }

    if (voters.length) {
      fetchEns();
    }
  }, [
    blockNumber,
    daoToken?.address,
    daoToken?.decimals,
    daoToken?.symbol,
    fetchPastVotingPower,
    network,
    provider,
    voters,
  ]);

  const filteredVoters = useMemo(() => {
    return query === ''
      ? displayedVoters
      : displayedVoters.filter(voter =>
          voter.wallet.includes(query.toLowerCase())
        );
  }, [displayedVoters, query]);

  const minimumReached = useMemo(() => {
    if (isMultisigProposal) {
      return approvals.length >= minApproval;
    } else {
      return missingParticipation === 0;
    }
  }, [
    approvals?.length,
    isMultisigProposal,
    minApproval,
    missingParticipation,
  ]);

  const missingApprovalOrParticipation = useMemo(() => {
    if (isMultisigProposal) {
      return minimumReached ? 0 : minApproval - approvals.length;
    } else {
      return missingParticipation;
    }
  }, [
    approvals?.length,
    isMultisigProposal,
    minApproval,
    minimumReached,
    missingParticipation,
  ]);

  return (
    <Container customClasses={className}>
      <Header className="items-start gap-x-6">
        <div className="flex-1 space-y-3">
          {title && <Heading1> {title}</Heading1>}
          {statusLabel && (
            <AlertInline
              message={statusLabel}
              variant={status === 'Defeated' ? 'critical' : 'info'}
            />
          )}
        </div>
        <div className="flex-1">
          <ButtonGroup
            bgWhite
            defaultValue={selectedTab}
            value={selectedTab}
            onChange={(value: string) => onTabSelected?.(value as TerminalTabs)}
          >
            <Option
              value="breakdown"
              label={t('votingTerminal.breakdown')}
              disabled={breakdownTabDisabled}
              className="flex-1"
            />
            <Option
              value="voters"
              label={t('votingTerminal.voters')}
              disabled={votersTabDisabled}
              className="flex-1"
            />
            <Option
              value="info"
              label={t('votingTerminal.info')}
              className="flex-1"
            />
          </ButtonGroup>
        </div>
      </Header>

      {selectedTab === 'breakdown' ? (
        <BreakdownTab
          approvals={approvals}
          memberCount={minApproval ?? voters.length} // For gasless proposals, the member count is the minimum approval and not all voters
          results={results}
          token={daoToken}
        />
      ) : selectedTab === 'voters' ? (
        <VotersTabContainer>
          <SearchInput
            placeholder={t('votingTerminal.inputPlaceholder')}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value.trim())
            }
          />
          {filteredVoters.length !== 0 ? (
            <VotersTable
              voters={filteredVoters}
              showOption
              page={page}
              showAmount={daoToken !== undefined}
              onLoadMore={() => setPage(prev => prev + 1)}
              LoadMoreLabel={t('community.votersTable.loadMore')}
              onVoterClick={user => {
                dao
                  ? navigate(
                      generatePath(DaoMember, {
                        network,
                        dao,
                        user,
                      })
                    )
                  : window.open(
                      `${CHAIN_METADATA[network].explorer}address/${user}`,
                      '_blank'
                    );
              }}
            />
          ) : (
            <div className="flex justify-center">
              <EmptyState
                objectIllustration={{object: 'MAGNIFYING_GLASS'}}
                heading={t(
                  query === ''
                    ? 'votingTerminal.emptyState.title'
                    : 'votingTerminal.emptyState.titleSearch',
                  {
                    query: shortenAddress(query),
                  }
                )}
                description={
                  query === '' ? '' : t('votingTerminal.emptyState.subtitle')
                }
              />
            </div>
          )}
        </VotersTabContainer>
      ) : (
        <InfoTab
          currentParticipation={currentParticipation}
          currentApprovals={approvals?.length}
          endDate={endDate}
          preciseEndDate={preciseEndDate}
          memberCount={voters.length}
          minApproval={minApproval}
          minimumReached={minimumReached}
          minParticipation={minParticipation}
          missingApprovalOrParticipation={missingApprovalOrParticipation}
          startDate={startDate}
          status={status}
          strategy={strategy}
          supportThreshold={supportThreshold}
          uniqueVoters={daoToken ? voters.length : undefined}
          voteOptions={voteOptions}
        />
      )}

      {votingInProcess ? (
        <VotingContainer>
          <Heading2>{t('votingTerminal.chooseOption')}</Heading2>
          <p className="mt-2 text-neutral-500">
            {t('votingTerminal.chooseOptionHelptext')}
          </p>

          <CheckboxContainer>
            <CheckboxListItem
              label={t('votingTerminal.yes')}
              helptext={t('votingTerminal.yesHelptext')}
              onClick={() => setSelectedVote(VoteValues.YES)}
              type={selectedVote === VoteValues.YES ? 'active' : 'default'}
            />
            <CheckboxListItem
              label={t('votingTerminal.no')}
              helptext={t('votingTerminal.noHelptext')}
              onClick={() => setSelectedVote(VoteValues.NO)}
              type={selectedVote === VoteValues.NO ? 'active' : 'default'}
            />
            <CheckboxListItem
              label={t('votingTerminal.abstain')}
              helptext={t('votingTerminal.abstainHelptext')}
              onClick={() => setSelectedVote(VoteValues.ABSTAIN)}
              type={selectedVote === VoteValues.ABSTAIN ? 'active' : 'default'}
            />
          </CheckboxContainer>

          <VoteContainer>
            <ButtonWrapper>
              <Button
                size="lg"
                variant="primary"
                disabled={!selectedVote}
                onClick={() => {
                  if (selectedVote && onVoteSubmitClicked)
                    onVoteSubmitClicked(selectedVote);
                }}
              >
                {t('votingTerminal.submit')}
              </Button>
              <Button variant="tertiary" size="lg" onClick={onCancelClicked}>
                {t('votingTerminal.cancel')}
              </Button>
            </ButtonWrapper>
          </VoteContainer>
        </VotingContainer>
      ) : (
        status && (
          <>
            <VoteContainer>
              {isMultisigProposal ? (
                <div className="flex w-full flex-col gap-y-4">
                  <div className="flex w-full flex-col gap-x-4 gap-y-3 xl:flex-row">
                    {executableWithNextApproval && !voted && (
                      <Button
                        size="lg"
                        variant="primary"
                        onClick={() => onApprovalClicked?.(true)}
                        className="w-full md:w-max"
                        disabled={voteNowDisabled}
                      >
                        {t('transactionModal.multisig.ctaApproveExecute')}
                      </Button>
                    )}
                    <Button
                      size="lg"
                      onClick={() => onApprovalClicked?.(false)}
                      className="w-full md:w-max"
                      disabled={voteNowDisabled}
                      {...(executableWithNextApproval && !voted
                        ? {variant: 'secondary'}
                        : {variant: 'primary'})}
                    >
                      {voteButtonLabel ?? ''}
                    </Button>
                  </div>
                  {executableWithNextApproval && (
                    <AlertInline
                      message={
                        approvals.length < minApproval
                          ? t('votingTerminal.approveAndExecute.infoAlert')
                          : t(
                              'votingTerminal.approveAndExecute.infoAlertApproved'
                            )
                      }
                      variant="info"
                    />
                  )}
                </div>
              ) : (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={onVoteClicked}
                  className="w-full md:w-max"
                  disabled={voteNowDisabled}
                >
                  {voteButtonLabel || t('votingTerminal.voteNow')}
                </Button>
              )}
            </VoteContainer>

            {alertMessage && (
              <div className="pt-4 md:mt-6 md:pt-0">
                <AlertCard message={alertMessage} variant="warning" />
              </div>
            )}
          </>
        )
      )}
    </Container>
  );
};

const Container = styled.div.attrs<{customClasses?: string}>(
  ({
    customClasses = 'md:p-6 py-5 px-4 rounded-xl bg-neutral-0 border border-neutral-100',
  }) => ({
    className: customClasses,
  })
)<{customClasses?: string}>``;

const Header = styled.div.attrs({
  className: 'md:flex md:flex-row md:space-x-6 space-y-4 md:space-y-0',
})``;

const Heading1 = styled.h1.attrs({
  className: 'ft-text-xl font-semibold text-neutral-800 grow',
})``;

const VotingContainer = styled.div.attrs({
  className: 'mt-12 md:mt-10',
})``;

const Heading2 = styled.h2.attrs({
  className: 'ft-text-xl font-semibold text-neutral-800',
})``;

const CheckboxContainer = styled.div.attrs({
  className: 'mt-6 space-y-3',
})``;

const VoteContainer = styled.div.attrs({
  className:
    'flex flex-col md:flex-row md:justify-between md:space-x-6 items-center md:items-center mt-6 space-y-4 md:space-y-0' as string,
})``;

const ButtonWrapper = styled.div.attrs({
  className:
    'flex flex-col md:flex-row space-y-4 space-x-0 md:space-y-0 md:space-x-4 w-full md:w-max',
})``;

const VotersTabContainer = styled.div.attrs({
  className: 'mt-6 xl:mt-10 space-y-4',
})``;
