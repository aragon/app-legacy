import React from 'react';
import {CheckboxListItem, Label} from '@aragon/ui-components';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AlertInline} from '@aragon/ui-components';
import useScreen from 'hooks/useScreen';

export const MultisigEligibility = () => {
  const {control} = useFormContext();
  const {t} = useTranslation();
  const {isMobile} = useScreen();
  return (
    <OptionsContainers>
      <TitleContainer>
        <Label
          label={t('createDAO.step3.multisigEligibilityTitle')}
          helpText={t('createDAO.step3.multisigEligibilitySubtitle')}
        />
      </TitleContainer>
      <Controller
        name="eligibilityType"
        control={control}
        defaultValue={'multisig'}
        render={({field: {onChange, value}}) => (
          <CheckboxContainer>
            <CheckboxItemsContainer>
              {isMobile && (
                <Label
                  label={t('createDAO.step3.multisigEligibilityMobileTitle')}
                />
              )}
              <CheckboxListItemWrapper>
                <CheckboxListItem
                  label={t('createDAO.step3.eligibility.multisigMembers.title')}
                  helptext={t(
                    'createDAO.step3.eligibility.multisigMembers.description'
                  )}
                  multiSelect={false}
                  onClick={() => {
                    onChange('multisig');
                  }}
                  {...(value === 'multisig' ? {type: 'active'} : {})}
                />
              </CheckboxListItemWrapper>
              <CheckboxListItemWrapper>
                <CheckboxListItem
                  label={t('createDAO.step3.eligibility.anyWallet.title')}
                  helptext={t(
                    'createDAO.step3.eligibility.anyWallet.description'
                  )}
                  onClick={() => {
                    onChange('anyone');
                  }}
                  multiSelect={false}
                  {...(value === 'anyone' ? {type: 'active'} : {})}
                />
              </CheckboxListItemWrapper>
            </CheckboxItemsContainer>
            {value === 'anyone' && (
              <AlertInline
                label={t('createDAO.step3.multisigEligibilityAlert')}
                mode="critical"
              />
            )}
          </CheckboxContainer>
        )}
      />
    </OptionsContainers>
  );
};

const TitleContainer = styled.div.attrs({
  className: 'flex-col space-y-0.5',
})``;

const OptionsContainers = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const CheckboxItemsContainer = styled.div.attrs({
  className:
    'flex desktop:flex-row flex-col desktop:gap-2 desktop:bg-transparent bg-ui-0 gap-1 p-2 desktop:p-0 rounded-xl',
})``;

const CheckboxContainer = styled.div.attrs({
  className: 'flex space-y-1.5 flex-col',
})``;

const CheckboxListItemWrapper = styled.div.attrs({
  className: 'flex-1',
})``;
