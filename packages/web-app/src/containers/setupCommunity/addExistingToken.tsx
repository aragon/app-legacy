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
import {validateGovernanceTokenAddress, tokenType} from 'utils/validators';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import VerificationCard from 'components/verificationCard';
import {getTokenInfo} from 'utils/tokens';
import {formatUnits} from 'ethers/lib/utils';

export type tokenParams = {
  name?: string;
  symbol?: string;
  type?: string;
  totalSupply?: number;
  totalHolders?: number;
  status?: string;
};

const AddExistingToken: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {control, trigger} = useFormContext();
  const [tokenParams, setTokenParams] = useState<tokenParams>({
    name: '',
    symbol: '',
    type: '',
    totalSupply: 0,
    totalHolders: 0,
  });

  const [existingContractAddress, blockchain] = useWatch({
    name: ['existingContractAddress', 'blockchain'],
  });

  const provider = useSpecificProvider(blockchain.id);

  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  // Trigger address validation on network change
  useEffect(() => {
    if (blockchain.id && existingContractAddress !== '') {
      trigger('existingContractAddress');
    }
  }, [blockchain.id, trigger, nativeCurrency, existingContractAddress]);

  /*************************************************
   *            Functions and Callbacks            *
   *************************************************/
  const addressValidator = useCallback(
    async contractAddress => {
      setTokenParams({status: 'loading'});

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

        setTokenParams({
          name: name,
          symbol: symbol,
          type,
          totalSupply: Number(formatUnits(totalSupply, decimals)),
          totalHolders: 0,
          status:
            type === 'governance-ERC20'
              ? t(
                  'createDAO.step3.existingToken.verificationValueGovernancePositive'
                )
              : t(
                  'createDAO.step3.existingToken.verificationValueGovernanceNegative'
                ),
        });
      }

      return verificationResult;
    },
    [network, provider, t]
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
          name="existingContractAddress"
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.tokenAddress'),
            validate: addressValidator,
          }}
          render={({
            field: {name, value, onBlur, onChange},
            fieldState: {error},
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
              {!error?.message && (
                <VerificationCard {...{tokenParams}} tokenAddress={value} />
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
