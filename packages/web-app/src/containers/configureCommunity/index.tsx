import {
  AlertInline,
  CheckboxListItem,
  Label,
  LinearProgress,
  NumberInput,
  Tag,
} from '@aragon/ui-components';
import React, {useCallback, useMemo} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {Trans, useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {
  MAX_DURATION_DAYS,
  HOURS_IN_DAY,
  MINS_IN_DAY,
  MINS_IN_HOUR,
  MIN_DURATION_HOURS,
} from 'utils/constants';

const ConfigureCommunity: React.FC = () => {
  const {t} = useTranslation();
  const {control, setValue, getValues, trigger} = useFormContext();

  const defaultMinimumParticipation = 51;
  const [
    tokenTotalSupply,
    membership,
    whitelistWallets,
    minimumParticipation,
    earlyExecution,
    durationDays,
    durationHours,
    durationMinutes,
  ] = useWatch({
    name: [
      'tokenTotalSupply',
      'membership',
      'whitelistWallets',
      'minimumParticipation',
      'earlyExecution',
      'durationDays',
      'durationHours',
      'durationMinutes',
    ],
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleDaysChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      if (value >= MAX_DURATION_DAYS) {
        e.target.value = MAX_DURATION_DAYS.toString();

        setValue('durationDays', MAX_DURATION_DAYS.toString());
        setValue('durationHours', '0');
        setValue('durationMinutes', '0');
      } else if (value === 0 && durationHours === '0') {
        setValue('durationHours', MIN_DURATION_HOURS.toString());
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [durationHours, setValue, trigger]
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
            'durationDays',
            (Number(getValues('durationDays')) + days).toString()
          );
        }
      } else if (value === 0 && durationDays === '0') {
        setValue('durationHours', MIN_DURATION_HOURS.toString());
        setValue('durationMinutes', '0');
        e.target.value = MIN_DURATION_HOURS.toString();
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [durationDays, getValues, setValue, trigger]
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
        setValue('durationDays', days.toString());
        setValue('durationHours', hours.toString());
        e.target.value = mins.toString();
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [getValues, setValue, trigger]
  );

  const handleEarlyExecutionChanged = useCallback(
    (value: boolean, onChange: (value: boolean) => void) => {
      if (value && getValues('voteReplacement')) {
        setValue('voteReplacement', false);
      }

      onChange(value);
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
      {/* Support */}
      <FormItem>
        <Label
          label={t('labels.supportThreshold')}
          helpText={t('createDAO.step4.supportThresholdSubtitle')}
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
              <ApprovalContainer>
                <div className="w-1/3">
                  <NumberInput
                    name={name}
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    placeholder={t('placeHolders.daoName')}
                    view="percentage"
                  />
                </div>

                <div className="flex flex-1 items-center">
                  <Tag
                    label={t('labels.yes')}
                    colorScheme="primary"
                    className="mr-1.5 w-6"
                  />

                  <LinearProgressContainer>
                    <LinearProgress max={100} value={value} />
                    <ProgressBarTick />
                    <ProgressInfo1>
                      <p
                        className="font-bold text-right text-primary-500"
                        style={{flexBasis: `${value}%`}}
                      >
                        {value !== '100' ? '≥' : ''}
                        {value}%
                      </p>
                    </ProgressInfo1>
                  </LinearProgressContainer>

                  <Tag label={t('labels.no')} className="ml-1.5 w-6" />
                </div>
              </ApprovalContainer>

              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
              {value < 50 ? (
                <AlertInline
                  label={t('createDAO.step4.alerts.minority')}
                  mode="warning"
                />
              ) : (
                <AlertInline
                  label={t('createDAO.step4.alerts.majority')}
                  mode="success"
                />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Minimum approval */}
      {membership === 'token' ? (
        <FormItem>
          <Label
            label={t('labels.minimumParticipation')}
            helpText={t('createDAO.step4.minimumParticipationSubtitle')}
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
                <ParticipationContainer>
                  <ApprovalWrapper>
                    <div className="w-1/3">
                      <NumberInput
                        name={name}
                        value={value}
                        onBlur={onBlur}
                        onChange={onChange}
                        placeholder={t('placeHolders.daoName')}
                        view="percentage"
                      />
                    </div>

                    <LinearProgressContainer>
                      <LinearProgress
                        max={tokenTotalSupply}
                        value={Math.ceil(tokenTotalSupply * (value / 100))}
                      />

                      <ProgressInfo2>
                        <p
                          className="font-bold text-right text-primary-500"
                          style={{
                            flexBasis: `${
                              (Math.ceil(tokenTotalSupply * (value / 100)) /
                                tokenTotalSupply) *
                              100
                            }%`,
                          }}
                        >
                          {Math.ceil(tokenTotalSupply * (value / 100)) <
                          tokenTotalSupply
                            ? '≥'
                            : ''}
                          {Math.ceil(tokenTotalSupply * (value / 100))}
                        </p>

                        <p className="flex-shrink-0 text-ui-600">
                          {t('createDAO.step4.alerts.minimumApprovalAlert', {
                            amount: Math.round(tokenTotalSupply),
                          })}
                        </p>
                      </ProgressInfo2>
                    </LinearProgressContainer>
                  </ApprovalWrapper>
                </ParticipationContainer>

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

      {/* Duration */}
      <FormItem>
        <Label
          label={t('labels.minimumDuration')}
          helpText={t('createDAO.step4.durationSubtitle')}
        />
        <DurationContainer>
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
                  disabled={durationDays === MAX_DURATION_DAYS.toString()}
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
                  disabled={durationDays === MAX_DURATION_DAYS.toString()}
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </TimeLabelWrapper>
            )}
          />

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
        {durationDays === MAX_DURATION_DAYS.toString() ? (
          <AlertInline
            label={t('alert.maxDurationAlert') as string}
            mode="warning"
          />
        ) : durationDays === '0' &&
          durationHours === MIN_DURATION_HOURS.toString() &&
          durationMinutes === '0' ? (
          <AlertInline
            label={t('alert.minDurationAlert') as string}
            mode="warning"
          />
        ) : (
          <AlertInline
            label={t('alert.durationAlert') as string}
            mode="neutral"
          />
        )}
      </FormItem>

      {/* Early execution */}
      <FormItem>
        <Label
          label={t('labels.earlyExecution')}
          helpText={t('labels.earlyExecutionDescription')}
        />
        <Controller
          name="earlyExecution"
          rules={{required: 'Validate'}}
          control={control}
          render={({field: {onChange, value}}) => (
            <ToggleCheckList
              onChange={changeValue =>
                handleEarlyExecutionChanged(changeValue, onChange)
              }
              value={value as boolean}
            />
          )}
        />
      </FormItem>

      {/* Vote replacement */}
      <FormItem>
        <Label
          label={t('labels.voteReplacement')}
          helpText={t('labels.voteReplacementDescription')}
        />
        <Controller
          name="voteReplacement"
          rules={{required: 'Validate'}}
          control={control}
          render={({field: {onChange, value}}) => (
            <ToggleCheckList
              onChange={onChange}
              value={value as boolean}
              disabled={earlyExecution}
            />
          )}
        />
      </FormItem>
    </>
  );
};

export default ConfigureCommunity;

const ToggleCheckList = ({
  disabled,
  onChange,
  value,
}: {
  disabled?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
}) => {
  const {t} = useTranslation();

  return (
    <ToggleCheckListContainer>
      <ToggleCheckListItemWrapper>
        <CheckboxListItem
          label={t('labels.no')}
          multiSelect={false}
          disabled={disabled}
          onClick={() => onChange(false)}
          type={value ? 'default' : 'active'}
        />
      </ToggleCheckListItemWrapper>

      <ToggleCheckListItemWrapper>
        <CheckboxListItem
          label={t('labels.yes')}
          multiSelect={false}
          disabled={disabled}
          onClick={() => onChange(true)}
          type={value ? 'active' : 'default'}
        />
      </ToggleCheckListItemWrapper>
    </ToggleCheckListContainer>
  );
};

const ToggleCheckListContainer = styled.div.attrs({
  className: 'flex gap-x-3',
})``;

const ToggleCheckListItemWrapper = styled.div.attrs({className: 'flex-1'})``;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const FormWrapper = styled.div.attrs({
  className: 'w-1/2 tablet:w-1/3 pr-1.5',
})``;

const ApprovalWrapper = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-3',
})``;

const DurationContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-1.5 p-3 bg-ui-0 rounded-xl',
})``;

const TimeLabelWrapper = styled.div.attrs({
  className: 'w-1/2 tablet:w-full space-y-0.5',
})``;

const TimeLabel = styled.span.attrs({
  className: 'text-sm font-bold text-ui-800',
})``;

const ApprovalContainer = styled.div.attrs({
  className: 'flex items-center p-3 space-x-3 rounded-xl bg-ui-0',
})``;

const ParticipationContainer = styled.div.attrs({
  className: 'p-3 space-x-3 rounded-xl bg-ui-0',
})``;

const LinearProgressContainer = styled.div.attrs({
  className: 'flex relative flex-1 items-center',
})``;

const ProgressBarTick = styled.div.attrs({
  className:
    'absolute left-1/2 w-1 h-2.5 border-r-2 border-l-2 transform -translate-x-1/2 bg-ui-300 border-ui-0',
})``;

const ProgressInfo1 = styled.div.attrs({
  className:
    'flex absolute -top-2.5 justify-between space-x-0.5 w-full text-sm',
})``;

const ProgressInfo2 = styled.div.attrs({
  className: 'flex absolute -top-1 justify-between space-x-0.5 w-full text-sm',
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
