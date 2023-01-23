import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {VotingMode} from '@aragon/sdk-client';
import {AccordionMethod} from 'components/accordionMethod';
import {getDHMFromSeconds} from 'utils/date';
import {getErc20MinParticipation} from 'utils/proposals';
import {ActionUpdatePluginSettings} from 'utils/types';

export const ModifySettingsCard: React.FC<{
  action: ActionUpdatePluginSettings;
}> = ({action: {inputs}}) => {
  const {t} = useTranslation();
  const {days, hours, minutes} = getDHMFromSeconds(inputs.minDuration);

  const minParticipation = useMemo(
    () => `≥ ${Math.round(inputs.minParticipation * 100)}% (≥
            ${getErc20MinParticipation(
              inputs.minParticipation,
              inputs.totalVotingWeight,
              inputs.token?.decimals || 18
            )} 
            ${inputs.token?.symbol})`,
    [
      inputs.minParticipation,
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
            {inputs.votingMode === VotingMode.EARLY_EXECUTION
              ? t('labels.yes')
              : t('labels.no')}
          </Value>
        </div>
        <div>
          <Title>{t('labels.voteReplacement')}</Title>
          <Value>
            {inputs.votingMode === VotingMode.VOTE_REPLACEMENT
              ? t('labels.yes')
              : t('labels.no')}
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
