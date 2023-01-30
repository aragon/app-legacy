import {AlertInline, NumberInput} from '@aragon/ui-components';
import React, {useCallback} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {HOURS_IN_DAY, MINS_IN_DAY, MINS_IN_HOUR} from 'utils/constants';
import {getDaysHoursMins} from 'utils/date';

type Props = {
  name?: string;
  maxDurationDays?: number;
  minDurationHours: number;
  defaultValues?: {
    days?: number;
    hours?: number;
    mins?: number;
  };
};

const durationDefaults = {
  days: 0,
  hours: 0,
  mins: 0,
};

const Duration: React.FC<Props> = ({
  name = '',
  maxDurationDays,
  minDurationHours,
  defaultValues,
}) => {
  const defaults = {...durationDefaults, ...defaultValues};

  const {t} = useTranslation();
  const {control, getValues, setValue, trigger} = useFormContext();
  const [durationDays] = useWatch({control, name: [`${name}durationDays`]});

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handleDaysChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      const durationHours = getValues(`${name}durationHours`);
      if (maxDurationDays !== undefined && value >= maxDurationDays) {
        e.target.value = maxDurationDays.toString();

        setValue(`${name}durationDays`, maxDurationDays.toString());
        setValue(`${name}durationHours`, '0');
        setValue(`${name}durationMinutes`, '0');
      } else if (value === 0 && durationHours === '0') {
        setValue(`${name}durationHours`, minDurationHours.toString());
      }
      trigger([
        `${name}durationMinutes`,
        `${name}durationHours`,
        `${name}durationDays`,
      ]);
      onChange(e);
    },
    [getValues, maxDurationDays, minDurationHours, name, setValue, trigger]
  );

  const handleHoursChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      const durationDays = getValues(`${name}durationDays`);

      if (value >= HOURS_IN_DAY) {
        const {days, hours} = getDaysHoursMins(value, 'hours');
        e.target.value = hours.toString();

        if (days > 0) {
          setValue(
            `${name}durationDays`,
            (Number(durationDays) + days).toString()
          );
        }
      } else if (value === 0 && durationDays === '0') {
        setValue(`${name}durationHours`, minDurationHours.toString());
        setValue(`${name}durationMinutes`, '0');
        e.target.value = minDurationHours.toString();
      }
      trigger([
        `${name}durationMinutes`,
        `${name}durationHours`,
        `${name}durationDays`,
      ]);
      onChange(e);
    },
    [getValues, minDurationHours, name, setValue, trigger]
  );

  const handleMinutesChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);

      if (value >= MINS_IN_HOUR) {
        const [oldDays, oldHours] = getValues([
          `${name}durationDays`,
          `${name}durationHours`,
        ]);

        const totalMins =
          oldDays * MINS_IN_DAY + oldHours * MINS_IN_HOUR + value;

        const {days, hours, mins} = getDaysHoursMins(totalMins);
        setValue(`${name}durationDays`, days.toString());
        setValue(`${name}durationHours`, hours.toString());
        e.target.value = mins.toString();
      }
      trigger([
        `${name}durationMinutes`,
        `${name}durationHours`,
        `${name}durationDays`,
      ]);
      onChange(e);
    },
    [getValues, name, setValue, trigger]
  );

  /*************************************************
   *                      Render                   *
   *************************************************/
  return (
    <DurationContainer>
      <Controller
        name={`${name}durationMinutes`}
        control={control}
        defaultValue={`${defaults.mins}`}
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
              value={value}
              onBlur={onBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleMinutesChanged(e, onChange)
              }
              placeholder={'0'}
              min="0"
              {...(maxDurationDays && maxDurationDays === durationDays
                ? {disabled: true}
                : {disabled: false})}
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
              value={value}
              onBlur={onBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleHoursChanged(e, onChange)
              }
              placeholder={'0'}
              min="0"
              {...(maxDurationDays && maxDurationDays === durationDays
                ? {disabled: true}
                : {disabled: false})}
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
              value={value}
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
