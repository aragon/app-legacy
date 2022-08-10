import {
  AlertInline,
  DropdownInput,
  Label,
  ValueInput,
} from '@aragon/ui-components';

import {
  Controller,
  FormState,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect} from 'react';
import {useApolloClient} from '@apollo/client';

import {
  validateAddress,
  validateTokenAddress,
  validateTokenAmount,
} from 'utils/validators';
import {useWallet} from 'hooks/useWallet';
import {useProviders} from 'context/providers';
import {fetchTokenData} from 'services/prices';
import {useGlobalModalContext} from 'context/globalModals';
import {handleClipboardActions} from 'utils/library';
import {fetchBalance, getTokenInfo, isNativeToken} from 'utils/tokens';
import {WithdrawAction} from 'pages/newWithdraw';
import {isAddress} from 'ethers/lib/utils';
import {useNetwork} from 'context/network';
import {useDaoParam} from 'hooks/useDaoParam';
import {CHAIN_METADATA} from 'utils/constants';

type ConfigureWithdrawFormProps = {
  index?: number;
  setActionsCounter?: (index: number) => void;
};

const ConfigureWithdrawForm: React.FC<ConfigureWithdrawFormProps> = ({
  index = 0,
  setActionsCounter,
}) => {
  const {t} = useTranslation();
  const client = useApolloClient();
  const {open} = useGlobalModalContext();
  const {network} = useNetwork();
  const {address} = useWallet();
  const {infura: provider} = useProviders();
  const {data: daoAddress} = useDaoParam();

  const {control, getValues, trigger, resetField, setFocus, setValue} =
    useFormContext();

  const {errors, dirtyFields} = useFormState({control});
  const [name, from, tokenAddress, isCustomToken, tokenBalance, symbol] =
    useWatch({
      name: [
        `actions.${index}.name`,
        `actions.${index}.from`,
        `actions.${index}.tokenAddress`,
        `actions.${index}.isCustomToken`,
        `actions.${index}.tokenBalance`,
        `actions.${index}.tokenSymbol`,
      ],
    });
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    if (isCustomToken) setFocus(`actions.${index}.tokenAddress`);

    if (from === '') {
      setValue(`actions.${index}.from`, daoAddress);
    }
  }, [
    address,
    daoAddress,
    from,
    index,
    isCustomToken,
    setFocus,
    setValue,
    nativeCurrency,
  ]);

  useEffect(() => {
    if (!name) {
      setValue(`actions.${index}.name`, 'withdraw_assets');
    }
  }, [index, name, setValue]);

  // Fetch custom token information
  useEffect(() => {
    if (!address || !isCustomToken || !tokenAddress) return;

    const fetchTokenInfo = async () => {
      if (errors.tokenAddress !== undefined) {
        if (dirtyFields.amount)
          trigger([`actions.${index}.amount`, `actions.${index}.tokenSymbol`]);
        return;
      }

      try {
        // fetch token balance and token metadata
        const allTokenInfoPromise = Promise.all([
          isNativeToken(tokenAddress)
            ? provider.getBalance(daoAddress)
            : fetchBalance(tokenAddress, daoAddress, provider, nativeCurrency),
          fetchTokenData(tokenAddress, client, network),
        ]);

        // use blockchain if api data unavailable
        const [balance, data] = await allTokenInfoPromise;
        if (data) {
          setValue(`actions.${index}.tokenName`, data.name);
          setValue(`actions.${index}.tokenSymbol`, data.symbol);
          setValue(`actions.${index}.tokenImgUrl`, data.imgUrl);
          setValue(`actions.${index}.tokenPrice`, data.price);
        } else {
          const {name, symbol} = await getTokenInfo(
            tokenAddress,
            provider,
            nativeCurrency
          );
          setValue(`actions.${index}.tokenName`, name);
          setValue(`actions.${index}.tokenSymbol`, symbol);
        }
        setValue(`actions.${index}.tokenBalance`, balance);
      } catch (error) {
        /**
         * Error is intentionally swallowed. Passing invalid address will
         * return error, but should not be thrown.
         * Also, double safeguard. Should not actually fall into here since
         * tokenAddress should be valid in the first place for balance to be fetched.
         */
        console.error(error);
      }
      if (dirtyFields.amount)
        trigger([`actions.${index}.amount`, `actions.${index}.tokenSymbol`]);
    };

    fetchTokenInfo();
  }, [
    address,
    dirtyFields.amount,
    errors.tokenAddress,
    index,
    isCustomToken,
    provider,
    setValue,
    tokenAddress,
    trigger,
    client,
    network,
    daoAddress,
    nativeCurrency,
  ]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const renderWarning = useCallback(
    (value: string) => {
      // Insufficient data to calculate warning
      if (!tokenBalance || value === '') return null;

      if (Number(value) > Number(tokenBalance))
        return (
          <AlertInline label={t('warnings.amountGtDaoToken')} mode="warning" />
        );
    },
    [tokenBalance, t]
  );

  const handleAdornmentClick = useCallback(
    (value: string, onChange: (value: string) => void) => {
      // when there is a value clear it
      if (value) onChange('');
      else handleClipboardActions(value, onChange);
    },
    []
  );

  /*************************************************
   *                Field Validators               *
   *************************************************/
  const addressValidator = useCallback(
    async (address: string) => {
      if (isNativeToken(address)) return true;

      const validationResult = await validateTokenAddress(address, provider);

      // address invalid, reset token fields
      if (validationResult !== true) {
        resetField(`actions.${index}.tokenName`);
        resetField(`actions.${index}.tokenImgUrl`);
        resetField(`actions.${index}.tokenSymbol`);
        resetField(`actions.${index}.tokenBalance`);
      }

      return validationResult;
    },
    [index, provider, resetField]
  );

  const amountValidator = useCallback(
    async (amount: string) => {
      const tokenAddress = getValues(`actions.${index}.tokenAddress`);

      // check if a token is selected using its address
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
        return validateTokenAmount(amount, decimals);
      } catch (error) {
        // catches miscellaneous cases such as not being able to get token decimal
        console.error('Error validating amount', error);
        return t('errors.defaultAmountValidationError');
      }
    },
    [errors.tokenAddress, getValues, index, provider, t, nativeCurrency]
  );

  const recipientValidator = useCallback(
    async (recipient: string) => {
      let ensAddress = null;

      try {
        ensAddress = await provider?.resolveName(recipient);
      } catch (err) {
        console.error('Error, fetching ens name', err);

        if (isAddress(recipient)) return validateAddress(recipient);
        return t('errors.ensUnsupported');
      }

      // if no associating ensAddress, assume normal address and not ens name
      if (ensAddress) return true;
      return validateAddress(recipient);
    },
    [provider, t]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      {/* Recipient (to) */}
      <FormItem>
        <Label
          label={t('labels.to')}
          helpText={t('newWithdraw.configureWithdraw.toSubtitle')}
        />
        <Controller
          name={`actions.${index}.to`}
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.recipient'),
            validate: recipientValidator,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <ValueInput
                mode={error ? 'critical' : 'default'}
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder={t('placeHolders.walletOrEns')}
                adornmentText={value ? t('labels.clear') : t('labels.paste')}
                onAdornmentClick={() => handleAdornmentClick(value, onChange)}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Select token */}
      <FormItem>
        <Label
          label={t('labels.token')}
          helpText={t('newWithdraw.configureWithdraw.tokenSubtitle')}
        />
        <Controller
          name={`actions.${index}.tokenSymbol`}
          control={control}
          defaultValue=""
          rules={{required: t('errors.required.token')}}
          render={({field: {name, value}, fieldState: {error}}) => (
            <>
              <DropdownInput
                name={name}
                mode={error ? 'critical' : 'default'}
                value={value}
                onClick={() => {
                  setActionsCounter?.(index);
                  open('token');
                }}
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
            name={`actions.${index}.tokenAddress`}
            control={control}
            defaultValue=""
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
                  adornmentText={value ? t('labels.clear') : t('labels.paste')}
                  onAdornmentClick={() => handleAdornmentClick(value, onChange)}
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
          label={t('labels.amount')}
          helpText={t('newWithdraw.configureWithdraw.amountSubtitle')}
        />
        <Controller
          name={`actions.${index}.amount`}
          control={control}
          defaultValue=""
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
                placeholder="0"
                onBlur={onBlur}
                onChange={onChange}
              />
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  {error?.message && (
                    <AlertInline label={error.message} mode="critical" />
                  )}
                  {renderWarning(value)}
                </div>
                {tokenBalance && (
                  <TokenBalance>
                    {`${t('labels.maxBalance')}: ${tokenBalance} ${symbol}`}
                  </TokenBalance>
                )}
              </div>
            </>
          )}
        />
      </FormItem>
    </>
  );
};

export default ConfigureWithdrawForm;

/**
 * Check if the screen is valid
 * @param dirtyFields List of fields that have been changed
 * @param errors List of fields that have errors
 * @param tokenAddress Token address
 * @returns Whether the screen is valid
 */
export function isValid(
  dirtyFields?: FormState<WithdrawAction>['dirtyFields'],
  errors?: FormState<WithdrawAction>['errors'],
  tokenAddress?: string
) {
  // check if fields are dirty
  if (!dirtyFields?.to || !dirtyFields?.amount || !tokenAddress) return false;

  // check if fields have errors
  if (errors?.to || errors?.amount || errors?.tokenAddress) return false;

  return true;
}

/*************************************************
 *               Styled Components               *
 *************************************************/

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
