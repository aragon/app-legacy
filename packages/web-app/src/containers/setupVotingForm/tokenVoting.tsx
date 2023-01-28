import {
  AlertCard,
  AlertInline,
  CheckboxListItem,
  DateInput,
  DropdownInput,
  Label,
  NumberInput,
} from '@aragon/ui-components';
import {toDate} from 'date-fns-tz';
import React, {useCallback, useEffect, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {VotingSettings} from '@aragon/sdk-client';
import {SimplifiedTimeInput} from 'components/inputTime/inputTime';
import UtcMenu from 'containers/utcMenu';
import {timezones} from 'containers/utcMenu/utcData';
import {useGlobalModalContext} from 'context/globalModals';
import {
  daysToMills,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getDHMFromSeconds,
  getFormattedUtcOffset,
  hoursToMills,
  minutesToMills,
} from 'utils/date';
import {StringIndexed} from 'utils/types';
import {DateModeSwitch} from './dateModeSwitch';
import {DateTimeErrors} from './dateTimeErrors';

type UtcInstance = 'first' | 'second';

type Props = {
  pluginSettings: VotingSettings;
};

const SetupTokenVotingForm: React.FC<Props> = ({pluginSettings}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {
    control,
    setValue,
    getValues,
    setError,
    formState,
    clearErrors,
    resetField,
  } = useFormContext();
  const endDateType = useWatch({
    name: 'durationSwitch',
  });

  /*************************************************
   *                    STATE & EFFECT             *
   *************************************************/
  const [utcInstance, setUtcInstance] = useState<UtcInstance>('first');
  const [utcStart, setUtcStart] = useState('');
  const [utcEnd, setUtcEnd] = useState('');

  const {days, hours, minutes} = getDHMFromSeconds(pluginSettings.minDuration);

  // Initializes values for the form
  // This is done here rather than in the defaulValues object as time can
  // ellapse between the creation of the form context and this stage of the form.
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
      startMills +
      daysToMills(days || 0) +
      hoursToMills(hours || 0) +
      minutesToMills(minutes || 0);

    let returnValue = '';

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
      returnValue = t('errors.endPast');
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
  }, [clearErrors, days, getValues, hours, minutes, setError, t]);

  // These effects trigger validation when UTC fields are changed.

  useEffect(() => {
    dateTimeValidator();
  }, [utcStart, dateTimeValidator]);

  useEffect(() => {
    dateTimeValidator();
  }, [utcEnd, dateTimeValidator]); //eslint-disable-line

  useEffect(() => {
    if (!pluginSettings.minDuration) {
      setError('areSettingsLoading', {});
    } else {
      clearErrors('areSettingsLoading');
    }
  }, [clearErrors, pluginSettings.minDuration, setError]);

  // sets the UTC values for the start and end date/time
  const tzSelector = (tz: string) => {
    if (utcInstance === 'first') {
      setUtcStart(tz);
      setValue('startUtc', tz);
    } else {
      setUtcEnd(tz);
      setValue('endUtc', tz);
    }
  };

  const clearInputs = () => {
    resetField('duration');
    resetField('endDate');
    resetField('endTime');
  };

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

      {/* Start Date */}
      <FormSection>
        <Label label={t('labels.startDate')} />
        <HStack>
          <Controller
            name="startDate"
            control={control}
            defaultValue={getCanonicalDate({minutes: 10})}
            rules={{
              required: t('errors.required.date'),
              validate: dateTimeValidator,
            }}
            render={({field: {name, value, onChange, onBlur}}) => (
              <div>
                <DateInput
                  name={name}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              </div>
            )}
          />
          <Controller
            name="startTime"
            control={control}
            defaultValue={getCanonicalTime({minutes: 10})}
            rules={{
              required: t('errors.required.time'),
              validate: dateTimeValidator,
            }}
            render={({field: {name, value, onChange, onBlur}}) => (
              <div>
                <SimplifiedTimeInput
                  name={name}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              </div>
            )}
          />
          <div>
            <DropdownInput
              value={utcStart}
              onClick={() => {
                setUtcInstance('first');
                open('utc');
              }}
            />
          </div>
        </HStack>
        <DateTimeErrors mode={'start'} />
      </FormSection>

      {/* End date */}
      {pluginSettings.minDuration && (
        <FormSection>
          <Label label={t('labels.endDate')} />
          {endDateType === 'duration' && days && days >= 1 ? (
            <>
              <HStack>
                <Controller
                  name="durationSwitch"
                  defaultValue="duration"
                  control={control}
                  render={({field: {onChange, value}}) => {
                    return (
                      <DateModeSwitch
                        value={value}
                        setValue={value => {
                          clearInputs();
                          onChange(value);
                        }}
                      />
                    );
                  }}
                />
                <Controller
                  name="duration"
                  control={control}
                  defaultValue={days + 1}
                  rules={{
                    min: {
                      value: days + 1 || 0,
                      message: t('errors.durationTooShort'),
                    },
                    required: t('errors.required.duration'),
                  }}
                  render={({field: {name, onChange, value}}) => {
                    return (
                      <NumberInput
                        name={name}
                        value={value}
                        min={days + 1}
                        onChange={onChange}
                        width={144}
                      />
                    );
                  }}
                />
              </HStack>
              {formState.errors?.duration?.message && (
                <AlertInline
                  label={formState.errors.duration.message}
                  mode="critical"
                />
              )}
            </>
          ) : (
            <>
              <div className="block space-y-2">
                {days && days >= 1 ? (
                  <div>
                    <Controller
                      name="durationSwitch"
                      control={control}
                      defaultValue="date"
                      render={({field: {onChange, value}}) => {
                        return (
                          <DateModeSwitch
                            value={value}
                            setValue={value => {
                              clearInputs();
                              onChange(value);
                            }}
                          />
                        );
                      }}
                    />
                  </div>
                ) : null}
                <HStack>
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{
                      required: t('errors.required.date'),
                      validate: dateTimeValidator,
                    }}
                    defaultValue={getCanonicalDate({days, hours, minutes})}
                    render={({field: {name, value, onChange, onBlur}}) => (
                      <div>
                        <DateInput
                          name={name}
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                        />
                      </div>
                    )}
                  />
                  <Controller
                    name="endTime"
                    control={control}
                    defaultValue={getCanonicalTime({
                      days,
                      hours,
                      minutes: (minutes || 0) + 10,
                    })}
                    rules={{
                      required: t('errors.required.time'),
                      validate: dateTimeValidator,
                    }}
                    render={({field: {name, value, onChange, onBlur}}) => (
                      <div>
                        <SimplifiedTimeInput
                          name={name}
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                        />
                      </div>
                    )}
                  />
                  <div>
                    <DropdownInput
                      value={utcEnd}
                      onClick={() => {
                        setUtcInstance('second');
                        open('utc');
                      }}
                    />
                  </div>
                </HStack>
              </div>
              <DateTimeErrors mode={'end'} />
            </>
          )}
          {minutes && minutes > 0 ? (
            <AlertInline
              label={t('infos.voteDHMDuration', {days, hours, minutes})}
              mode="neutral"
            />
          ) : hours && hours > 0 ? (
            <AlertInline
              label={t('infos.voteDHDuration', {days, hours})}
              mode="neutral"
            />
          ) : (
            <AlertInline
              label={t('infos.voteDuration', {days})}
              mode="neutral"
            />
          )}
        </FormSection>
      )}
      <UtcMenu onTimezoneSelect={tzSelector} />
    </>
  );
};

export default SetupTokenVotingForm;

/**
 * Check if the screen is valid
 * @param errors List of fields that have errors
 * @param durationSwitch Duration switch value
 * @returns Whether the screen is valid
 */
export function isValid(errors: StringIndexed) {
  return !(
    errors.startDate ||
    errors.startTime ||
    errors.endDate ||
    errors.ednTime ||
    errors.areSettingsLoading
  );
}

const FormSection = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const HStack = styled.div.attrs({
  className: 'inline-flex space-x-1',
})``;
