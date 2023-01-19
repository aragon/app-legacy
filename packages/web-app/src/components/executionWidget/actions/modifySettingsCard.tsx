import Big from 'big.js';
import {formatUnits} from 'ethers/lib/utils';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {VotingMode} from '@aragon/sdk-client';
import {AccordionMethod} from 'components/accordionMethod';
import {getDHMFromSeconds} from 'utils/date';
import {abbreviateTokenAmount} from 'utils/tokens';
import {ActionUpdatePluginSettings} from 'utils/types';

export const ModifySettingsCard: React.FC<{
  action: ActionUpdatePluginSettings;
}> = ({action: {inputs}}) => {
  const {t} = useTranslation();
  const {days, hours, minutes} = getDHMFromSeconds(inputs.minDuration);

  const minParticipation = useMemo(
    () => `≥ ${Math.round(inputs.minParticipation * 100)}% (≥
            ${abbreviateTokenAmount(
              parseFloat(
                Big(
                  formatUnits(inputs.totalVotingWeight, inputs.token?.decimals)
                )
                  .mul(inputs.supportThreshold)
                  .toFixed(2)
              ).toString()
            )} 
            ${inputs.token?.symbol})`,
    [
      inputs.minParticipation,
      inputs.supportThreshold,
      inputs.token?.decimals,
      inputs.token?.symbol,
      inputs.totalVotingWeight,
    ]
  );

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.updateGovernanceAction')}
      smartContractName={t('labels.aragonCore')}
      methodDescription={t('labels.updateGovernanceActionDescription')}
      verified
    >
      <Container>
        <div>
          <Title>{t('labels.supportThreshold')}</Title>
          <Value>&gt;{Math.round(inputs.supportThreshold * 100)}%</Value>
        </div>
        <div>
          <Title>{t('labels.minimumParticipation')}</Title>
          <Value>{minParticipation}</Value>
        </div>
        <div>
          <Title>{t('labels.minimumDuration')}</Title>
          <Value className="space-x-1.5">
            <span>{t('createDAO.review.days', {days})}</span>
            <span>{t('createDAO.review.hours', {hours})}</span>
            <span>{t('createDAO.review.minutes', {minutes})}</span>
          </Value>
        </div>
        <div>
          <Title>{t('labels.earlyExecution')}</Title>
          <Value>
            {inputs.votingMode === VotingMode.EARLY_EXECUTION ? 'Yes' : 'No'}
          </Value>
        </div>
        <div>
          <Title>{t('labels.voteReplacement')}</Title>
          <Value>
            {inputs.votingMode === VotingMode.VOTE_REPLACEMENT ? 'Yes' : 'No'}
          </Value>
        </div>
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 rounded-b-xl border border-t-0 border-ui-100 space-y-3 p-3',
})``;

const Title = styled.p.attrs({
  className: 'font-bold text-ui-800 mb-1',
})``;

const Value = styled.span.attrs({
  className: 'text-ui-600' as string,
})``;
