import {InputValue, Label} from '@aragon/ods-old';
import {formatUnits} from 'ethers/lib/utils';
import React, {useCallback, useEffect} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {SelectEligibility} from 'components/selectEligibility';

import VerificationCard from 'components/verificationCard';
import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useNetwork} from 'context/network';
import {useSpecificProvider} from 'context/providers';
import {CHAIN_METADATA} from 'utils/constants';
import {htmlIn} from 'utils/htmlIn';
import {Web3Address} from 'utils/library';
import {getTokenInfo} from 'utils/tokens';
import {validateGovernanceTokenAddress} from 'utils/validators';
import {usePluginClient} from 'hooks/usePluginClient';
import {TokenVotingClient} from '@aragon/sdk-client';

const AddExistingToken: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {control, trigger, clearErrors, setValue, resetField} =
    useFormContext();

  const [tokenAddress, blockchain, tokenType] = useWatch({
    name: ['tokenAddress', 'blockchain', 'tokenType'],
  });

  // non-null assertion because blockchain comes from the list of
  // supported chains
  const provider = useSpecificProvider(blockchain.id)!;
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;
  const tokenAddressBlockExplorerURL =
    CHAIN_METADATA[network].explorer + 'token/';

  // get plugin Client
  const pluginClient = usePluginClient('token-voting.plugin.dao.eth');

  // Trigger address validation on network change
  useEffect(() => {
    if (blockchain.id && tokenAddress.address !== '') {
      trigger('tokenAddress');
    }
  }, [blockchain.id, trigger, nativeCurrency, tokenAddress]);

  /*************************************************
   *            Functions and Callbacks            *
   *************************************************/
  const addressValidator = useCallback(
    async (value: InputValue) => {
      clearErrors('tokenAddress');
      resetField('tokenType');
      resetField('tokenName');
      resetField('tokenTotalSupply');

      const tokenContract = new Web3Address(
        provider,
        value.address,
        value.ensName
      );

      const {verificationResult, type} = await validateGovernanceTokenAddress(
        tokenContract.address as string,
        provider,
        pluginClient as TokenVotingClient
      );

      if (verificationResult === true) {
        if (type !== 'Unknown') {
          const {totalSupply, decimals, symbol, name} = await getTokenInfo(
            tokenContract.address as string,
            provider,
            CHAIN_METADATA[network].nativeCurrency
          );

          setValue('tokenName', name, {shouldDirty: true});
          setValue('tokenSymbol', symbol, {shouldDirty: true});
          setValue('tokenDecimals', decimals, {shouldDirty: true});
          setValue(
            'tokenTotalSupply',
            Number(formatUnits(totalSupply, decimals)),
            {shouldDirty: true}
          );
        }
        setValue('tokenType', type);
      }

      return verificationResult;
    },
    [clearErrors, network, pluginClient, provider, resetField, setValue]
  );

  const isAllowedToConfigureVotingEligibility =
    tokenType === 'ERC-20' || tokenType === 'governance-ERC20';

  return (
    <>
      <DescriptionContainer>
        <Title>{t('createDAO.step3.existingToken.title')}</Title>
        <Subtitle
          dangerouslySetInnerHTML={{
            __html: htmlIn(t)('createDAO.step3.existingToken.description'),
          }}
        />
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
          defaultValue={{address: '', ensName: ''}}
          rules={{
            required: t('errors.required.tokenAddress'),
            validate: addressValidator,
          }}
          render={({
            field: {name, value, onBlur, onChange},
            fieldState: {error, isDirty},
          }) => (
            <>
              <WrappedWalletInput
                name={name}
                state={error && 'critical'}
                value={value}
                onBlur={onBlur}
                placeholder={'0x…'}
                onChange={onChange}
                error={error?.message}
                blockExplorerURL={tokenAddressBlockExplorerURL}
              />
              {!error?.message && isDirty && value.address && (
                <VerificationCard tokenAddress={value.address} />
              )}
            </>
          )}
        />
      </FormItem>
      {isAllowedToConfigureVotingEligibility && (
        <FormItem>
          <SelectEligibility />
        </FormItem>
      )}
    </>
  );
};

export default AddExistingToken;

const FormItem = styled.div.attrs({
  className: 'space-y-3',
})``;

const DescriptionContainer = styled.div.attrs({
  className: 'space-y-1',
})``;

const Title = styled.p.attrs({
  className: 'text-xl leading-normal font-semibold text-neutral-800',
})``;

const Subtitle = styled.p.attrs({className: 'text-neutral-600 text-bold'})``;
