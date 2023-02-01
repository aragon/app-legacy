import {AlertCard, CheckboxListItem, Label} from '@aragon/ui-components';
import React from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {VotingSettings} from '@aragon/sdk-client';
import DateTimeSelector from 'containers/dateTimeSelector';
import {useDateTimeSelectorValidation} from 'containers/dateTimeSelector/useDateTimeSelector';
import Duration, {DurationLabel} from 'containers/duration';
import UtcMenu from 'containers/utcMenu';
import {MAX_DURATION_DAYS, MINS_IN_DAY} from 'utils/constants';
import {
  daysToMills,
  getDHMFromSeconds,
  hoursToMills,
  minutesToMills,
} from 'utils/date';
import {DateTimeErrors} from './dateTimeErrors';
import {ToggleCheckList} from './multisig';

type Props = {
  pluginSettings: VotingSettings;
};

const MAX_DURATION_MILLS = MAX_DURATION_DAYS * MINS_IN_DAY * 60 * 1000;

const SetupTokenVotingForm: React.FC<Props> = ({pluginSettings}) => {
  const {t} = useTranslation();

  const {control, formState} = useFormContext();
  const [startUtc, endUtc, endTimeWarning] = useWatch({
    control,
    name: ['startUtc', 'endUtc', 'endTimeWarning'],
  });

  const startItems = [
    {label: t('labels.now'), selectValue: 'now'},
    {
      label: t('labels.dateTime'),
      selectValue: 'date',
    },
  ];

  const endItems = [
    {
      label: t('labels.duration'),
      selectValue: 'duration',
    },
    {
      label: t('labels.dateTime'),
      selectValue: 'date',
    },
  ];

  const {days, hours, minutes} = getDHMFromSeconds(pluginSettings.minDuration);

  const durationAlerts = {
    minDuration: t('alert.tokenVoting.proposalMinDuration', {
      days,
      hours,
      minutes,
    }),
    maxDuration: t('alert.tokenVoting.proposalMaxDuration', {days}),
    acceptableDuration: t('alert.tokenVoting.acceptableProposalDuration', {
      days,
      hours,
      minutes,
    }),
  };

  const minDurationMills =
    daysToMills(days || 0) +
    hoursToMills(hours || 0) +
    minutesToMills(minutes || 0);

  const {
    dateTimeValidator,
    tzSelector,
    handleUtcClicked,
    handleStartToggle,
    handleEndToggle,
    getDuration,
  } = useDateTimeSelectorValidation(
    minDurationMills,
    t('alert.tokenVoting.dateTimeMinDuration', {
      days,
      hours,
      minutes,
    })
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      {/* Voting Type Selection */}
      <FormSection>
        <Label label={t('newWithdraw.setupVoting.optionLabel.title')} />
        <CheckboxListItem
          label={t('newWithdraw.setupVoting.yesNoLabel.title')}
          type="active"
          helptext={t('newWithdraw.setupVoting.yesNoLabel.helpText')}
          multiSelect={false}
        />
        <AlertCard
          mode="info"
          title={t('infos.newVotingTypes')}
          helpText={t('infos.newTypesHelpText')}
        />
      </FormSection>

      {/* Start time */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.multisig.startLabel')}
          helpText={t('newWithdraw.setupVoting.multisig.startDescription')}
        />
        <Controller
          name="startSwitch"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="now"
          render={({field: {onChange, value}}) => (
            <>
              <ToggleCheckList
                items={startItems}
                value={value}
                onChange={changeValue =>
                  handleStartToggle(changeValue, onChange)
                }
              />
              {value === 'date' && (
                <>
                  <DateTimeSelector
                    mode="start"
                    value={startUtc}
                    defaultDateOffset={{minutes: 10}}
                    validator={dateTimeValidator}
                    onUtcClicked={() => handleUtcClicked('first')}
                  />
                  <DateTimeErrors mode="start" />
                </>
              )}
            </>
          )}
        />
      </FormSection>

      {/* End time */}
      <FormSection>
        <Label
          label={t('labels.endDate')}
          helpText={t('newWithdraw.setupVoting.tokenVoting.endDateDescription')}
        />
        <Controller
          name="expirationDuration"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="duration"
          render={({field: {onChange, value}}) => (
            <>
              <ToggleCheckList
                value={value}
                items={endItems}
                onChange={changeValue => handleEndToggle(changeValue, onChange)}
              />
              {value === 'duration' ? (
                <Duration
                  defaultValues={{days, hours, minutes}}
                  minDuration={{days, hours, minutes}}
                />
              ) : (
                <>
                  <DateTimeSelector
                    mode="end"
                    value={endUtc}
                    validator={dateTimeValidator}
                    defaultDateOffset={{days, hours, minutes}}
                    onUtcClicked={() => handleUtcClicked('second')}
                  />
                  <DateTimeErrors mode="end" />
                </>
              )}

              {!endTimeWarning && !formState?.errors?.endDate && (
                <DurationLabel
                  maxDuration={getDuration() === MAX_DURATION_MILLS}
                  minDuration={getDuration() === minDurationMills}
                  limitOnMax
                  alerts={durationAlerts}
                />
              )}
            </>
          )}
        />
      </FormSection>
      <UtcMenu onTimezoneSelect={tzSelector} />
    </>
  );
};

export default SetupTokenVotingForm;

const FormSection = styled.div.attrs({
  className: 'space-y-1.5',
})``;
