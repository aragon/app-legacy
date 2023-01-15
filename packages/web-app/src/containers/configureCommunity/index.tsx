import {AlertInline, Label, NumberInput} from '@aragon/ui-components';
import React, {useCallback, useMemo} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {Trans, useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {HOURS_IN_DAY, MINS_IN_DAY, MINS_IN_HOUR} from 'utils/constants';

const ConfigureCommunity: React.FC = () => {
  const {t} = useTranslation();
  const {control, setValue, getValues} = useFormContext();

  const defaultMinimumParticipation = 51;
  const [
    tokenTotalSupply,
    tokenSymbol,
    membership,
    whitelistWallets,
    minimumParticipation,
  ] = useWatch({
    name: [
      'tokenTotalSupply',
      'tokenSymbol',
      'membership',
      'whitelistWallets',
      'minimumParticipation',
    ],
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
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
          setValue('durationDays', Number(getValues('durationDays')) + days);
        }
      }

      onChange(e);
    },
    [getValues, setValue]
  );

  const handleMinutesChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);

      if (value >= MINS_IN_HOUR) {
        const [oldDays, oldHours] = getValues([
          'durationDays',
          'durationHours',
        ]);

        const totalMins =
          oldDays * MINS_IN_DAY + oldHours * MINS_IN_HOUR + value;

        const {days, hours, mins} = getDaysHoursMins(totalMins);
        setValue('durationDays', days);
        setValue('durationHours', hours);
        e.target.value = mins.toString();
      }

      onChange(e);
    },
    [getValues, setValue]
  );

  const percentageInputValidator = (value: string | number) => {
    return value <= 100 && value >= 0 ? true : t('errors.percentage');
  };

  const minimumParticipationPercent = useMemo(() => {
    return (
      Math.round(
        ((100 *
          Math.ceil(
            ((minimumParticipation || defaultMinimumParticipation) *
              whitelistWallets?.length) /
              100
          )) /
          whitelistWallets?.length) *
          100
      ) / 100
    );
  }, [minimumParticipation, whitelistWallets?.length]);

  /*************************************************
   *                   Render                     *
   *************************************************/
  return (
    <>
      {/* Minimum approval */}
      {membership === 'token' ? (
        <FormItem>
          <Label
            label={t('labels.minimumParticipation')}
            helpText={
              (
                <Trans i18nKey={'createDAO.step4.minimumParticipationSubtitle'}>
                  This is the percentage of voters who need to cast a vote for a
                  vote to be valid. For example, if you set quorum at 10% and
                  only 9% of tokens in the network are cast, the vote is not
                  valid and does not execute.{' '}
                  <strong>
                    Note: your DAO treasury does not count as a voter, so if all
                    your tokens are in your DAO treasury, set this rate at 0%
                    for now and you can change it later.
                  </strong>
                </Trans>
              ) as unknown as string
            }
          />
          <Controller
            name="minimumParticipation"
            control={control}
            defaultValue="15"
            rules={{
              validate: value => percentageInputValidator(value),
            }}
            render={({
              field: {onBlur, onChange, value, name},
              fieldState: {error},
            }) => (
              <>
                <ApprovalWrapper>
                  <FormWrapper>
                    <NumberInput
                      name={name}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      placeholder={t('placeHolders.daoName')}
                      view="percentage"
                    />
                  </FormWrapper>
                  <AlertInline
                    label={t('createDAO.step4.alerts.minimumApprovalAlert', {
                      amount: Math.round(tokenTotalSupply * (value / 100)),
                      symbol: tokenSymbol?.toUpperCase(),
                    })}
                    mode="neutral"
                  />
                </ApprovalWrapper>
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </>
            )}
          />
        </FormItem>
      ) : (
        <FormItem>
          <Label
            label={t('labels.minimumParticipation')}
            helpText={
              (
                <Trans i18nKey={'createDAO.step4.minimumParticipationSubtitle'}>
                  This is the percentage of voters who need to cast a vote for a
                  vote to be valid. For example, if you set quorum at 10% and
                  only 9% of tokens in the network are cast, the vote is not
                  valid and does not execute.{' '}
                  <strong>
                    Note: your DAO treasury does not count as a voter, so if all
                    your tokens are in your DAO treasury, set this rate at 0%
                    for now and you can change it later.
                  </strong>
                </Trans>
              ) as unknown as string
            }
          />
          <Controller
            name="minimumParticipation"
            control={control}
            defaultValue={defaultMinimumParticipation}
            rules={{
              validate: value => percentageInputValidator(value),
            }}
            render={({
              field: {onBlur, onChange, value, name},
              fieldState: {error},
            }) => (
              <>
                <ApprovalWrapper>
                  <FormWrapper>
                    <NumberInput
                      name={name}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      placeholder={t('placeHolders.daoName')}
                      view="percentage"
                    />
                  </FormWrapper>
                  <AlertInline
                    label={t(
                      'createDAO.step4.alerts.minimumParticipationAlert',
                      {
                        percentage: minimumParticipationPercent,
                        walletCount: Math.ceil(
                          (value * whitelistWallets?.length) / 100
                        ),
                      }
                    )}
                    mode="neutral"
                  />
                </ApprovalWrapper>
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </>
            )}
          />
        </FormItem>
      )}

      {/* Support */}
      <FormItem>
        <Label
          label={t('labels.approvalThreshold')}
          helpText={t('createDAO.step4.minimumApprovalSubtitle')}
        />

        <Controller
          name="minimumApproval"
          control={control}
          defaultValue="50"
          rules={{
            validate: value => percentageInputValidator(value),
          }}
          render={({
            field: {onBlur, onChange, value, name},
            fieldState: {error},
          }) => (
            <>
              <FormWrapper>
                <NumberInput
                  name={name}
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder={t('placeHolders.daoName')}
                  view="percentage"
                />
              </FormWrapper>
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Duration */}
      <FormItem>
        <Label
          label={t('labels.minimumDuration')}
          helpText={t('createDAO.step4.durationSubtitle')}
        />
        <DurationContainer>
          <Controller
            name="durationDays"
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
                  onChange={onChange}
                  placeholder={'0'}
                  min="0"
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </TimeLabelWrapper>
            )}
          />

          <Controller
            name="durationHours"
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
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </TimeLabelWrapper>
            )}
          />

          <Controller
            name="durationMinutes"
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
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </TimeLabelWrapper>
            )}
          />
        </DurationContainer>
        <AlertInline
          label={t('alert.durationAlert') as string}
          mode="neutral"
        />
      </FormItem>
    </>
  );
};

export default ConfigureCommunity;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const FormWrapper = styled.div.attrs({
  className: 'w-1/2 tablet:w-1/3 pr-1.5',
})``;

const ApprovalWrapper = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-2',
})``;

const DurationContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-1.5',
})``;

const TimeLabelWrapper = styled.div.attrs({
  className: 'w-1/2 tablet:w-full space-y-0.5',
})``;

const TimeLabel = styled.span.attrs({
  className: 'text-sm font-bold text-ui-800',
})``;

function getDaysHoursMins(value: number, period: 'hours' | 'mins' = 'mins') {
  if (period === 'mins') {
    return {
      days: Math.floor(value / MINS_IN_DAY),
      hours: Math.floor((value / MINS_IN_HOUR) % HOURS_IN_DAY),
      mins: value % MINS_IN_HOUR,
    };
  } else
    return {
      days: Math.floor(value / HOURS_IN_DAY),
      hours: value % HOURS_IN_DAY,
      mins: 0,
    };
}
