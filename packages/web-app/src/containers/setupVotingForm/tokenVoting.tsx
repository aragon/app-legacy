import {AlertCard, CheckboxListItem, Label} from '@aragon/ui-components';
import React, {useCallback, useMemo, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {VotingSettings} from '@aragon/sdk-client';
import DateTimeSelector from 'containers/dateTimeSelector';
import Duration, {DurationLabel} from 'containers/duration';
import UtcMenu from 'containers/utcMenu';
import {timezones} from 'containers/utcMenu/utcData';
import {useGlobalModalContext} from 'context/globalModals';
import {MAX_DURATION_DAYS, MINS_IN_DAY} from 'utils/constants';
import {
  daysToMills,
  getDHMFromSeconds,
  getFormattedUtcOffset,
  hoursToMills,
  minutesToMills,
} from 'utils/date';
import {DateTimeErrors} from './dateTimeErrors';
import {ToggleCheckList, UtcInstance} from './multisig';

type Props = {
  pluginSettings: VotingSettings;
};

const MAX_DURATION_MILLS = MAX_DURATION_DAYS * MINS_IN_DAY * 60 * 1000;

const SetupTokenVotingForm: React.FC<Props> = ({pluginSettings}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();

  const [utcInstance, setUtcInstance] = useState<UtcInstance>('first');
  const {control, formState, getValues, resetField, setValue, trigger} =
    useFormContext();

  const [endTimeWarning, startSwitch, durationSwitch] = useWatch({
    control,
    name: ['endTimeWarning', 'startSwitch', 'durationSwitch'],
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

  const currTimezone = useMemo(
    () => timezones.find(tz => tz === getFormattedUtcOffset()) || timezones[13],
    []
  );

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

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  // sets the UTC values for the start and end date/time
  const tzSelector = (tz: string) => {
    if (utcInstance === 'first') setValue('startUtc', tz);
    else setValue('endUtc', tz);

    trigger('startDate');
  };

  // clears duration fields for end date
  const resetDuration = useCallback(() => {
    resetField('durationDays');
    resetField('durationHours');
    resetField('durationMinutes');
    resetField('endTimeWarning');
  }, [resetField]);

  // clears specific date time fields for start date
  const resetStartDate = useCallback(() => {
    resetField('startDate');
    resetField('startTime');
    resetField('startUtc');
    resetField('startTimeWarning');
  }, [resetField]);

  // clears specific date time fields for end date
  const resetEndDate = useCallback(() => {
    resetField('endDate');
    resetField('endTime');
    resetField('endUtc');
    resetField('endTimeWarning');
  }, [resetField]);

  // handles the toggling between start time options
  const handleStartToggle = useCallback(
    (changeValue, onChange: (value: string) => void) => {
      onChange(changeValue);
      if (changeValue === 'now') resetStartDate();
      else setValue('startUtc', currTimezone);
    },
    [currTimezone, resetStartDate, setValue]
  );

  // handles the toggling between end time options
  const handleEndToggle = useCallback(
    (changeValue, onChange: (value: string) => void) => {
      onChange(changeValue);

      if (changeValue === 'duration') resetEndDate();
      else {
        resetDuration();
        setValue('endUtc', currTimezone);
      }
    },
    [currTimezone, resetDuration, resetEndDate, setValue]
  );

  // get the current proposal duration set by the user
  const getDuration = useCallback(() => {
    if (getValues('expirationDuration') === 'duration') {
      const [days, hours, mins] = getValues([
        'durationDays',
        'durationHours',
        'durationMinutes',
      ]);

      return daysToMills(days) + hoursToMills(hours) + minutesToMills(mins);
    } else {
      return Number(getValues('durationMills')) || 0;
    }
  }, [getValues]);

  // handles opening the utc menu and setting the correct instance
  const handleUtcClicked = useCallback(
    (instance: UtcInstance) => {
      setUtcInstance(instance);
      open('utc');
    },
    [open]
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
            <ToggleCheckList
              items={startItems}
              value={value}
              onChange={changeValue => handleStartToggle(changeValue, onChange)}
            />
          )}
        />
        {startSwitch === 'date' && (
          <>
            <DateTimeSelector
              mode="start"
              defaultDateOffset={{minutes: 10}}
              minDurationMills={minDurationMills}
              onUtcClicked={() => handleUtcClicked('first')}
              minDurationAlert={t('alert.tokenVoting.dateTimeMinDuration', {
                days,
                hours,
                minutes,
              })}
            />
            <DateTimeErrors mode="start" />
          </>
        )}
      </FormSection>

      {/* End time */}
      <FormSection>
        <Label
          label={t('labels.endDate')}
          helpText={t('newWithdraw.setupVoting.tokenVoting.endDateDescription')}
        />
        <Controller
          name="durationSwitch"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="duration"
          render={({field: {onChange, value}}) => (
            <ToggleCheckList
              value={value}
              items={endItems}
              onChange={changeValue => handleEndToggle(changeValue, onChange)}
            />
          )}
        />
        {durationSwitch === 'duration' ? (
          <Duration
            defaultValues={{days, hours, minutes}}
            minDuration={{days, hours, minutes}}
          />
        ) : (
          <>
            <DateTimeSelector
              mode="end"
              onUtcClicked={() => handleUtcClicked('second')}
              minDurationMills={minDurationMills}
              minDurationAlert={t('alert.tokenVoting.dateTimeMinDuration', {
                days,
                hours,
                minutes,
              })}
              defaultDateOffset={{
                days,
                hours,
                minutes: minutes || 0 + 10,
              }}
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
      </FormSection>
      <UtcMenu onTimezoneSelect={tzSelector} />
    </>
  );
};

export default SetupTokenVotingForm;

const FormSection = styled.div.attrs({
  className: 'space-y-1.5',
})``;
