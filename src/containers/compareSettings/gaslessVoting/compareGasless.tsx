import {Views} from '../index';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {generatePath, useNavigate} from 'react-router-dom';
import {EditSettings} from '../../../utils/paths';
import {DescriptionListContainer} from '../../../components/descriptionList';
import {useTranslation} from 'react-i18next';
import {useNetwork} from '../../../context/network';
import {
  ReviewExecutionMultisig,
  ReviewExecutionMultisigProps,
} from '../../goLive/committee';
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';
import {getDHMFromSeconds} from '../../../utils/date';

type CompareGaslessProps = {
  daoSettings?: GaslessPluginVotingSettings;
  daoAddressOrEns: string;
  view: Views;
};
export const CompareGasless: React.FC<CompareGaslessProps> = ({
  view,
  daoSettings,
  daoAddressOrEns,
}) => {
  const {getValues} = useFormContext();
  const navigate = useNavigate();
  const {network} = useNetwork();

  const {t} = useTranslation();

  const {
    committee,
    committeeMinimumApproval,
    executionExpirationMinutes,
    executionExpirationHours,
    executionExpirationDays,
  } = getValues();

  let displayedInfo: ReviewExecutionMultisigProps;
  if (view === 'new') {
    displayedInfo = {
      committee,
      committeeMinimumApproval,
      executionExpirationMinutes,
      executionExpirationHours,
      executionExpirationDays,
    };
  } else {
    const {days, hours, minutes} = getDHMFromSeconds(
      daoSettings!.minTallyDuration
    );
    displayedInfo = {
      committee: daoSettings?.executionMultisigMembers || [],
      committeeMinimumApproval: daoSettings?.minTallyApprovals || 0,
      executionExpirationMinutes: minutes!,
      executionExpirationHours: hours!,
      executionExpirationDays: days!,
    };
  }
  return (
    <DescriptionListContainer
      title={t('label.executionMultisig')}
      onEditClick={() =>
        navigate(generatePath(EditSettings, {network, dao: daoAddressOrEns}))
      }
      editLabel={t('settings.edit')}
    >
      <ReviewExecutionMultisig {...displayedInfo} />
    </DescriptionListContainer>
  );
};
