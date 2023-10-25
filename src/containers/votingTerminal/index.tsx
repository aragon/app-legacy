import {
  AlertCard,
  AlertInline,
  ButtonGroup,
  ButtonText,
  CheckboxListItem,
  IconClock,
  IconInfo,
  IconRadioCancel,
  Option,
  SearchInput,
  VoterType,
  VotersTable,
} from '@aragon/ods-old';
import {
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
  VoteValues,
} from '@aragon/sdk-client';
import {ProposalStatus} from '@aragon/sdk-client-common';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {formatUnits} from 'ethers/lib/utils';
import {usePastVotingPowerAsync} from 'services/aragon-sdk/queries/use-past-voting-power';
import {CHAIN_METADATA} from 'utils/constants';
import {Web3Address, shortenAddress} from 'utils/library';
import BreakdownTab from './breakdownTab';
import InfoTab from './infoTab';

export type ProposalVoteResults = {
  yes: {value: string | number; percentage: number};
  no: {value: string | number; percentage: number};
  abstain: {value: string | number; percentage: number};
};

export type TerminalTabs = 'voters' | 'breakdown' | 'info';

export type VotingTerminalProps = {
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
  statusLabel: string;
  strategy?: string;
  daoToken?: Erc20TokenDetails | Erc20WrapperTokenDetails;
  blockNumber?: Number;
  results?: ProposalVoteResults;
  approvals?: string[];
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
  executableWithNextApproval?: boolean;
};

export const VotingTerminal: React.FC<VotingTerminalProps> = ({
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
  executableWithNextApproval = false,
}) => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [selectedVote, setSelectedVote] = useState<VoteValues>();
  const [displayedVoters, setDisplayedVoters] = useState<Array<VoterType>>([]);
  const {api: provider} = useProviders();
  const {t} = useTranslation();
  const {network} = useNetwork();
  const fetchPastVotingPower = usePastVotingPowerAsync();

  const isMultisigProposal = !!approvals && !!minApproval;

  useEffect(() => {
    // fetch avatar fpr each voter
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
    <Container>
      <Header className="items-start gap-x-6">
        <div className="flex-1 space-y-3">
          <Heading1>
            {isMultisigProposal
              ? t('votingTerminal.multisig.title')
              : t('votingTerminal.title')}
          </Heading1>
          <AlertInline
            label={statusLabel}
            mode={status === 'Defeated' ? 'critical' : 'neutral'}
            icon={<StatusIcon status={status} />}
          />
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
          memberCount={voters.length}
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
              explorerURL={CHAIN_METADATA[network].explorer}
            />
          ) : (
            <StateEmpty
              type="Object"
              mode="inline"
              object="magnifying_glass"
              title={t(
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
              <ButtonText
                label={t('votingTerminal.submit')}
                size="large"
                disabled={!selectedVote}
                onClick={() => {
                  if (selectedVote && onVoteSubmitClicked)
                    onVoteSubmitClicked(selectedVote);
                }}
              />
              <ButtonText
                label={t('votingTerminal.cancel')}
                mode="secondary"
                size="large"
                bgWhite
                onClick={onCancelClicked}
              />
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
                    {executableWithNextApproval && (
                      <ButtonText
                        label={t('transactionModal.multisig.ctaApproveExecute')}
                        size="large"
                        onClick={() => onApprovalClicked?.(true)}
                        className="w-full md:w-max"
                        disabled={voteNowDisabled}
                      />
                    )}
                    <ButtonText
                      label={voteButtonLabel ?? ''}
                      size="large"
                      onClick={() => onApprovalClicked?.(false)}
                      className="w-full md:w-max"
                      disabled={voteNowDisabled}
                      {...(executableWithNextApproval
                        ? {mode: 'secondary', bgWhite: true}
                        : {mode: 'primary'})}
                    />
                  </div>
                  {executableWithNextApproval && (
                    <AlertInline
                      label={t('votingTerminal.approveAndExecute.infoAlert')}
                      mode={'neutral'}
                    />
                  )}
                </div>
              ) : (
                <ButtonText
                  label={voteButtonLabel || t('votingTerminal.voteNow')}
                  size="large"
                  onClick={onVoteClicked}
                  className="w-full md:w-max"
                  disabled={voteNowDisabled}
                />
              )}
            </VoteContainer>

            {alertMessage && (
              <div className="pt-4 md:mt-6 md:pt-0">
                <AlertCard title={alertMessage} mode="warning" />
              </div>
            )}
          </>
        )
      )}
    </Container>
  );
};

type StatusProp = {
  status?: ProposalStatus;
};

const StatusIcon: React.FC<StatusProp> = ({status}) => {
  if (status === 'Pending' || status === 'Active') {
    return <IconClock className="text-info-500" />;
  } else if (status === 'Defeated') {
    return <IconRadioCancel className="text-critical-500" />;
  } else {
    return <IconInfo className="text-info-500" />;
  }
};

const Container = styled.div.attrs({
  className:
    'md:p-6 py-5 px-4 rounded-xl bg-neutral-0 border border-neutral-100',
})``;

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
