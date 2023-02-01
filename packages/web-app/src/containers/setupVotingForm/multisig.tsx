import {AlertInline, CheckboxListItem, Label} from '@aragon/ui-components';
import {toDate} from 'date-fns-tz';
import format from 'date-fns/format';
import React, {useCallback, useMemo, useState} from 'react';
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
  getCanonicalDate,
  getCanonicalTime,
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
  const {control, getValues, clearErrors, resetField, setValue, formState} =
    useFormContext();

  const [
    durationDays,
    durationHours,
    durationMinutes,
    durationMills,
    endTimeWarning,
    startUtc,
    endUtc,
  ] = useWatch({
    control,
    name: [
      'durationDays',
      'durationHours',
      'durationMinutes',
      'durationMills',
      'endTimeWarning',
      'startUtc',
      'endUtc',
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

  const currTimezone = useMemo(
    () => timezones.find(tz => tz === getFormattedUtcOffset()) || timezones[13],
    []
  );

  /*************************************************
   *                   Handlers                    *
   *************************************************/
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

  // sets the UTC values for the start and end date/time
  const tzSelector = (tz: string) => {
    if (utcInstance === 'first') setValue('startUtc', tz);
    else setValue('endUtc', tz);

    dateTimeValidator();
  };

  // handles the toggling between start datetime options
  const handleStartNowToggle = useCallback(
    (changeValue, onChange: (value: string) => void) => {
      onChange(changeValue);
      if (changeValue === 'now') resetStartDate();
      else setValue('startUtc', currTimezone);
    },
    [currTimezone, resetStartDate, setValue]
  );

  // handles the toggling between expiration datetime options
  const handleExpirationTimeToggle = useCallback(
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
    let startDateTime: Date;
    if (getValues('startNow') === 'date') {
      const sDate = getValues('startDate');
      const sTime = getValues('startTime');
      const sUtc = getValues('startUtc');

      const canonicalSUtc = getCanonicalUtcOffset(sUtc);
      startDateTime = toDate(sDate + 'T' + sTime + canonicalSUtc);
    } else
      startDateTime = toDate(
        getCanonicalDate() + 'T' + getCanonicalTime() + getCanonicalUtcOffset()
      );

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

    // check start constraints
    // start time in the past
    if (startMills < currMills) {
      setValue('startTimeWarning', t('alert.startDateInPastAlert'));

      // automatically correct the start date to now
      setValue('startDate', getCanonicalDate());
      setValue('startTime', getCanonicalTime({minutes: 10}));
      setValue('startUtc', currTimezone);

      // only validate first one if there is an error
      return true;
    }

    // start datetime correct
    if (startMills >= currMills) {
      clearErrors('startDate');
      clearErrors('startTime');
      setValue('startTimeWarning', '');
    }

    //check end constraints
    // end date before min duration
    if (endMills < minEndDateTimeMills) {
      setValue('endTimeWarning', t('alert.expirationLTDurationAlert'));

      // automatically correct the end date to minimum
      setValue('endDate', format(minEndDateTimeMills, 'yyyy-MM-dd'));
      setValue('endTime', format(minEndDateTimeMills, 'HH:mm'));
      setValue('endUtc', currTimezone);
    }

    // end datetime correct
    if (endMills >= minEndDateTimeMills) {
      clearErrors('endDate');
      clearErrors('endTime');
      setValue('endTimeWarning', '');
    }

    return true;
  }, [clearErrors, currTimezone, getValues, setValue, t]);

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
                  handleStartNowToggle(changeValue, onChange)
                }
              />
              {value === 'date' && (
                <>
                  <DateTimeSelector
                    mode="start"
                    value={startUtc}
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
                    value={endUtc}
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
              {!endTimeWarning && !formState?.errors?.endDate && (
                <DurationLabel
                  minDuration={isMinDuration}
                  maxDuration={isMaxDuration}
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

export default SetupMultisigVotingForm;

type DurationLabelProps = {
  maxDuration?: boolean;
  minDuration?: boolean;
};

const DurationLabel: React.FC<DurationLabelProps> = props => {
  const {t} = useTranslation();

  if (props.minDuration) {
    return (
      <AlertInline label={t('alert.minExpirationAlert')} mode="critical" />
    );
  } else if (props.maxDuration) {
    return <AlertInline label={t('alert.maxExpirationAlert')} mode="warning" />;
  } else {
    return (
      <AlertInline
        label={t('newWithdraw.setupVoting.multisig.expirationAlert')}
        mode="neutral"
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
