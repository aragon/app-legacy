import {
  AlertInline,
  ButtonWallet,
  DropdownInput,
  Label,
  TextareaSimple,
  ValueInput,
} from '@aragon/ui-components';
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import styled from 'styled-components';
import {utils} from 'ethers';
import {useTranslation} from 'react-i18next';
import {useApolloClient} from '@apollo/client';
import React, {useCallback, useEffect} from 'react';

import {useWallet} from 'hooks/useWallet';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {fetchTokenData} from 'services/prices';
import {useGlobalModalContext} from 'context/globalModals';
import {handleClipboardActions} from 'utils/library';
import {fetchBalance, getTokenInfo, isNativeToken} from 'utils/tokens';
import {validateTokenAddress, validateTokenAmount} from 'utils/validators';
import {CHAIN_METADATA} from 'utils/constants';
import {useAlertContext} from 'context/alert';

const DepositForm: React.FC = () => {
  const client = useApolloClient();
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {network} = useNetwork();
  const {address, balance: walletBalance} = useWallet();
  const {infura: provider} = useProviders();
  const {control, resetField, setValue, setFocus, trigger, getValues} =
    useFormContext();
  const {alert} = useAlertContext();
  const {errors, dirtyFields} = useFormState({control});
  const [daoAddress, tokenAddress, isCustomToken, tokenBalance, tokenSymbol] =
    useWatch({
      name: [
        'to',
        'tokenAddress',
        'isCustomToken',
        'tokenBalance',
        'tokenSymbol',
      ],
    });
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    if (isCustomToken) setFocus('tokenAddress');
  }, [isCustomToken, setFocus]);

  useEffect(() => {
    if (!address || !isCustomToken || !tokenAddress) return;

    const fetchTokenInfo = async () => {
      if (errors.tokenAddress !== undefined) {
        if (dirtyFields.amount) trigger(['amount', 'tokenSymbol']);
        return;
      }

      try {
        // fetch token balance and token metadata
        const allTokenInfoPromise = Promise.all([
          isNativeToken(tokenAddress)
            ? utils.formatEther(walletBalance || 0)
            : fetchBalance(tokenAddress, address, provider, nativeCurrency),
          fetchTokenData(tokenAddress, client, network),
        ]);

        // use blockchain if api data unavailable
        const [balance, data] = await allTokenInfoPromise;
        if (data) {
          setValue('tokenName', data.name);
          setValue('tokenSymbol', data.symbol);
          setValue('tokenImgUrl', data.imgUrl);
        } else {
          const {name, symbol} = await getTokenInfo(
            tokenAddress,
            provider,
            nativeCurrency
          );
          setValue('tokenName', name);
          setValue('tokenSymbol', symbol);
        }
        setValue('tokenBalance', balance);
      } catch (error) {
        /**
         * Error is intentionally swallowed. Passing invalid address will
         * return error, but should not be thrown.
         * Also, double safeguard. Should not actually fall into here since
         * tokenAddress should be valid in the first place for balance to be fetched.
         */
        console.error(error);
      }
      if (dirtyFields.amount) trigger(['amount', 'tokenSymbol']);
    };

    fetchTokenInfo();
  }, [
    address,
    dirtyFields.amount,
    errors.tokenAddress,
    isCustomToken,
    provider,
    setValue,
    tokenAddress,
    trigger,
    walletBalance,
    client,
    network,
    nativeCurrency,
  ]);

  /*************************************************
   *                Field Validators               *
   *************************************************/
  const addressValidator = useCallback(
    async (address: string) => {
      if (isNativeToken(address)) return true;

      const validationResult = await validateTokenAddress(address, provider);

      // address invalid, reset token fields
      if (validationResult !== true) {
        resetField('tokenName');
        resetField('tokenImgUrl');
        resetField('tokenSymbol');
        resetField('tokenBalance');
      }

      return validationResult;
    },
    [provider, resetField]
  );

  const amountValidator = useCallback(
    async (amount: string) => {
      const [tokenAddress, tokenBalance] = getValues([
        'tokenAddress',
        'tokenBalance',
      ]);

      // check if a token is selected using it's address
      if (tokenAddress === '') return t('errors.noTokenSelected');

      // check if token selected is valid
      if (errors.tokenAddress) return t('errors.amountWithInvalidToken');

      try {
        const {decimals} = await getTokenInfo(
          tokenAddress,
          provider,
          nativeCurrency
        );

        // run amount rules
        return validateTokenAmount(amount, decimals, tokenBalance);
      } catch (error) {
        // catches miscellaneous cases such as not being able to get token decimal
        console.error('Error validating amount', error);
        return t('errors.defaultAmountValidationError');
      }
    },
    [errors.tokenAddress, getValues, provider, t, nativeCurrency]
  );

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleMaxClicked = useCallback(
    (onChange: React.ChangeEventHandler<HTMLInputElement>) => {
      const tokenBalance = getValues('tokenBalance');

      if (tokenBalance !== '') {
        onChange(tokenBalance);
      }
    },
    [getValues]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      <FormItem>
        <Label
          label={t('labels.recipient')}
          helpText={t('newDeposit.toSubtitle')}
        />

        {/* TODO: Proper DAO address */}
        <ButtonWallet
          label={daoAddress}
          src={daoAddress}
          isConnected
          disabled
        />
      </FormItem>

      {/* Select token */}
      <FormItem>
        <Label
          label={t('labels.token')}
          helpText={t('newDeposit.tokenSubtitle')}
        />
        <Controller
          name="tokenSymbol"
          control={control}
          rules={{required: t('errors.required.token')}}
          render={({field: {name, value}, fieldState: {error}}) => (
            <>
              <DropdownInput
                name={name}
                mode={error ? 'critical' : 'default'}
                value={value}
                onClick={() => open('token')}
                placeholder={t('placeHolders.selectToken')}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Custom token address */}
      {isCustomToken && (
        <FormItem>
          <Label
            label={t('labels.address')}
            helpText={t('newDeposit.contractAddressSubtitle')}
          />
          <Controller
            name="tokenAddress"
            control={control}
            rules={{
              required: t('errors.required.tokenAddress'),
              validate: addressValidator,
            }}
            render={({
              field: {name, onBlur, onChange, value, ref},
              fieldState: {error},
            }) => (
              <>
                <ValueInput
                  mode={error ? 'critical' : 'default'}
                  ref={ref}
                  name={name}
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  adornmentText={value ? t('labels.copy') : t('labels.paste')}
                  onAdornmentClick={() =>
                    handleClipboardActions(value, onChange, alert)
                  }
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </>
            )}
          />
        </FormItem>
      )}

      {/* Token amount */}
      <FormItem>
        <Label
          label={t('labels.tokenAmount')}
          helpText={t('newDeposit.amountSubtitle')}
        />
        <Controller
          name="amount"
          control={control}
          rules={{
            required: t('errors.required.amount'),
            validate: amountValidator,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <StyledInput
                mode={error ? 'critical' : 'default'}
                name={name}
                type="number"
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                adornmentText={t('labels.max')}
                onAdornmentClick={() => handleMaxClicked(onChange)}
              />
              <div className="flex justify-between">
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}

                {!error?.message && tokenBalance && (
                  <TokenBalance>
                    {`${t('labels.maxBalance')}: ${tokenBalance.slice(
                      0,
                      6
                    )} ${tokenSymbol}`}
                  </TokenBalance>
                )}
              </div>
            </>
          )}
        />
      </FormItem>

      {/* Token reference */}
      <FormItem>
        <Label
          label={t('labels.description')}
          helpText={t('newDeposit.referenceSubtitle')}
          isOptional={true}
        />
        <Controller
          name="reference"
          control={control}
          render={({field: {name, onBlur, onChange, value}}) => (
            <TextareaSimple
              name={name}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
            />
          )}
        />
      </FormItem>
    </>
  );
};

export default DepositForm;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const TokenBalance = styled.p.attrs({
  className: 'flex-1 px-1 text-xs text-right text-ui-600',
})``;

const StyledInput = styled(ValueInput)`
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;
