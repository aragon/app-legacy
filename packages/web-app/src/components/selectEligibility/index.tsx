import React from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import styled from 'styled-components';

import {DescriptionListContainer} from 'components/descriptionList';
import {CheckboxListItem, NumberInput} from '@aragon/ui-components';

export const SelectEligibility = () => {
  const {control, getValues} = useFormContext();
  const {t} = useTranslation();

  return (
    <Controller
      name="reviewCheck.blockchain"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <Container>
          <TitleContainer>
            <DoTitle>{t('createDAO.step3.eligibility.optionTitle')}</DoTitle>
            <DiTitle>{t('createDAO.step3.eligibility.inputTitle')}</DiTitle>
          </TitleContainer>
          <DlContainer>
            <Dl>
              <Do>
                <CheckboxListItem
                  label={t('createDAO.step3.eligibility.tokenHolders.title')}
                  helptext={t(
                    'createDAO.step3.eligibility.tokenHolders.description'
                  )}
                  multiSelect={false}
                  onClick={() => null}
                  {...(value === 'token' ? {type: 'active'} : {})}
                />
              </Do>
              <Di>
                <NumberInput value={'≥500'} />
              </Di>
            </Dl>
            <Dl>
              <Do>
                <CheckboxListItem
                  label={t('createDAO.step3.eligibility.anyone.title')}
                  helptext={t('createDAO.step3.eligibility.anyone.description')}
                  onClick={() => null}
                  multiSelect={false}
                  {...(value === 'wallet' ? {type: 'active'} : {})}
                />
              </Do>
              <Di></Di>
            </Dl>
          </DlContainer>
        </Container>
      )}
    />
  );
};

const Container = styled.div.attrs({
  className: 'p-2 tablet:p-3 space-y-3 rounded-xl bg-ui-0',
})``;

const Dl: React.FC = ({children}) => (
  <DlContainer>
    <ListItemContainer>{children}</ListItemContainer>
  </DlContainer>
);

const Do: React.FC = ({children}) => <DoContainer>{children}</DoContainer>;

const Di: React.FC = ({children}) => <DiContainer>{children}</DiContainer>;

const DoTitle = styled.h2.attrs({
  className: 'ft-text-base font-bold text-ui-800',
})``;

const DiTitle = styled.h2.attrs({
  className: 'ft-text-base font-bold text-ui-800 tablet:w-1/2',
})``;

const TitleContainer = styled.div.attrs({
  className: 'flex items-center justify-between',
})``;

const DoContainer = styled.dt.attrs({
  className: 'font-bold text-ui-800',
})``;

const DiContainer = styled.dd.attrs({
  className: 'flex-shrink-0 tablet:w-1/2 text-ui-600',
})``;

const DlContainer = styled.dl.attrs({
  className: 'space-y-2',
})``;

const ListItemContainer = styled.div.attrs({
  className:
    'tablet:flex justify-between tablet:space-x-2 space-y-0.5 tablet:space-y-0',
})``;
