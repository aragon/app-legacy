import {DateInput, DropdownInput} from '@aragon/ui-components';
import {toDate} from 'date-fns-tz';
import React, {useCallback, useMemo} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {SimplifiedTimeInput} from 'components/inputTime/inputTime';
import {timezones} from 'containers/utcMenu/utcData';
import format from 'date-fns/format';
import {
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getFormattedUtcOffset,
  Offset,
} from 'utils/date';
import {CORRECTION_DELAY} from 'utils/constants';

type Props = {
  mode?: 'start' | 'end';
  onUtcClicked: () => void;
  defaultDateOffset?: Offset;
  minDurationAlert: string;
  minDurationMills: number;
  maxDurationMills?: number;
};

const defaultOffsets = {
  days: 0,
  hours: 0,
  minutes: 0,
};

const DateTimeSelector: React.FC<Props> = ({
  mode,
  onUtcClicked,
  defaultDateOffset,
  minDurationAlert,
  minDurationMills,
  maxDurationMills = 0,
}) => {
  const {days, hours, minutes} = {...defaultOffsets, ...defaultDateOffset};

  const {t} = useTranslation();
  const {control, getValues, clearErrors, setValue} = useFormContext();

  const [value] = useWatch({control, name: [`${mode}Utc`]});

  const currTimezone = useMemo(
    () => timezones.find(tz => tz === getFormattedUtcOffset()) || timezones[13],
    []
  );

  // Validates all fields (date, time and UTC) for both start and end
  // simultaneously. This is necessary, as all the fields are related to one
  // another. The validation gathers information from all start and end fields
  // and constructs two date (start and end). The validation leads to a warning
  // if the dates violate any of the following constraints:
  //   - The start date is in the past
  //   - The end date is before what should be the minimum duration based on
  //     the start date.
  // When these constraints are violated, the respective fields are automatically
  // corrected. This does *not* return any errors.
  // If the form is invalid, errors are set for the respective group of fields.
  const validator = useCallback(() => {
    //build start date/time in utc mills
    // check end time using start and duration
    let startDateTime: Date;
    if (getValues('startSwitch') === 'date') {
      const sDate = getValues('startDate');
      const sTime = getValues('startTime');
      const sUtc = getValues('startUtc');

      const canonicalSUtc = getCanonicalUtcOffset(sUtc);
      startDateTime = toDate(sDate + 'T' + sTime + canonicalSUtc);
    } else {
      // adding one minute to startTime so that by the time comparison
      // rolls around, it's not in the past. Why is this so complicated?
      startDateTime = toDate(
        getCanonicalDate() +
          'T' +
          getCanonicalTime({minutes: 1}) +
          getCanonicalUtcOffset()
      );
    }

    const startMills = startDateTime.valueOf();

    // get the current time
    const currDateTime = new Date();
    const currMills = currDateTime.getTime();

    //build end date/time in utc mills
    const eDate = getValues('endDate');
    const eTime = getValues('endTime');
    const eUtc = getValues('endUtc');

    const canonicalEUtc = getCanonicalUtcOffset(eUtc);
    const endDateTime = toDate(eDate + 'T' + eTime + canonicalEUtc);
    const endMills = endDateTime.valueOf();

    // get minimum end date time in mills
    const minEndDateTimeMills = startMills + minDurationMills;

    // get maximum end date time in mills
    const maxEndDateTimeMills = startMills + maxDurationMills;

    // set duration mills to avoid new calculation
    setValue('durationMills', endMills - startMills);

    // check start constraints
    // start time in the past
    if (startMills < currMills) {
      setValue('startTimeWarning', t('alert.startDateInPastAlert'));

      setTimeout(() => {
        // automatically correct the start date to now
        setValue('startDate', getCanonicalDate());
        setValue('startTime', getCanonicalTime({minutes: 10}));
        setValue('startUtc', currTimezone);
      }, CORRECTION_DELAY);

      // only validate first one if there is an error
      return true;
    }

    // start dateTime correct
    if (startMills >= currMills) {
      clearErrors('startDate');
      clearErrors('startTime');
      setValue('startTimeWarning', '');
    }

    //check end constraints
    // end date before min duration + start time
    if (endMills < minEndDateTimeMills) {
      setValue('endTimeWarning', minDurationAlert);

      setTimeout(() => {
        // automatically correct the end date to minimum
        setValue('endDate', format(minEndDateTimeMills, 'yyyy-MM-dd'));
        setValue('endTime', format(minEndDateTimeMills, 'HH:mm'));
        setValue('endUtc', currTimezone);
      }, CORRECTION_DELAY);
    }

    // end date past maximum duration
    if (maxDurationMills !== 0 && endMills > maxEndDateTimeMills) {
      setTimeout(() => {
        // automatically correct the end date to maximum
        setValue('endDate', format(maxEndDateTimeMills, 'yyyy-MM-dd'));
        setValue('endTime', format(maxEndDateTimeMills, 'HH:mm'));
        setValue('endUtc', currTimezone);
      }, CORRECTION_DELAY);
    }

    // end dateTime correct
    if (endMills >= minEndDateTimeMills) {
      clearErrors('endDate');
      clearErrors('endTime');
      setValue('endTimeWarning', '');
    }

    return true;
  }, [
    clearErrors,
    currTimezone,
    getValues,
    maxDurationMills,
    minDurationAlert,
    minDurationMills,
    setValue,
    t,
  ]);

  /*************************************************
   *                      Render                   *
   *************************************************/
  return (
    <>
      <SpecificTimeContainer>
        <Controller
          name={`${mode}Date`}
          control={control}
          defaultValue={getCanonicalDate({days})}
          rules={{
            required: t('errors.required.date'),
            validate: validator,
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
          name={`${mode}Time`}
          control={control}
          defaultValue={getCanonicalTime({hours, minutes})}
          rules={{
            required: t('errors.required.time'),
            validate: validator,
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
          <DropdownInput value={value} onClick={onUtcClicked} />
        </InputWrapper>
      </SpecificTimeContainer>
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
