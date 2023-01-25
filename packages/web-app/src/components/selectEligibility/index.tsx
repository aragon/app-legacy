import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import styled from 'styled-components';

import {CheckboxListItem, NumberInput} from '@aragon/ui-components';
import {AlertInline} from '@aragon/ui-components';

export const SelectEligibility = () => {
  const {control, getValues, resetField, setValue} = useFormContext();
  const {t} = useTranslation();
  const {tokenTotalSupply} = getValues();
  const [eligibilityType, minimumTokenAmount] = useWatch({
    name: ['eligibilityType', 'minimumTokenAmount'],
    control,
  });

  function eligibilityValidator(value: string) {
    if (value === '') return t('errors.required.amount');
    /**
     * Prevent user from entering 0 because It will makes any wallet eligible
     */
    if (Number(value) === 0) return t('errors.requiredTokenAddressZero');
    /**
     * Prevent user from entering values more than total supply
     */
    if (tokenTotalSupply)
      if (Number(value) > tokenTotalSupply)
        return t('errors.biggerThanTotalSupply');
    return true;
  }

  useEffect(() => {
    setValue('eligibilityTokenAmount', minimumTokenAmount);
  }, [minimumTokenAmount, setValue]);

  /**
   * Current Types like token or anyone are dummies and may refactor later
   * according to SDK method requirements
   */

  return (
    <>
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
                  setValue('eligibilityTokenAmount', minimumTokenAmount);
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
      {eligibilityType === 'anyone' && (
        <AlertInline
          label={t('createDAO.step3.eligibility.anyone.warning')}
          mode="warning"
        />
      )}
    </>
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
