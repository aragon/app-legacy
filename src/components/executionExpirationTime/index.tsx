import React, {useCallback} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {AlertInline, NumberInput} from '@aragon/ods-old';
import {
  COMMITTEE_EXECUTION_MAX_DURATION_DAYS,
  COMMITTEE_EXECUTION_MIN_DURATION_HOURS,
  HOURS_IN_DAY,
  MINS_IN_DAY,
  MINS_IN_HOUR,
} from 'utils/constants';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {getDaysHoursMins} from '../../utils/date';

const ExecutionExpirationTime: React.FC = () => {
  const {control, setValue, trigger, getValues} = useFormContext();
  const {t} = useTranslation();

  const [
    executionExpirationMinutes,
    executionExpirationHours,
    executionExpirationDays,
  ] = useWatch({
    name: [
      'executionExpirationMinutes',
      'executionExpirationHours',
      'executionExpirationDays',
    ],
  });

  const handleDaysChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      if (value >= COMMITTEE_EXECUTION_MAX_DURATION_DAYS) {
        e.target.value = COMMITTEE_EXECUTION_MAX_DURATION_DAYS.toString();

        setValue(
          'executionExpirationDays',
          COMMITTEE_EXECUTION_MAX_DURATION_DAYS.toString()
        );
        setValue('executionExpirationHours', '0');
        setValue('executionExpirationMinutes', '0');
      } else if (
        value === 0 &&
        (executionExpirationHours === undefined ||
          executionExpirationHours === '0')
      ) {
        setValue(
          'executionExpirationHours',
          COMMITTEE_EXECUTION_MIN_DURATION_HOURS.toString()
        );
      }
      trigger([
        'executionExpirationMinutes',
        'executionExpirationHours',
        'executionExpirationDays',
      ]);
      onChange(e);
    },
    [executionExpirationHours, setValue, trigger]
  );

  const handleHoursChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      if (value >= HOURS_IN_DAY) {
        const {days, hours} = getDaysHoursMins(value, 'hours');
        e.target.value = hours.toString();

        if (days > 0) {
          setValue(
            'executionExpirationDays',
            (Number(getValues('executionExpirationDays')) + days).toString()
          );
        }
      } else if (value === 0 && executionExpirationDays === '0') {
        setValue(
          'executionExpirationHours',
          COMMITTEE_EXECUTION_MIN_DURATION_HOURS.toString()
        );
        setValue('executionExpirationMinutes', '0');
        e.target.value = COMMITTEE_EXECUTION_MIN_DURATION_HOURS.toString();
      }
      trigger([
        'executionExpirationMinutes',
        'executionExpirationHours',
        'executionExpirationDays',
      ]);
      onChange(e);
    },
    [executionExpirationDays, getValues, setValue, trigger]
  );

  const handleMinutesChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);

      if (value >= MINS_IN_HOUR) {
        const [oldDays, oldHours] = getValues([
          'executionExpirationDays',
          'executionExpirationHours',
        ]);

        const totalMins =
          oldDays * MINS_IN_DAY + oldHours * MINS_IN_HOUR + value;

        const {days, hours, mins} = getDaysHoursMins(totalMins);
        setValue('executionExpirationDays', days.toString());
        setValue('executionExpirationHours', hours.toString());
        e.target.value = mins.toString();
      }
      trigger([
        'executionExpirationMinutes',
        'executionExpirationHours',
        'executionExpirationDays',
      ]);
      onChange(e);
    },
    [getValues, setValue, trigger]
  );

  return (
    <>
      <DurationContainer>
        <Controller
          name="executionExpirationMinutes"
          control={control}
          defaultValue="0"
          rules={{
            required: t('errors.emptyDistributionMinutes'),
            validate: value =>
              value <= 59 && value >= 0
                ? true
                : t('errors.distributionMinutes'),
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
                disabled={
                  executionExpirationDays ===
                  COMMITTEE_EXECUTION_MAX_DURATION_DAYS.toString()
                }
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </TimeLabelWrapper>
          )}
        />

        <Controller
          name="executionExpirationHours"
          control={control}
          defaultValue="0"
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
                disabled={
                  executionExpirationDays ===
                  COMMITTEE_EXECUTION_MAX_DURATION_DAYS.toString()
                }
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </TimeLabelWrapper>
          )}
        />

        <Controller
          name="executionExpirationDays"
          control={control}
          defaultValue="1"
          rules={{
            required: t('errors.emptyDistributionDays'),
            validate: value =>
              value >= 0 ? true : t('errors.distributionDays'),
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
      {executionExpirationDays ===
      COMMITTEE_EXECUTION_MAX_DURATION_DAYS.toString() ? (
        <AlertInline label={t('alert.maxDurationAlert')} mode="warning" />
      ) : executionExpirationDays === '0' &&
        executionExpirationHours ===
          COMMITTEE_EXECUTION_MIN_DURATION_HOURS.toString() &&
        executionExpirationMinutes === '0' ? (
        <AlertInline label={t('alert.minDurationAlert')} mode="warning" />
      ) : (
        <AlertInline label={t('alert.durationAlert')} mode="neutral" />
      )}
    </>
  );
};

export default ExecutionExpirationTime;

const DurationContainer = styled.div.attrs({
  className:
    'flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 p-6 bg-neutral-0 rounded-xl',
})``;

const TimeLabelWrapper = styled.div.attrs({
  className: 'w-full md:w-1/2 space-y-1',
})``;

const TimeLabel = styled.span.attrs({
  className: 'text-sm leading-normal font-semibold text-neutral-800',
})``;
