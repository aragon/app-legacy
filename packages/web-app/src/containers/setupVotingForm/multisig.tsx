import {AlertInline, CheckboxListItem, Label} from '@aragon/ui-components';
import React from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import DateTimeSelector from 'containers/dateTimeSelector';
import {useDateTimeSelectorValidation} from 'containers/dateTimeSelector/useDateTimeSelector';
import Duration, {DurationLabel} from 'containers/duration';
import UtcMenu from 'containers/utcMenu';
import {
  MINS_IN_DAY,
  MULTISIG_MAX_DURATION_DAYS,
  MULTISIG_MIN_DURATION_HOURS,
  MULTISIG_REC_DURATION_DAYS,
} from 'utils/constants';
import {hoursToMills} from 'utils/date';
import {FormSection} from '.';
import {DateTimeErrors} from './dateTimeErrors';

const MAX_DURATION_MILLS = MULTISIG_MAX_DURATION_DAYS * MINS_IN_DAY * 60 * 1000;

const SetupMultisigVotingForm: React.FC = () => {
  const {t} = useTranslation();

  const {control, formState} = useFormContext();
  const [startUtc, endUtc, endTimeWarning] = useWatch({
    control,
    name: ['startUtc', 'endUtc', 'endTimeWarning'],
  });

  const startItems = [
    {label: t('labels.now'), selectValue: 'now'},
    {
      label: t('labels.dateTime'),
      selectValue: 'date',
    },
  ];

  const expirationItems = [
    {
      label: t('labels.duration'),
      selectValue: 'duration',
    },
    {
      label: t('labels.dateTime'),
      selectValue: 'date',
    },
  ];

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const durationAlerts = {
    minDuration: t('alert.multisig.proposalMinDuration'),
    maxDuration: t('alert.multisig.proposalMaxDuration'),
    acceptableDuration: t('alert.multisig.accepTableProposalDuration'),
  };
  const minDurationMills = hoursToMills(MULTISIG_MIN_DURATION_HOURS);

  const {
    dateTimeValidator,
    tzSelector,
    handleUtcClicked,
    handleStartToggle,
    handleEndToggle,
    getDuration,
  } = useDateTimeSelectorValidation(
    minDurationMills,
    t('alert.multisig.dateTimeMinDuration')
  );

  /*************************************************
   *                      Render                   *
   *************************************************/
  return (
    <>
      {/* Voting Type Selection  */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.optionLabel.title')}
          helpText={t('newWithdraw.setupVoting.multisig.optionDescription')}
        />
        <CheckboxListItem
          label={t('newWithdraw.setupVoting.multisig.votingOption.label')}
          type="active"
          helptext={t(
            'newWithdraw.setupVoting.multisig.votingOption.description'
          )}
          multiSelect={false}
        />
        <AlertInline
          mode="neutral"
          label={t('newWithdraw.setupVoting.multisig.votingOption.alert')}
        />
      </FormSection>

      {/* Start time */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.multisig.startLabel')}
          helpText={t('newWithdraw.setupVoting.multisig.startDescription')}
        />
        <Controller
          name="startSwitch"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="now"
          render={({field: {onChange, value}}) => (
            <>
              <ToggleCheckList
                items={startItems}
                value={value}
                onChange={changeValue =>
                  handleStartToggle(changeValue, onChange)
                }
              />
              {value === 'date' && (
                <>
                  <DateTimeSelector
                    mode="start"
                    value={startUtc}
                    defaultDateOffset={{minutes: 10}}
                    validator={dateTimeValidator}
                    onUtcClicked={() => handleUtcClicked('first')}
                  />
                  <DateTimeErrors mode="start" />
                </>
              )}
            </>
          )}
        />
      </FormSection>

      {/* Expiration time */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.multisig.expiration')}
          helpText={t('newWithdraw.setupVoting.multisig.expirationDescription')}
        />
        <Controller
          name="expirationDuration"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="duration"
          render={({field: {onChange, value}}) => (
            <>
              <ToggleCheckList
                value={value}
                items={expirationItems}
                onChange={changeValue => handleEndToggle(changeValue, onChange)}
              />
              {value === 'duration' ? (
                <Duration
                  defaultValues={{days: MULTISIG_REC_DURATION_DAYS}}
                  minDuration={{hours: MULTISIG_MIN_DURATION_HOURS}}
                />
              ) : (
                <>
                  <DateTimeSelector
                    mode="end"
                    value={endUtc}
                    validator={dateTimeValidator}
                    defaultDateOffset={{days: MULTISIG_REC_DURATION_DAYS}}
                    onUtcClicked={() => handleUtcClicked('second')}
                  />
                  <DateTimeErrors mode="end" />
                </>
              )}
              {!endTimeWarning && !formState?.errors?.endDate && (
                <DurationLabel
                  maxDuration={getDuration() === MAX_DURATION_MILLS}
                  minDuration={getDuration() === minDurationMills}
                  alerts={durationAlerts}
                />
              )}
            </>
          )}
        />
      </FormSection>
      <UtcMenu onTimezoneSelect={tzSelector} />
    </>
  );
};

export default SetupMultisigVotingForm;

type Props = {
  items: Array<{
    label: string;
    selectValue: string;
  }>;

  value: string;
  onChange: (value: string) => void;
};

export const ToggleCheckList: React.FC<Props> = ({onChange, items, value}) => {
  return (
    <ToggleCheckListContainer>
      {items.map(item => (
        <ToggleCheckListItemWrapper key={item.label}>
          <CheckboxListItem
            label={item.label}
            multiSelect={false}
            onClick={() => onChange(item.selectValue)}
            type={value === item.selectValue ? 'active' : 'default'}
          />
        </ToggleCheckListItemWrapper>
      ))}
    </ToggleCheckListContainer>
  );
};

const ToggleCheckListContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-1.5 desktop:flex-row desktop:gap-x-3',
})``;

const ToggleCheckListItemWrapper = styled.div.attrs({className: 'flex-1'})``;
