import React from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import styled from 'styled-components';

import {CheckboxListItem, NumberInput} from '@aragon/ui-components';
import {AlertInline} from '@aragon/ui-components';

export const SelectEligibility = () => {
  const {control, getValues, resetField} = useFormContext();
  const {t} = useTranslation();
  const {tokenTotalSupply} = getValues();
  const eligibilityType = useWatch({name: 'eligibilityType', control});

  function eligibilityValidator(value: string) {
    if (value === '') return t('errors.required.amount');
    if (value === '0') return t('errors.requiredTokenAddressZero');
    if (tokenTotalSupply)
      if (Number(value) > tokenTotalSupply)
        return t('errors.biggerThanTotalSupply');
    return true;
  }

  return (
    <Container>
      <Controller
        name="eligibilityType"
        control={control}
        defaultValue={'token'}
        render={({field: {onChange, value}}) => (
          <OptionsContainers>
            <OptionsTitle>
              {t('createDAO.step3.eligibility.optionTitle')}
            </OptionsTitle>
            <CheckboxListItem
              label={t('createDAO.step3.eligibility.tokenHolders.title')}
              helptext={t(
                'createDAO.step3.eligibility.tokenHolders.description'
              )}
              multiSelect={false}
              onClick={() => {
                onChange('token');
              }}
              {...(value === 'token' ? {type: 'active'} : {})}
            />
            <CheckboxListItem
              label={t('createDAO.step3.eligibility.anyone.title')}
              helptext={t('createDAO.step3.eligibility.anyone.description')}
              onClick={() => {
                onChange('anyone');
                resetField('eligibilityTokenAmount');
              }}
              multiSelect={false}
              {...(value === 'anyone' ? {type: 'active'} : {})}
            />
          </OptionsContainers>
        )}
      />
      <Controller
        name="eligibilityTokenAmount"
        control={control}
        defaultValue={0}
        rules={{
          validate: value => eligibilityValidator(value),
        }}
        render={({field: {onChange, value}, fieldState: {error}}) => (
          <OptionsContainers>
            <OptionsTitle>
              {t('createDAO.step3.eligibility.inputTitle')}
            </OptionsTitle>
            <NumberInput
              value={value}
              view="bigger"
              onChange={onChange}
              max={tokenTotalSupply}
              disabled={eligibilityType === 'anyone'}
            />
            {error?.message && (
              <AlertInline label={error.message} mode="critical" />
            )}
          </OptionsContainers>
        )}
      />
    </Container>
  );
};

const Container = styled.div.attrs({
  className:
    'tablet:flex p-2 tablet:p-3 space-y-1 tablet:space-y-0 rounded-xl bg-ui-0 tablet:space-x-3 space-x-0',
})``;

const OptionsContainers = styled.div.attrs({
  className: 'space-y-1 tablet:w-1/2',
})``;

const OptionsTitle = styled.h2.attrs({
  className: 'ft-text-base font-bold text-ui-800',
})``;
