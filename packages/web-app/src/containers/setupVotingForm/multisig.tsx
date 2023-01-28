import {AlertInline, CheckboxListItem, Label} from '@aragon/ui-components';
import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import DateTimeSelector from 'containers/dateTimeSelector';
import Duration from 'containers/duration';
import {FormSection} from '.';

const SetupMultisigVotingForm: React.FC = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();

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
              {value === 'date' && <DateTimeSelector />}
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
                <Duration name="expiration" />
              ) : (
                <DateTimeSelector />
              )}
            </>
          )}
        />
        <AlertInline
          mode="neutral"
          label={t('newWithdraw.setupVoting.multisig.expirationAlert')}
        />
      </FormSection>
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
  className: 'flex gap-x-3',
})``;

const ToggleCheckListItemWrapper = styled.div.attrs({className: 'flex-1'})``;
