import React from 'react';
import {CheckboxListItem, Label} from '@aragon/ods-old';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AlertInline} from '@aragon/ods-old';
import useScreen from 'hooks/useScreen';

export type MultisigProposerEligibility = 'multisig' | 'anyone';

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
  className: 'space-y-3',
})``;

const CheckboxItemsContainer = styled.div.attrs({
  className:
    'flex xl:flex-row flex-col xl:gap-4 xl:bg-transparent bg-neutral-0 gap-2 p-4 xl:p-0 rounded-xl',
})``;

const CheckboxContainer = styled.div.attrs({
  className: 'flex space-y-3 flex-col',
})``;

const CheckboxListItemWrapper = styled.div.attrs({
  className: 'flex-1',
})``;
