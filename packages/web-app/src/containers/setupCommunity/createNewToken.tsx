import {AlertInline, Label, Link, TextInput} from '@aragon/ui-components';
import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import AddWallets from 'components/addWallets';
import {alphaNumericValidator} from 'utils/validators';

const CreateNewToken: React.FC = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();

  return (
    <>
      <DescriptionContainer>
        <Title>{t('labels.mintToken')}</Title>
        <Subtitle>
          {t('createDAO.step3.createTokenHelptext')}
          <Link
            label={t('createDAO.step3.createTokenHelplink')}
            href="https://aragon.org/how-to/mint-dao-governance-tokens"
          />
        </Subtitle>
      </DescriptionContainer>
      <FormItem>
        <Label
          label={t('labels.tokenName')}
          helpText={t('createDAO.step3.nameSubtitle')}
        />

        <Controller
          name="tokenName"
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.tokenName') as string,
            validate: value =>
              alphaNumericValidator(value, t('errors.fields.tokenName')),
          }}
          render={({
            field: {onBlur, onChange, value, name},
            fieldState: {error},
          }) => (
            <>
              <TextInput
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>
      <FormItem>
        <Label
          label={t('labels.tokenSymbol')}
          helpText={t('createDAO.step3.symbolSubtitle')}
        />

        <Controller
          name="tokenSymbol"
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.tokenSymbol') as string,
            validate: value =>
              alphaNumericValidator(value, t('errors.fields.tokenSymbol')),
          }}
          render={({
            field: {onBlur, onChange, value, name},
            fieldState: {error},
          }) => (
            <>
              <TextInput
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>
      <FormItem>
        <DescriptionContainer>
          <Label
            label={t('labels.distributeTokens')}
            helpText={t('createDAO.step3.distributeTokensHelpertext')}
          />
        </DescriptionContainer>
        <AlertInline
          label={t('createDAO.step3.distributionWalletAlertText')}
          mode="neutral"
        />
        <AddWallets />
      </FormItem>
    </>
  );
};

export default CreateNewToken;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const DescriptionContainer = styled.div.attrs({
  className: 'space-y-0.5',
})``;

const Title = styled.p.attrs({className: 'text-lg font-bold text-ui-800'})``;

const Subtitle = styled.p.attrs({className: 'text-ui-600 text-bold'})``;
