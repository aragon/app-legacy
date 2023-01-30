import {AlertInline, CheckboxListItem, Label} from '@aragon/ui-components';
import React from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import DateTimeSelector from 'containers/dateTimeSelector';
import Duration from 'containers/duration';
import {FormSection} from '.';
import {
  MULTISIG_MAX_DURATION_DAYS,
  MULTISIG_MIN_DURATION_HOURS,
} from 'utils/constants';

const SetupMultisigVotingForm: React.FC = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();
  const [durationDays, durationHours, durationMinutes] = useWatch({
    control,
    name: ['durationDays', 'durationHours', 'durationMinutes'],
  });

  const isMinDuration =
    durationDays === '0' &&
    durationHours === MULTISIG_MIN_DURATION_HOURS.toString() &&
    durationMinutes === '0';

  const isMaxDuration = Number(durationDays) >= MULTISIG_MAX_DURATION_DAYS;

  const startItems = [
    {label: t('newWithdraw.setupVoting.multisig.now'), selectValue: 'now'},
    {
      label: t('newWithdraw.setupVoting.multisig.dateTime'),
      selectValue: 'date',
    },
  ];

  const expirationItems = [
    {
      label: t('newWithdraw.setupVoting.multisig.duration'),
      selectValue: 'duration',
    },
    {
      label: t('newWithdraw.setupVoting.multisig.dateTime'),
      selectValue: 'date',
    },
  ];

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  function handleCheckBoxToggled(
    changeValue: string,
    onChange: (value: string) => void
  ) {
    onChange(changeValue);
  }

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
          name="startNow"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="now"
          render={({field: {onChange, value}}) => (
            <>
              <ToggleCheckList
                items={startItems}
                value={value}
                onChange={changeValue =>
                  handleCheckBoxToggled(changeValue, onChange)
                }
              />
              {value === 'date' && <DateTimeSelector name="start" />}
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
                onChange={changeValue =>
                  handleCheckBoxToggled(changeValue, onChange)
                }
              />
              {value === 'duration' ? (
                <>
                  <Duration
                    defaultValues={{days: 5}}
                    minDurationHours={MULTISIG_MIN_DURATION_HOURS}
                  />
                  <DurationLabel
                    maxDuration={isMaxDuration}
                    minDuration={isMinDuration}
                  />
                </>
              ) : (
                <DateTimeSelector name="expiration" />
              )}
            </>
          )}
        />
      </FormSection>
    </>
  );
};

export default SetupMultisigVotingForm;

const DurationLabel: React.FC<{maxDuration?: boolean; minDuration?: boolean}> =
  ({maxDuration, minDuration}) => {
    const {t} = useTranslation();

    if (minDuration) {
      return (
        <AlertInline label={t('alert.minExpirationAlert')} mode="critical" />
      );
    } else if (maxDuration) {
      return (
        <AlertInline label={t('alert.maxExpirationAlert')} mode="warning" />
      );
    } else {
      return (
        <AlertInline
          mode="neutral"
          label={t('newWithdraw.setupVoting.multisig.expirationAlert')}
        />
      );
    }
  };

type Props = {
  items: Array<{
    label: string;
    selectValue: string;
  }>;

  value: string;
  onChange: (value: string) => void;
};

const ToggleCheckList: React.FC<Props> = ({onChange, items, value}) => {
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
