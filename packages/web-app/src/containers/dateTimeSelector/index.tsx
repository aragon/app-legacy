import {DateInput, DropdownInput} from '@aragon/ui-components';
import {toDate} from 'date-fns-tz';
import React, {useCallback, useEffect, useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {SimplifiedTimeInput} from 'components/inputTime/inputTime';
import UtcMenu from 'containers/utcMenu';
import {timezones} from 'containers/utcMenu/utcData';
import {useGlobalModalContext} from 'context/globalModals';
import {
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getFormattedUtcOffset,
} from 'utils/date';

type UtcInstance = 'first' | 'second';
type Props = {name?: string};

const DateTimeSelector: React.FC<Props> = ({name}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {control, clearErrors, getValues, setError, setValue} =
    useFormContext();

  const [utcInstance, setUtcInstance] = useState<UtcInstance>('first');
  const [utcStart, setUtcStart] = useState('');
  const [utcEnd, setUtcEnd] = useState('');

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  // Validates all fields (date, time and UTC) for both start and end
  // simultaneously. This is necessary, as all the fields are related to one
  // another. The validation gathers information from all start and end fields
  // and constructs two date (start and end). The validation leads to an error
  // if the dates violate any of the following constraints:
  //   - The start date is in the past
  //   - The end date is before the start date
  // If the form is invalid, errors are set for the repsective group of fields.
  const dateTimeValidator = useCallback(() => {
    // get all time field values
    const [sDate, sTime, sUtc, eDate, eTime, eUtc] = getValues([
      `${name}startDate`,
      `${name}startTime`,
      `${name}startUtc`,
      `${name}endDate`,
      `${name}endTime`,
      `${name}endUtc`,
    ]);

    //build start date/time in utc mills
    const canonicalSUtc = getCanonicalUtcOffset(sUtc);
    const startDateTime = toDate(sDate + 'T' + sTime + canonicalSUtc);
    const startMills = startDateTime.valueOf();

    const currDateTime = new Date();
    const currMills = currDateTime.getTime();

    //build end date/time in utc mills
    const canonicalEUtc = getCanonicalUtcOffset(eUtc);
    const endDateTime = toDate(eDate + 'T' + eTime + canonicalEUtc);
    const endMills = endDateTime.valueOf();

    const minEndDateTimeMills = startMills + 0;
    // TODO: handle min end dateTime
    //   daysToMills(days || 0) +
    //   hoursToMills(hours || 0) +
    //   minutesToMills(minutes || 0);

    let returnValue = '';

    // check start constraints
    if (startMills < currMills) {
      setError(`${name}startTime`, {
        type: 'validate',
        message: t('errors.startPast'),
      });
      setError(`${name}startDate`, {
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
      setError(`${name}endTime`, {
        type: 'validate',
        message: t('errors.endPast'),
      });
      setError(`${name}endDate`, {
        type: 'validate',
        message: t('errors.endPast'),
      });
      returnValue = t('errors.endPast');
    }

    if (endMills >= minEndDateTimeMills) {
      clearErrors(`${name}endDate`);
      clearErrors(`${name}endTime`);
    }

    return !returnValue ? true : returnValue;
  }, [clearErrors, getValues, name, setError, t]);

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

  /*************************************************
   *               Hooks & Effects                 *
   *************************************************/
  // Initializes values for the form
  // This is done here rather than in the defaultValues object as time can
  // elapse between the creation of the form context and this stage of the form.
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

  //   useEffect(() => {
  //     if (!daoSettings.minDuration) {
  //       setError('areSettingsLoading', {});
  //     } else {
  //       clearErrors('areSettingsLoading');
  //     }
  //   }, [clearErrors, daoSettings.minDuration, setError]);

  /*************************************************
   *                      Render                   *
   *************************************************/
  return (
    <>
      <SpecificTimeContainer>
        <Controller
          name="startDate"
          control={control}
          defaultValue={getCanonicalDate({minutes: 10})}
          rules={{
            required: t('errors.required.date'),
            validate: dateTimeValidator,
          }}
          render={({field: {name, value, onChange, onBlur}}) => (
            <InputWrapper>
              <LabelWrapper>{t('labels.date')}</LabelWrapper>
              <DateInput
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
              />
            </InputWrapper>
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
            <InputWrapper>
              <LabelWrapper>{t('labels.time')}</LabelWrapper>
              <SimplifiedTimeInput
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
              />
            </InputWrapper>
          )}
        />
        <InputWrapper>
          <LabelWrapper>{t('labels.timezone')}</LabelWrapper>
          <DropdownInput
            value={utcStart}
            onClick={() => {
              setUtcInstance('first');
              open('utc');
            }}
          />
        </InputWrapper>
      </SpecificTimeContainer>
      <UtcMenu onTimezoneSelect={tzSelector} />
    </>
  );
};

export default DateTimeSelector;
const InputWrapper = styled.div.attrs({
  className: 'space-y-0.5 w-1/2 tablet:w-full',
})``;

const LabelWrapper = styled.span.attrs({
  className: 'text-sm font-bold text-ui-800 capitalize',
})``;

const SpecificTimeContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-1.5 p-3 bg-ui-0 rounded-xl',
})``;
