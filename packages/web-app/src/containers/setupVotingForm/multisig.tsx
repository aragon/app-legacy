import {Label, CheckboxListItem, AlertInline} from '@aragon/ui-components';
import Duration from 'containers/duration';
import React from 'react';
import {useFormContext, Controller} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {FormSection} from '.';

const SetupMultisigVotingForm: React.FC = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();

  function handleCheckBoxToggled(
    changeValue: string,
    onChange: (value: string) => void
  ) {
    onChange(changeValue);
  }

  const startItems = [
    {label: t('newWithdraw.setupVoting.mulitisg.now'), selectValue: 'now'},
    {
      label: t('newWithdraw.setupVoting.mulitisg.dateTime'),
      selectValue: 'dateTime',
    },
  ];

  const expirationItems = [
    {
      label: t('newWithdraw.setupVoting.mulitisg.duration'),
      selectValue: 'duration',
    },
    {
      label: t('newWithdraw.setupVoting.mulitisg.dateTime'),
      selectValue: 'dateTime',
    },
  ];

  return (
    <>
      {/* Voting Type Selection  */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.optionLabel.title')}
          helpText={t('newWithdraw.setupVoting.mulitisg.optionDescription')}
        />
        <CheckboxListItem
          label={t('newWithdraw.setupVoting.mulitisg.votingOption.label')}
          type="active"
          helptext={t(
            'newWithdraw.setupVoting.mulitisg.votingOption.description'
          )}
          multiSelect={false}
        />
        <AlertInline
          mode="neutral"
          label={t('newWithdraw.setupVoting.mulitisg.votingOption.alert')}
        />
      </FormSection>

      {/* Start time */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.mulitisg.startLabel')}
          helpText={t('newWithdraw.setupVoting.mulitisg.startDescription')}
        />
        <Controller
          name="startNow"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="now"
          render={({field: {onChange, value}}) => (
            <ToggleCheckList
              items={startItems}
              value={value}
              onChange={changeValue =>
                handleCheckBoxToggled(changeValue, onChange)
              }
            />
          )}
        />
      </FormSection>

      {/* Expiration time */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.mulitisg.expiration')}
          helpText={t('newWithdraw.setupVoting.mulitisg.expirationDescription')}
        />
        <Controller
          name="expirationDuration"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="duration"
          render={({field: {onChange, value}}) => (
            <ToggleCheckList
              value={value}
              items={expirationItems}
              onChange={changeValue =>
                handleCheckBoxToggled(changeValue, onChange)
              }
            />
          )}
        />

        <Duration name="expiration" />
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
