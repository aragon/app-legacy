import {LinearProgress, VoterType} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {abbreviateTokenAmount} from 'utils/tokens';
import {StrictlyExclude} from 'utils/types';
import {ProposalVoteResults} from '.';

export type MultisigBreakdown = {approvals: string[]; percentage: number};
export type TokenVotingBreakdown = {
  token: {
    symbol: string;
    name: string;
  };
  results: ProposalVoteResults;
};

type BreakdownProps = {
  multisig?: MultisigBreakdown;
  tokenVoting?: TokenVotingBreakdown;
};

const BreakdownTab: React.FC<BreakdownProps> = ({multisig, tokenVoting}) => {
  const {t} = useTranslation();

  if (multisig) {
    return (
      <VStackRelaxed>
        <ResultRow
          option="approved"
          percentage={multisig.percentage}
          value={`${multisig?.approvals.length} ${t('labels.members')}`}
        />
      </VStackRelaxed>
    );
  }

  if (tokenVoting) {
    const {results, token} = tokenVoting;
    return (
      <VStackRelaxed>
        {Object.entries(results).map(([key, result]) => (
          <ResultRow
            key={key}
            option={key as ResultKey}
            percentage={result.percentage}
            value={`${abbreviateTokenAmount(result.value.toString())} ${
              token.symbol
            }`}
          />
        ))}
      </VStackRelaxed>
    );
  }

  return null;
};

export default BreakdownTab;

// Proposal result row
type ResultKey = StrictlyExclude<VoterType['option'], 'none'>;

const ResultRow: React.FC<{
  option: ResultKey;
  value: string | number;
  percentage: string | number;
}> = ({option, value, percentage}) => {
  const {t} = useTranslation();

  const options: {[k in ResultKey]: string} = {
    yes: t('votingTerminal.yes'),
    no: t('votingTerminal.no'),
    abstain: t('votingTerminal.abstain'),
    approved: t('votingTerminal.approvedBy'),
  };

  return (
    <VStackNormal>
      <HStack>
        <VoteOption>{options[option]}</VoteOption>
        <ResultValue>{value}</ResultValue>
        <VotePercentage>{percentage}%</VotePercentage>
      </HStack>
      <LinearProgress max={100} value={percentage} />
    </VStackNormal>
  );
};

const VotePercentage = styled.p.attrs({
  className: 'w-8 font-bold text-right text-primary-500',
})``;

const ResultValue = styled.p.attrs({
  className: 'flex-1 text-right text-ui-600',
})``;

const VoteOption = styled.p.attrs({className: 'font-bold text-primary-500'})``;

const VStackRelaxed = styled.div.attrs({
  className: 'space-y-3 mt-3 mt-5',
})``;

const VStackNormal = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const HStack = styled.div.attrs({
  className: 'flex space-x-1.5',
})``;
