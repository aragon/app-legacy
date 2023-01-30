import {AlertInline, CheckboxListItem, Label} from '@aragon/ui-components';
import {toDate} from 'date-fns-tz';
import React, {useCallback, useEffect, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import DateTimeSelector from 'containers/dateTimeSelector';
import Duration from 'containers/duration';
import UtcMenu from 'containers/utcMenu';
import {timezones} from 'containers/utcMenu/utcData';
import {useGlobalModalContext} from 'context/globalModals';
import {
  MULTISIG_MAX_DURATION_DAYS,
  MULTISIG_MIN_DURATION_HOURS,
  MULTISIG_REC_DURATION_DAYS,
} from 'utils/constants';
import {
  daysToMills,
  getCanonicalUtcOffset,
  getFormattedUtcOffset,
  hoursToMills,
} from 'utils/date';
import {FormSection} from '.';
import {DateTimeErrors} from './dateTimeErrors';

type UtcInstance = 'first' | 'second';

const SetupMultisigVotingForm: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();

  const [utcInstance, setUtcInstance] = useState<UtcInstance>('first');
  const [utcStart, setUtcStart] = useState('');
  const [utcEnd, setUtcEnd] = useState('');

  const {control, getValues, clearErrors, resetField, setValue, setError} =
    useFormContext();

  const [durationDays, durationHours, durationMinutes, durationMills] =
    useWatch({
      control,
      name: [
        'durationDays',
        'durationHours',
        'durationMinutes',
        'durationMills',
      ],
    });

  const isMinDuration =
    // duration fields only contain minimum duration
    (durationDays === '0' &&
      durationHours === MULTISIG_MIN_DURATION_HOURS.toString() &&
      durationMinutes === '0') ||
    // dateTime fields add up to minimum duration
    Number(durationMills) / hoursToMills(1) === MULTISIG_MIN_DURATION_HOURS;

  const isMaxDuration =
    Number(durationDays) >= MULTISIG_MAX_DURATION_DAYS ||
    Number(durationMills) / daysToMills(1) >= MULTISIG_MAX_DURATION_DAYS;

  const startItems = [
    {label: t('newWithdraw.setupVoting.multisig.now'), selectValue: 'now'},
    {
      label: t('newWithdraw.setupVoting.multisig.dateTime'),
      selectValue: 'date',
    },
  ];

  const expirationItems = [
    {
      label: t('newWithdraw.setupVoting.multisig.duration'),
      selectValue: 'duration',
    },
    {
      label: t('newWithdraw.setupVoting.multisig.dateTime'),
      selectValue: 'date',
    },
  ];

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  // clears duration fields for end date
  const resetDuration = useCallback(() => {
    resetField('durationDays');
    resetField('durationHours');
    resetField('durationMinutes');
  }, [resetField]);

  // clears specific date time fields for start date
  const resetStartDate = useCallback(() => {
    resetField('startDate');
    resetField('startTime');
    resetField('startUtc');
  }, [resetField]);

  // clears specific date time fields for end date
  const resetEndDate = useCallback(() => {
    resetField('endDate');
    resetField('endTime');
    resetField('endUtc');
  }, [resetField]);

  // sets the UTC values for the start and end date/time
  const tzSelector = (tz: string) => {
    if (utcInstance === 'first') {
      // setUtcStart(tz);
      setValue('startUtc', tz);
    } else {
      // setUtcEnd(tz);
      setValue('endUtc', tz);
    }
  };

  const handleStartNowToggle = useCallback(
    (changeValue, onChange: (value: string) => void) => {
      onChange(changeValue);
      if (changeValue === 'now') resetStartDate();
    },
    [resetStartDate]
  );

  const handleExpirationTimeToggle = useCallback(
    (changeValue, onChange: (value: string) => void) => {
      onChange(changeValue);

      if (changeValue === 'duration') resetEndDate();
      else resetDuration();
    },
    [resetDuration, resetEndDate]
  );

  // Validates all fields (date, time and UTC) for both start and end
  // simultaneously. This is necessary, as all the fields are related to one
  // another. The validation gathers information from all start and end fields
  // and constructs two date (start and end). The validation leads to an error
  // if the dates violate any of the following constraints:
  //   - The start date is in the past
  //   - The end date is before the start date
  // If the form is invalid, errors are set for the respective group of fields.
  const dateTimeValidator = useCallback(() => {
    //build start date/time in utc mills
    // check end time using start and duration
    const sDate = getValues('startDate');
    const sTime = getValues('startTime');
    const sUtc = getValues('startUtc');

    const canonicalSUtc = getCanonicalUtcOffset(sUtc);
    const startDateTime = toDate(sDate + 'T' + sTime + canonicalSUtc);
    const startMills = startDateTime.valueOf();

    const currDateTime = new Date();
    const currMills = currDateTime.getTime();

    //build end date/time in utc mills
    const eDate = getValues('endDate');
    const eTime = getValues('endTime');
    const eUtc = getValues('endUtc');

    const canonicalEUtc = getCanonicalUtcOffset(eUtc);
    const endDateTime = toDate(eDate + 'T' + eTime + canonicalEUtc);
    const endMills = endDateTime.valueOf();

    const minEndDateTimeMills =
      startMills + hoursToMills(MULTISIG_MIN_DURATION_HOURS);

    // set duration mills to avoid new calculation
    setValue('durationMills', endMills - startMills);

    let returnValue = '';

    // TODO: update strings
    // check start constraints
    if (startMills < currMills) {
      setError('startTime', {
        type: 'validate',
        message: t('errors.startPast'),
      });
      setError('startDate', {
        type: 'validate',
        message: t('errors.startPast'),
      });
      returnValue = t('errors.startPast');
    }
    if (startMills >= currMills) {
      clearErrors('startDate');
      clearErrors('startTime');
    }

    //check end constraints
    if (endMills < minEndDateTimeMills) {
      setError('endTime', {
        type: 'validate',
        message: t('errors.endPast'),
      });
      setError('endDate', {
        type: 'validate',
        message: t('errors.endPast'),
      });
      returnValue = t('errors.endPast');
    }

    if (endMills >= minEndDateTimeMills) {
      clearErrors('endDate');
      clearErrors('endTime');
    }

    return !returnValue ? true : returnValue;
  }, [clearErrors, getValues, setError, setValue, t]);

  /*************************************************
   *                    Effects                    *
   *************************************************/
  // Initializes values for the form
  // This is done here rather than in the defaultValues object as time can
  // elapsed between the creation of the form context and this stage of the form.
  useEffect(() => {
    const currTimezone = timezones.find(tz => tz === getFormattedUtcOffset());
    if (!currTimezone) {
      setUtcStart(timezones[13]);
      setUtcEnd(timezones[13]);
      setValue('startUtc', timezones[13]);
      setValue('endUtc', timezones[13]);
    } else {
      setUtcStart(currTimezone);
      setUtcEnd(currTimezone);
      setValue('startUtc', currTimezone);
      setValue('endUtc', currTimezone);
    }
  }, []); //eslint-disable-line

  // These effects trigger validation when UTC fields are changed.
  useEffect(() => {
    dateTimeValidator();
  }, [utcStart, dateTimeValidator]);

  useEffect(() => {
    dateTimeValidator();
  }, [utcEnd, dateTimeValidator]); //eslint-disable-line

  /*************************************************
   *                      Render                   *
   *************************************************/
  return (
    <>
      {/* Voting Type Selection  */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.optionLabel.title')}
          helpText={t('newWithdraw.setupVoting.multisig.optionDescription')}
        />
        <CheckboxListItem
          label={t('newWithdraw.setupVoting.multisig.votingOption.label')}
          type="active"
          helptext={t(
            'newWithdraw.setupVoting.multisig.votingOption.description'
          )}
          multiSelect={false}
        />
        <AlertInline
          mode="neutral"
          label={t('newWithdraw.setupVoting.multisig.votingOption.alert')}
        />
      </FormSection>

      {/* Start time */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.multisig.startLabel')}
          helpText={t('newWithdraw.setupVoting.multisig.startDescription')}
        />
        <Controller
          name="startNow"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="now"
          render={({field: {onChange, value}}) => (
            <>
              <ToggleCheckList
                items={startItems}
                value={value}
                onChange={changeValue =>
                  handleStartNowToggle(changeValue, onChange)
                }
              />
              {value === 'date' && (
                <>
                  <DateTimeSelector
                    mode="start"
                    value={utcStart}
                    validator={dateTimeValidator}
                    onUtcClicked={() => {
                      setUtcInstance('first');
                      open('utc');
                    }}
                  />
                  <DateTimeErrors mode="start" />
                </>
              )}
            </>
          )}
        />
      </FormSection>

      {/* Expiration time */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.multisig.expiration')}
          helpText={t('newWithdraw.setupVoting.multisig.expirationDescription')}
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
                items={expirationItems}
                onChange={changeValue =>
                  handleExpirationTimeToggle(changeValue, onChange)
                }
              />
              {value === 'duration' ? (
                <Duration
                  defaultValues={{days: MULTISIG_REC_DURATION_DAYS}}
                  minDurationHours={MULTISIG_MIN_DURATION_HOURS}
                />
              ) : (
                <>
                  <DateTimeSelector
                    mode="end"
                    value={utcEnd}
                    validator={dateTimeValidator}
                    defaultDateOffset={MULTISIG_REC_DURATION_DAYS}
                    onUtcClicked={() => {
                      setUtcInstance('second');
                      open('utc');
                    }}
                  />
                  <DateTimeErrors mode="end" />
                </>
              )}
              <DurationLabel
                maxDuration={isMaxDuration}
                minDuration={isMinDuration}
              />
            </>
          )}
        />
      </FormSection>
      <UtcMenu onTimezoneSelect={tzSelector} />
    </>
  );
};

export default SetupMultisigVotingForm;

const DurationLabel: React.FC<{maxDuration?: boolean; minDuration?: boolean}> =
  ({maxDuration, minDuration}) => {
    const {t} = useTranslation();

    if (minDuration) {
      return (
        <AlertInline label={t('alert.minExpirationAlert')} mode="critical" />
      );
    } else if (maxDuration) {
      return (
        <AlertInline label={t('alert.maxExpirationAlert')} mode="warning" />
      );
    } else {
      return (
        <AlertInline
          mode="neutral"
          label={t('newWithdraw.setupVoting.multisig.expirationAlert')}
        />
      );
    }
  };

type Props = {
  items: Array<{
    label: string;
    selectValue: string;
  }>;

  value: string;
  onChange: (value: string) => void;
};

const ToggleCheckList: React.FC<Props> = ({onChange, items, value}) => {
  return (
    <ToggleCheckListContainer>
      {items.map(item => (
        <ToggleCheckListItemWrapper key={item.label}>
          <CheckboxListItem
            label={item.label}
            multiSelect={false}
            onClick={() => onChange(item.selectValue)}
            type={value === item.selectValue ? 'active' : 'default'}
          />
        </ToggleCheckListItemWrapper>
      ))}
    </ToggleCheckListContainer>
  );
};

const ToggleCheckListContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-1.5 desktop:flex-row desktop:gap-x-3',
})``;

const ToggleCheckListItemWrapper = styled.div.attrs({className: 'flex-1'})``;
