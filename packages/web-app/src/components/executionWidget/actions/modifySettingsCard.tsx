import {VotingMode} from '@aragon/sdk-client';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {ActionCardDlContainer, Dd, Dl, Dt} from 'components/descriptionList';
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

  const minProposalThreshold = inputs.minProposerVotingPower
    ? t('labels.review.tokenHoldersWithTkns', {
        tokenAmount: inputs.minProposerVotingPower,
        tokenSymbol: inputs.token?.symbol,
      })
    : t('createDAO.step3.eligibility.anyWallet.title');

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.updateGovernanceAction')}
      smartContractName={t('labels.aragonOSx')}
      methodDescription={t('labels.updateGovernanceActionDescription')}
      verified
    >
      <ActionCardDlContainer>
        <Dl>
          <Dt>{t('labels.supportThreshold')}</Dt>
          <Dd>&gt;{Math.round(inputs.supportThreshold * 100)}%</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumParticipation')}</Dt>
          <Dd>{minParticipation}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.review.proposalThreshold')}</Dt>
          <Dd>{minProposalThreshold}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumDuration')}</Dt>
          <Dd>
            <div className="space-x-1.5">
              <span>{t('createDAO.review.days', {days})}</span>
              <span>{t('createDAO.review.hours', {hours})}</span>
              <span>{t('createDAO.review.minutes', {minutes})}</span>
            </div>
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.earlyExecution')}</Dt>
          <Dd>
            {inputs.votingMode === VotingMode.EARLY_EXECUTION
              ? t('labels.yes')
              : t('labels.no')}
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.voteReplacement')}</Dt>
          <Dd>
            {inputs.votingMode === VotingMode.VOTE_REPLACEMENT
              ? t('labels.yes')
              : t('labels.no')}
          </Dd>
        </Dl>
      </ActionCardDlContainer>
    </AccordionMethod>
  );
};
