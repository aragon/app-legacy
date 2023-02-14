import {
  Erc20TokenDetails,
  VotingMode,
  VotingSettings,
} from '@aragon/sdk-client';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useNetwork} from 'context/network';
import {getDHMFromSeconds} from 'utils/date';
import {EditSettings} from 'utils/paths';
import {Views} from '..';

type CompareMvGovernanceProps = {
  daoId: string;
  daoToken?: Erc20TokenDetails;
  daoSettings?: VotingSettings;
  view: Views;
};

export const CompareMvGovernance: React.FC<CompareMvGovernanceProps> = ({
  daoId,
  daoToken,
  daoSettings,
  view,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {getValues} = useFormContext();

  const [
    minimumApproval,
    minimumParticipation,
    tokenTotalSupply,
    durationDays,
    durationHours,
    durationMinutes,
    earlyExecution,
    voteReplacement,
  ] = getValues([
    'minimumApproval',
    'minimumParticipation',
    'tokenTotalSupply',
    'durationDays',
    'durationHours',
    'durationMinutes',
    'earlyExecution',
    'voteReplacement',
  ]);

  let displayedInfo;
  if (view === 'new') {
    displayedInfo = {
      approvalThreshold: `>${minimumApproval}%`,
      minParticipation: `≥${minimumParticipation}% (≥${
        (parseInt(minimumParticipation) * (tokenTotalSupply || 0)) / 100
      } ${daoToken?.symbol})`,
      days: durationDays,
      hours: durationHours,
      minutes: durationMinutes,
      votingMode: {
        earlyExecution: earlyExecution ? t('labels.yes') : t('labels.no'),
        voteReplacement: voteReplacement ? t('labels.yes') : t('labels.no'),
      },
    };
  } else {
    const duration = getDHMFromSeconds(daoSettings?.minDuration || 0);
    displayedInfo = {
      approvalThreshold: `>${Math.round(
        (daoSettings?.supportThreshold || 0) * 100
      )}%`,
      minParticipation: `≥${Math.round(
        (daoSettings?.minParticipation || 0) * 100
      )}% (≥${
        (daoSettings?.minParticipation || 0) * (tokenTotalSupply.formatted || 0)
      } ${daoToken?.symbol})`,
      days: duration.days,
      hours: duration.hours,
      minutes: duration.minutes,
      votingMode: {
        earlyExecution:
          daoSettings?.votingMode === VotingMode.EARLY_EXECUTION
            ? t('labels.yes')
            : t('labels.no'),
        voteReplacement:
          daoSettings?.votingMode === VotingMode.VOTE_REPLACEMENT
            ? t('labels.yes')
            : t('labels.no'),
      },
    };
  }

  return (
    <DescriptionListContainer
      title={t('labels.review.governance')}
      onEditClick={() =>
        navigate(generatePath(EditSettings, {network, dao: daoId}))
      }
      editLabel={t('settings.edit')}
    >
      <Dl>
        <Dt>{t('labels.minimumApprovalThreshold')}</Dt>
        <Dd>{displayedInfo.approvalThreshold}</Dd>
      </Dl>
      <Dl>
        <Dt>{t('labels.minimumParticipation')}</Dt>
        <Dd>{displayedInfo.minParticipation}</Dd>
      </Dl>
      <Dl>
        <Dt>{t('labels.minimumDuration')}</Dt>
        <Dd>
          {t('governance.settings.preview', {
            days: displayedInfo.days,
            hours: displayedInfo.hours,
            minutes: displayedInfo.minutes,
          })}
        </Dd>
      </Dl>
      <Dl>
        <Dt>{t('labels.review.earlyExecution')}</Dt>
        <Dd>{displayedInfo.votingMode.earlyExecution}</Dd>
      </Dl>
      <Dl>
        <Dt>{t('labels.review.voteReplacement')}</Dt>
        <Dd>{displayedInfo.votingMode.voteReplacement}</Dd>
      </Dl>
    </DescriptionListContainer>
  );
};
