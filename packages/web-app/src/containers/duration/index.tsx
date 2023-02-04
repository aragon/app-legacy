import {AlertInline, NumberInput} from '@aragon/ui-components';
import React, {useCallback} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {HOURS_IN_DAY, MINS_IN_HOUR, MINS_IN_DAY} from 'utils/constants';
import {
  Offset,
  daysToMills,
  hoursToMills,
  minutesToMills,
  getDaysHoursMins,
} from 'utils/date';

type Props = {
  name?: string;
  minDuration?: Offset;
  maxDurationDays?: number; // duration in days
  defaultValues?: Offset;
};

const durationDefaults = {
  days: 0,
  hours: 0,
  minutes: 0,
};

const Duration: React.FC<Props> = ({
  defaultValues,
  name = '',
  minDuration,
  maxDurationDays,
}) => {
  const defaults = {...durationDefaults, ...defaultValues};
  const minimums = {...durationDefaults, ...minDuration};

  const {t} = useTranslation();
  const {control, getValues, setValue, trigger} = useFormContext();

  const daoMinDurationMills =
    daysToMills(minimums.days) +
    hoursToMills(minimums.hours) +
    minutesToMills(minimums.minutes);

  const isMaxDurationDays =
    Number(getValues('durationDays')) === maxDurationDays;

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const durationLTMinimum = useCallback(
    (durationOffset: Offset) => {
      const duration =
        daysToMills(durationOffset.days || 0) +
        hoursToMills(durationOffset.hours || 0) +
        minutesToMills(durationOffset.minutes || 0);

      return duration < daoMinDurationMills;
    },
    [daoMinDurationMills]
  );

  const resetToMinDuration = useCallback(() => {
    setValue('durationDays', minimums.days);
    setValue('durationHours', minimums.hours);
    setValue('durationMinutes', minimums.minutes);
  }, [minimums.days, minimums.hours, minimums.minutes, setValue]);

  const handleDaysChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      const [formHours, formMins] = getValues([
        'durationHours',
        'durationMinutes',
      ]);

      const formDuration = {
        days: value,
        hours: Number(formHours),
        minutes: Number(formMins),
      };

      if (maxDurationDays && value >= maxDurationDays) {
        e.target.value = maxDurationDays.toString();

        setValue('durationDays', maxDurationDays.toString());
        setValue('durationHours', '0');
        setValue('durationMinutes', '0');
      } else if (value <= minimums.days && durationLTMinimum(formDuration)) {
        resetToMinDuration();
        e.target.value = minimums.days.toString();
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [
      durationLTMinimum,
      getValues,
      maxDurationDays,
      minimums.days,
      resetToMinDuration,
      setValue,
      trigger,
    ]
  );

  const handleHoursChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);

      const [formDays, formMins] = getValues([
        'durationDays',
        'durationMinutes',
      ]);

      const formDuration = {
        days: Number(formDays),
        hours: value,
        minutes: Number(formMins),
      };

      if (value >= HOURS_IN_DAY) {
        const {days, hours} = getDaysHoursMins(value, 'hours');
        e.target.value = hours.toString();

        if (days > 0) {
          setValue(
            'durationDays',
            (Number(getValues('durationDays')) + days).toString()
          );
        }
      } else if (value <= minimums.hours && durationLTMinimum(formDuration)) {
        resetToMinDuration();
        e.target.value = minimums.hours.toString();
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [
      durationLTMinimum,
      getValues,
      minimums.hours,
      resetToMinDuration,
      setValue,
      trigger,
    ]
  );

  const handleMinutesChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);

      const [formDays, formHours] = getValues([
        'durationDays',
        'durationHours',
      ]);

      const formDuration = {
        days: Number(formDays),
        hours: Number(formHours),
        minutes: value,
      };

      if (value >= MINS_IN_HOUR) {
        const [oldDays, oldHours] = getValues([
          'durationDays',
          'durationHours',
        ]);

        const totalMins =
          oldDays * MINS_IN_DAY + oldHours * MINS_IN_HOUR + value;

        const {days, hours, mins} = getDaysHoursMins(totalMins);
        setValue('durationDays', days.toString());
        setValue('durationHours', hours.toString());
        e.target.value = mins.toString();
      } else if (value <= minimums.minutes && durationLTMinimum(formDuration)) {
        resetToMinDuration();
        e.target.value = minimums.minutes.toString();
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [
      durationLTMinimum,
      getValues,
      minimums.minutes,
      resetToMinDuration,
      setValue,
      trigger,
    ]
  );

  /*************************************************
   *                      Render                   *
   *************************************************/
  return (
    <DurationContainer>
      <Controller
        name={`${name}durationMinutes`}
        control={control}
        defaultValue={`${defaults.minutes}`}
        rules={{
          required: t('errors.emptyDistributionMinutes'),
          validate: value =>
            value <= 59 && value >= 0 ? true : t('errors.distributionMinutes'),
        }}
        render={({
          field: {onBlur, onChange, value, name},
          fieldState: {error},
        }) => (
          <TimeLabelWrapper>
            <TimeLabel>{t('createDAO.step4.minutes')}</TimeLabel>
            <NumberInput
              name={name}
              value={Number(value).toString()}
              onBlur={onBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleMinutesChanged(e, onChange)
              }
              placeholder={'0'}
              min="0"
              disabled={isMaxDurationDays}
            />
            {error?.message && (
              <AlertInline label={error.message} mode="critical" />
            )}
          </TimeLabelWrapper>
        )}
      />

      <Controller
        name={`${name}durationHours`}
        control={control}
        defaultValue={`${defaults.hours}`}
        rules={{required: t('errors.emptyDistributionHours')}}
        render={({
          field: {onBlur, onChange, value, name},
          fieldState: {error},
        }) => (
          <TimeLabelWrapper>
            <TimeLabel>{t('createDAO.step4.hours')}</TimeLabel>
            <NumberInput
              name={name}
              value={Number(value).toString()}
              onBlur={onBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleHoursChanged(e, onChange)
              }
              placeholder={'0'}
              min="0"
              disabled={isMaxDurationDays}
            />
            {error?.message && (
              <AlertInline label={error.message} mode="critical" />
            )}
          </TimeLabelWrapper>
        )}
      />

      <Controller
        name={`${name}durationDays`}
        control={control}
        defaultValue={`${defaults.days}`}
        rules={{
          required: t('errors.emptyDistributionDays'),
          validate: value => (value >= 0 ? true : t('errors.distributionDays')),
        }}
        render={({
          field: {onBlur, onChange, value, name},
          fieldState: {error},
        }) => (
          <TimeLabelWrapper>
            <TimeLabel>{t('createDAO.step4.days')}</TimeLabel>
            <NumberInput
              name={name}
              value={Number(value).toString()}
              onBlur={onBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleDaysChanged(e, onChange)
              }
              placeholder={'0'}
              min="0"
            />
            {error?.message && (
              <AlertInline label={error.message} mode="critical" />
            )}
          </TimeLabelWrapper>
        )}
      />
    </DurationContainer>
  );
};

export default Duration;

export type DurationLabelProps = {
  maxDuration?: boolean;
  minDuration?: boolean;
  limitOnMax?: boolean;
  alerts?: {
    minDuration: string;
    maxDuration: string;
    acceptableDuration: string;
  };
};

export const DurationLabel: React.FC<DurationLabelProps> = ({
  alerts,
  ...props
}) => {
  if (props.minDuration && alerts?.minDuration) {
    return <AlertInline label={alerts.minDuration} mode="critical" />;
  } else if (props.maxDuration && alerts?.maxDuration) {
    return (
      <AlertInline
        label={alerts.maxDuration}
        mode={props.limitOnMax ? 'critical' : 'warning'}
      />
    );
  } else {
    return alerts?.acceptableDuration ? (
      <AlertInline label={alerts.acceptableDuration} mode="neutral" />
    ) : null;
  }
};

const DurationContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-1.5 p-3 bg-ui-0 rounded-xl',
})``;

const TimeLabelWrapper = styled.div.attrs({
  className: 'tablet:w-full space-y-0.5',
})``;

const TimeLabel = styled.span.attrs({
  className: 'text-sm font-bold text-ui-800',
})``;
