import {i18n} from '../../i18n.config';
import {format, formatRelative, formatDistance} from 'date-fns';
import {ProposalStatus} from '@aragon/sdk-client';

export const KNOWN_FORMATS = {
  standard: 'MMM dd yyyy HH:mm', // This is our standard used for showing dates.
  proposals: 'yyyy/MM/dd hh:mm a',
};

type Offset = {
  days?: number;
  hours?: number;
  minutes?: number;
};

/**
 * This function returns the number of seconds given the days hours and minutes
 * @param days number of days
 * @param hours number of hours
 * @param minutes number of minutes
 * @returns number of seconds
 */
export function getSecondsFromDHM(
  days: number,
  hours: number,
  minutes: number
): number {
  return minutes * 60 + hours * 3600 + days * 86400;
}

/**
 * This function returns the days, hours and minutes of seconds
 * @param seconds number of seconds
 * @returns {
 *  days,
 *  hours,
 *  minutes,
 * } an object includes days & hours & minutes
 */
export function getDHMFromSeconds(seconds: number): Offset {
  if (!seconds) return {} as Offset;

  const days = seconds < 86400 ? 0 : seconds / 86400;
  const hours = seconds % 86400 < 3600 ? 0 : (seconds % 86400) / 3600;
  const remainingMinutes = (seconds % 86400) % 3600;
  const minutes = remainingMinutes < 60 ? 0 : remainingMinutes / 60;

  return {
    days: Math.floor(days),
    hours: Math.floor(hours),
    minutes: Math.floor(minutes),
  };
}

/**
 * Note: This function will return a list of timestamp that we can use to categorize transfers
 * @return a object with milliseconds params
 */
export function getDateSections(): {
  lastWeek: number;
  lastMonth: number;
  lastYear: number;
} {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const lastWeek: number = new Date(date.setDate(diff)).getTime();
  const lastMonth: number = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  ).getTime();
  const lastYear: number = new Date(date.getFullYear(), 0, 1).getTime();

  return {
    lastWeek,
    lastMonth,
    lastYear,
  };
}

export function daysToMills(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

export function hoursToMills(hours: number): number {
  return hours * 60 * 60 * 1000;
}

export function minutesToMills(minutes: number): number {
  return minutes * 60 * 1000;
}

function offsetToMills(offset: Offset) {
  return (
    (offset.days ? daysToMills(offset.days) : 0) +
    (offset.hours ? hoursToMills(offset.hours) : 0) +
    (offset.minutes ? minutesToMills(offset.minutes) : 0)
  );
}

/**
 * Returns the either:
 *
 *  - the current date
 *  - or the current date + the number of days passed as offset
 *
 * as a string with the following format: "yyyy-mm-dd".
 *
 * Note that the offset may be negative. This will return a date in the past.
 *
 * This date format is necessary when working with html inputs of type "date".
 */
export function getCanonicalDate(offset?: Offset): string {
  const currDate = new Date();

  //add offset
  const offsetMills = offset ? offsetToMills(offset) : 0;
  const offsetTime = currDate.getTime() + offsetMills;
  const offsetDateTime = new Date(offsetTime);

  //format date
  const month = offsetDateTime.getMonth() + 1;
  const formattedMonth = month > 9 ? '' + month : '0' + month;
  const day = offsetDateTime.getDate();
  const formattedDay = day > 9 ? '' + day : '0' + day;
  return (
    '' +
    offsetDateTime.getFullYear() +
    '-' +
    formattedMonth +
    '-' +
    formattedDay
  );
}

/**
 * Returns the current time as a string with the following format:
 * "hh:mm".
 *
 * This time format is necessary when working with html inputs of type "time".
 */
export function getCanonicalTime(offset?: Offset): string {
  const currDate = new Date();

  //add offset
  const offsetMills = offset ? offsetToMills(offset) : 0;
  const offsetTime = currDate.getTime() + offsetMills;
  const offsetDateTime = new Date(offsetTime);

  //format time
  const currHours = offsetDateTime.getHours();
  const currMinutes = offsetDateTime.getMinutes();
  const formattedHours = currHours > 9 ? '' + currHours : '0' + currHours;
  const formattedMinutes =
    currMinutes > 9 ? '' + currMinutes : '0' + currMinutes;

  return '' + formattedHours + ':' + formattedMinutes;
}

/**
 * This method returns a UTC offset with the following format:
 * "[+|-]hh:mm".
 *
 * This format is necessary to construct dates based on a particular timezone
 * offset using the date-fns library.
 *
 * If a formatted offset is provided, it will be mapped to its canonical form.
 * If none is provided, the current timezone offset will be used.
 */
export function getCanonicalUtcOffset(formattedUtcOffset?: string): string {
  const formattedOffset = formattedUtcOffset || getFormattedUtcOffset();
  const noLettersOffset = formattedOffset.slice(3);
  const sign = noLettersOffset.slice(0, 1);
  const time = noLettersOffset.slice(1);
  let canonicalOffset;
  if (time.includes(':')) {
    // if colon present only hours might need padding
    const [hours, minutes] = time.split(':');
    canonicalOffset = (hours.length === 1 && '0') + hours + ':' + minutes;
  } else {
    // if no colon, need to add :00 and maybe padding to hours
    canonicalOffset = (time.length === 1 && '0') + time + ':00';
  }
  return sign + canonicalOffset;
}

/**
 * This method returns the user's UTC offset with the following format:
 * "UTC[+|-](h)?h(:mm)?" (E.g., either UTC+10, UTC-9:30).
 *
 * This format is used to display offsets in the UI.
 */
export function getFormattedUtcOffset(): string {
  const currDate = new Date();
  let decimalOffset = currDate.getTimezoneOffset() / 60;
  const isNegative = decimalOffset < 0;
  decimalOffset = Math.abs(decimalOffset);
  const hourOffset = Math.floor(decimalOffset);
  const minuteOffset = Math.round((decimalOffset - hourOffset) * 60);
  let formattedOffset = 'UTC' + (isNegative ? '+' : '-') + hourOffset;
  formattedOffset += minuteOffset > 0 ? ':' + minuteOffset : '';
  return formattedOffset;
}

/**
 * Note: This function will return the remaining time from input timestamp
 * to current time.
 * @param timestamp proposal create/end timestamp must be greater than current timestamp
 * @returns remaining timestamp from now
 */
export function getRemainingTime(
  timestamp: number | string // in milliseconds
): number {
  const currentTimestamp = Math.floor(new Date().getTime());
  return parseInt(`${timestamp}`) - currentTimestamp;
}

/**
 * Note: this function will convert the proposal's timestamp to proper string to show
 * as a alert message on proposals card
 * @param status return the message if the type was pending or active
 * @param startDate proposal startDate
 * @param endDate proposal endDate
 * @returns a message with i18 translation as proposal ends alert
 */
export function translateProposalDate(
  status: ProposalStatus,
  startDate: Date,
  endDate: Date
): string | undefined {
  let leftTimestamp: number;
  if (status === 'Pending') {
    leftTimestamp = getRemainingTime(startDate.getTime());
  } else if (status === 'Active') {
    leftTimestamp = getRemainingTime(endDate.getTime());
  } else {
    return;
  }

  const {days, hours} = getDaysAndHours(leftTimestamp);

  return i18n.t(`governance.proposals.${status}`, {
    days,
    hours,
  }) as string;
}

export function getDaysAndHours(timestamp: number) {
  return {
    days: Math.floor(timestamp / (1000 * 60 * 60 * 24)),
    hours: Math.floor((timestamp / (1000 * 60 * 60)) % 24),
  };
}

/**
 * @param date number or string in seconds (not milliseconds)
 * @param formatType KNOWN_FORMATS
 */
export function formatDate(date: number | string, formatType?: string) {
  try {
    if (typeof date === 'string') {
      date = parseInt(date, 10);
    }
    date = date * 1000;
    if (formatType === 'relative') {
      return formatRelative(date, new Date()); // Relative Format for Human Readable Date format
    } else {
      formatType = formatType || KNOWN_FORMATS.standard;
      return format(date, formatType, {});
    }
  } catch (e) {
    return date;
  }
}

export function formatTime(time: number | string) {
  //converting delay time into human readable format
  try {
    if (typeof time === 'string') {
      time = parseInt(time, 10);
    }
    return formatDistance(0, time * 1000, {includeSeconds: true});
  } catch (e) {
    return time;
  }
}
