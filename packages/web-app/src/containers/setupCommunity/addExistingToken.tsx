import {
  AlertInline,
  Label,
  Link,
  WalletInputLegacy,
} from '@aragon/ui-components';
import React, {useCallback, useEffect, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useSpecificProvider} from 'context/providers';
import {validateGovernanceTokenAddress} from 'utils/validators';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import VerificationCard from 'components/verificationCard';
import {getTokenInfo} from 'utils/tokens';
import {formatUnits} from 'ethers/lib/utils';

const AddExistingToken: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {control, trigger, clearErrors, setValue, resetField} =
    useFormContext();

  const [tokenAddress, blockchain] = useWatch({
    name: ['tokenAddress', 'blockchain'],
  });

  const provider = useSpecificProvider(blockchain.id);

  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  // Trigger address validation on network change
  useEffect(() => {
    if (blockchain.id && tokenAddress !== '') {
      trigger('tokenAddress');
    }
  }, [blockchain.id, trigger, nativeCurrency, tokenAddress]);

  /*************************************************
   *            Functions and Callbacks            *
   *************************************************/
  const addressValidator = useCallback(
    async contractAddress => {
      clearErrors('tokenAddress');
      resetField('tokenType');

      const {verificationResult, type} = await validateGovernanceTokenAddress(
        contractAddress,
        provider
      );

      if (verificationResult === true) {
        const {totalSupply, decimals, symbol, name} = await getTokenInfo(
          contractAddress,
          provider,
          CHAIN_METADATA[network].nativeCurrency
        );

        setValue('tokenName', name);
        setValue('tokenSymbol', symbol);
        setValue(
          'tokenTotalSupply',
          Number(formatUnits(totalSupply, decimals))
        );
        setValue('tokenType', type);
      }

      return verificationResult;
    },
    [clearErrors, network, provider, resetField, setValue]
  );

  return (
    <>
      <DescriptionContainer>
        <Title>{t('createDAO.step3.existingToken.title')}</Title>
        <Subtitle>
          {t('createDAO.step3.existingToken.description')}
          <Link
            label={t('createDAO.step3.existingToken.descriptionLinkLabel')}
            href=""
          />
          .
        </Subtitle>
      </DescriptionContainer>
      <FormItem>
        <DescriptionContainer>
          <Label label={t('createDAO.step3.existingToken.inputLabel')} />
          <p>
            <span>{t('createDAO.step3.existingToken.inputDescription')}</span>
          </p>
        </DescriptionContainer>
        <Controller
          name="tokenAddress"
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.tokenAddress'),
            validate: addressValidator,
          }}
          render={({
            field: {name, value, onBlur, onChange},
            fieldState: {error, isDirty},
          }) => (
            <>
              <WalletInputLegacy
                name={name}
                // state={error && 'critical'}
                value={value}
                onBlur={onBlur}
                placeholder={'0x…'}
                onChange={onChange}
                // blockExplorerURL={CHAIN_METADATA[network].lookupURL}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
              {!error?.message && isDirty && (
                <VerificationCard tokenAddress={value} />
              )}
            </>
          )}
        />
      </FormItem>
    </>
  );
};

export default AddExistingToken;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const DescriptionContainer = styled.div.attrs({
  className: 'space-y-0.5',
})``;

const Title = styled.p.attrs({className: 'text-lg font-bold text-ui-800'})``;

const Subtitle = styled.p.attrs({className: 'text-ui-600 text-bold'})``;
