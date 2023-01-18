import {ProposalStatus, VoteValues} from '@aragon/sdk-client';
import {
  AlertCard,
  AlertInline,
  ButtonGroup,
  ButtonText,
  CheckboxListItem,
  IconClock,
  IconInfo,
  IconRadioCancel,
  LinearProgress,
  Option,
  SearchInput,
  VotersTable,
  VoterType,
} from '@aragon/ui-components';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';

export type ProposalVoteResults = {
  yes: {value: string | number; percentage: number};
  no: {value: string | number; percentage: number};
  abstain: {value: string | number; percentage: number};
};

export type TerminalTabs = 'voters' | 'breakdown' | 'info';

// TODO: clean up props: some shouldn't be optional
export type VotingTerminalProps = {
  breakdownTabDisabled?: boolean;
  votersTabDisabled?: boolean;
  voteNowDisabled?: boolean;
  startDate?: string;
  endDate?: string;
  participation?: string;
  supportThreshold?: number;
  voters?: Array<VoterType>;
  status?: ProposalStatus;
  statusLabel: string;
  strategy?: string;
  token?: {
    symbol: string;
    name: string;
  };
  results?: ProposalVoteResults;
  votingInProcess?: boolean;
  onVoteClicked?: React.MouseEventHandler<HTMLButtonElement>;
  onVoteSubmitClicked?: (vote: VoteValues) => void;
  onCancelClicked?: React.MouseEventHandler<HTMLButtonElement>;
  voteButtonLabel?: string;
  alertMessage?: string;
  selectedTab?: TerminalTabs;
  onTabSelected?: React.Dispatch<React.SetStateAction<TerminalTabs>>;
};

export const VotingTerminal: React.FC<VotingTerminalProps> = ({
  breakdownTabDisabled = false,
  votersTabDisabled = false,
  voteNowDisabled = false,
  participation,
  supportThreshold,
  voters = [],
  results,
  token,
  startDate,
  endDate,
  status,
  statusLabel,
  strategy,
  onVoteClicked,
  votingInProcess,
  onCancelClicked,
  onVoteSubmitClicked,
  voteButtonLabel,
  alertMessage,
  selectedTab = 'info',
  onTabSelected,
}) => {
  const [query, setQuery] = useState('');
  const [selectedVote, setSelectedVote] = useState<VoteValues>();
  const {t} = useTranslation();

  const displayedVoters = useMemo(() => {
    return query === ''
      ? voters
      : voters.filter(voter => voter.wallet.includes(query));
  }, [query, voters]);

  return (
    <Container>
      <Header>
        <Heading1>{t('votingTerminal.title')}</Heading1>
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
          />
          <Option
            value="voters"
            label={t('votingTerminal.voters')}
            disabled={votersTabDisabled}
          />
          <Option value="info" label={t('votingTerminal.info')} />
        </ButtonGroup>
      </Header>

      {selectedTab === 'breakdown' ? (
        <VStackRelaxed>
          <VStackNormal>
            <HStack>
              <VoteOption>{t('votingTerminal.yes')}</VoteOption>
              <TokenValue>{`${results?.yes.value} ${
                token ? token.symbol : t('labels.members')
              }`}</TokenValue>
              <VotePercentage>{results?.yes.percentage}%</VotePercentage>
            </HStack>
            <LinearProgress max={100} value={results?.yes.percentage} />
          </VStackNormal>

          <VStackNormal>
            <HStack>
              <VoteOption>{t('votingTerminal.no')}</VoteOption>
              <TokenValue>{`${results?.no.value} ${
                token ? token.symbol : t('labels.members')
              }`}</TokenValue>
              <VotePercentage>{results?.no.percentage}%</VotePercentage>
            </HStack>
            <LinearProgress max={100} value={results?.no.percentage} />
          </VStackNormal>

          <VStackNormal>
            <HStack>
              <VoteOption>{t('votingTerminal.abstain')}</VoteOption>
              <TokenValue>{`${results?.abstain.value} ${
                token ? token.symbol : t('labels.members')
              }`}</TokenValue>
              <VotePercentage>{results?.abstain.percentage}%</VotePercentage>
            </HStack>
            <LinearProgress max={100} value={results?.abstain.percentage} />
          </VStackNormal>
        </VStackRelaxed>
      ) : selectedTab === 'voters' ? (
        <div className="space-y-2">
          <SearchInput
            placeholder={t('votingTerminal.inputPlaceholder')}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.currentTarget.value)
            }
          />
          {displayedVoters.length !== 0 ? (
            <VotersTable
              voters={displayedVoters}
              showOption
              showVotingPower
              showAmount={token !== undefined}
              onLoadMore={() => console.log('load more clicked')}
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
        </div>
      ) : (
        <>
          <VStackSection>
            <SectionHeader>{t('votingTerminal.decision')}</SectionHeader>
            <InfoLine>
              <p>{t('votingTerminal.options')}</p>
              <Strong>{t('votingTerminal.yes+no')}</Strong>
            </InfoLine>
            <InfoLine>
              <p>{t('votingTerminal.voteType')}</p>
              <Strong>{strategy}</Strong>
            </InfoLine>
            <InfoLine>
              <p>{t('votingTerminal.supportThreshold')}</p>
              <Strong>&gt;{supportThreshold}%</Strong>
            </InfoLine>
          </VStackSection>

          <VStackSection>
            <SectionHeader>{t('votingTerminal.duration')}</SectionHeader>
            <InfoLine>
              <p>{t('votingTerminal.startDate')}</p>
              <Strong>{startDate?.toString()}</Strong>
            </InfoLine>
            <InfoLine>
              <p>{t('votingTerminal.endDate') as string}</p>
              <Strong>{endDate}</Strong>
            </InfoLine>
          </VStackSection>

          <VStackSection
            className={
              status ? '' : 'pb-0 tablet:pb-0 border-b-0 tablet:border-b-0 '
            }
          >
            <SectionHeader>{t('votingTerminal.activity')}</SectionHeader>
            <InfoLine>
              <p>{t('votingTerminal.participation')}</p>
              <Strong>{participation}</Strong>
            </InfoLine>
            <InfoLine>
              <p>{t('votingTerminal.uniqueVoters')}</p>
              <Strong>{voters.length}</Strong>
            </InfoLine>
          </VStackSection>
        </>
      )}

      {votingInProcess ? (
        <VotingContainer>
          <Heading2>{t('votingTerminal.chooseOption')}</Heading2>
          <p className="mt-1 text-ui-500">
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
                mode="ghost"
                size="large"
                onClick={onCancelClicked}
              />
            </ButtonWrapper>
            <AlertInline label={statusLabel} mode="neutral" />
          </VoteContainer>
        </VotingContainer>
      ) : (
        status && (
          <>
            <VoteContainer>
              <ButtonText
                label={voteButtonLabel || t('votingTerminal.voteNow')}
                size="large"
                onClick={onVoteClicked}
                className="w-full tablet:w-max"
                disabled={voteNowDisabled}
              />
              <AlertInline
                label={statusLabel}
                mode={status === 'Defeated' ? 'critical' : 'neutral'}
                icon={<StatusIcon status={status} />}
              />
            </VoteContainer>

            {alertMessage && (
              <div className="pt-2 tablet:pt-0 tablet:mt-3">
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
  className: 'tablet:p-3 py-2.5 px-2 rounded-xl bg-ui-0 border border-ui-100',
})``;

const Header = styled.div.attrs({
  className:
    'tablet:flex tablet:justify-between pb-1 tablet:items-center space-y-2 tablet:space-y-0',
})``;

const Heading1 = styled.h1.attrs({
  className: 'ft-text-xl font-bold text-ui-800 flex-grow',
})``;

const VStackRelaxed = styled.div.attrs({
  className: 'space-y-3',
})``;

const VStackNormal = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const VStackSection = styled.div.attrs({
  className:
    'space-y-1.5 p-2 tablet:p-3 -mx-2 tablet:-mx-3 border-b border-ui-100' as string,
})``;

const HStack = styled.div.attrs({
  className: 'flex space-x-1.5',
})``;

const InfoLine = styled.div.attrs({
  className: 'flex justify-between text-ui-600',
})``;

const Strong = styled.p.attrs({
  className: 'font-bold text-ui-800',
})``;

const SectionHeader = styled.p.attrs({
  className: 'font-bold text-ui-800 ft-text-lg',
})``;

const VotingContainer = styled.div.attrs({
  className: 'mt-6 tablet:mt-5',
})``;

const Heading2 = styled.h2.attrs({
  className: 'ft-text-xl font-bold text-ui-800',
})``;

const CheckboxContainer = styled.div.attrs({
  className: 'mt-3 space-y-1.5',
})``;

const VoteContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row tablet:space-x-3 items-center tablet:items-center mt-3 space-y-2 tablet:space-y-0' as string,
})``;

const ButtonWrapper = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-2 space-x-0 tablet:space-y-0 tablet:space-x-2 w-full tablet:w-max',
})``;

const VotePercentage = styled.p.attrs({
  className: 'w-8 font-bold text-right text-primary-500',
})``;

const TokenValue = styled.p.attrs({
  className: 'flex-1 text-right text-ui-600',
})``;

const VoteOption = styled.p.attrs({className: 'font-bold text-primary-500'})``;
