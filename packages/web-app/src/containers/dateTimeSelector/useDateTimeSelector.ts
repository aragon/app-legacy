// NOTE: Keeping this in the dateTimeSelector folder despite
// being a departure from the usual method, only to stress
// that the DateTimeSelector needs this hook to function
// as expected.

import {timezones} from 'containers/utcMenu/utcData';
import {useGlobalModalContext} from 'context/globalModals';
import {toDate} from 'date-fns-tz';
import format from 'date-fns/format';
import {useCallback, useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getFormattedUtcOffset,
  hoursToMills,
  daysToMills,
  minutesToMills,
} from 'utils/date';

type UtcInstance = 'first' | 'second';

/**
 * This is a hook that returns a validator, handlers and utilities
 * for working with the DateTimeSelector component
 * @param minDurationMills minimum duration as defined by the DAO settings
 * @param minDurationAlert alert shown when the current duration is less than
 *  the minimum duration defined by the DAO settings
 * @returns
 */
export const useDateTimeSelectorValidation = (
  minDurationMills: number,
  minDurationAlert: string
) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();

  const [utcInstance, setUtcInstance] = useState<UtcInstance>('first');
  const {getValues, clearErrors, resetField, setValue} = useFormContext();

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
  const dateTimeValidator = useCallback(() => {
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

    // start dateTime correct
    if (startMills >= currMills) {
      clearErrors('startDate');
      clearErrors('startTime');
      setValue('startTimeWarning', '');
    }

    //check end constraints
    // end date before min duration
    if (endMills < minEndDateTimeMills) {
      setValue('endTimeWarning', minDurationAlert);

      // automatically correct the end date to minimum
      setValue('endDate', format(minEndDateTimeMills, 'yyyy-MM-dd'));
      setValue('endTime', format(minEndDateTimeMills, 'HH:mm'));
      setValue('endUtc', currTimezone);
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
    minDurationAlert,
    minDurationMills,
    setValue,
    t,
  ]);

  // sets the UTC values for the start and end date/time
  const tzSelector = (tz: string) => {
    if (utcInstance === 'first') setValue('startUtc', tz);
    else setValue('endUtc', tz);

    dateTimeValidator();
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

  return {
    dateTimeValidator,
    tzSelector,
    handleUtcClicked,
    handleStartToggle,
    handleEndToggle,
    getDuration,
  };
};
