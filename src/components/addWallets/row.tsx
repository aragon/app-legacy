import {
  Label,
  NumberInput,
  TextInput,
  InputValue as WalletInputValue,
} from '@aragon/ods-old';
import {Button, IconType, AlertInline, Dropdown} from '@aragon/ods';
import Big from 'big.js';
import {constants} from 'ethers';
import React, {useCallback, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useAlertContext} from 'context/alert';
import {useProviders} from 'context/providers';
import {MAX_TOKEN_DECIMALS} from 'utils/constants';
import {Web3Address} from 'utils/library';
import {validateWeb3Address} from 'utils/validators';
import {MultisigWalletField} from 'components/multisigWallets/row';
import {Address, isAddressEqual} from 'viem';

type WalletRowProps = {
  index: number;
  onDelete?: (index: number) => void;
};

export type TokenVotingWalletField = MultisigWalletField & {
  amount: string;
};

const WalletRow: React.FC<WalletRowProps> = ({index, onDelete}) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {api: provider} = useProviders();

  const {control, getValues, setValue, trigger} = useFormContext();
  const walletFieldArray: TokenVotingWalletField[] = useWatch({
    name: 'wallets',
    control,
  });

  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);

  const calculateTotalTokenSupply = useCallback(
    (value: number) => {
      let totalSupply = 0;

      walletFieldArray?.forEach((wallet: TokenVotingWalletField) => {
        if (Number(wallet.amount) > 0) {
          totalSupply = Number(wallet.amount) + totalSupply;
        }
      });

      if (value < 0) return '';

      const CalculateNaN = Math.floor((value / totalSupply) * 100);
      return totalSupply && !isNaN(CalculateNaN) ? CalculateNaN + '%' : '';
    },
    [walletFieldArray]
  );

  const addressValidator = useCallback(
    async ({address, ensName}: WalletInputValue, index: number) => {
      const web3Address = new Web3Address(provider, address, ensName);

      // check if address is valid
      let validationResult = await validateWeb3Address(
        web3Address,
        t('errors.required.walletAddress'),
        t
      );

      // check if address is duplicated
      setIsDuplicate(false);

      const duplicateCheck = walletFieldArray?.some((wallet, walletIndex) => {
        try {
          // check if the address is the same as the current address and address is not null
          const isEnsMatch =
            wallet.ensName === web3Address.ensName &&
            web3Address.ensName !== null;

          const isAddressMatch = isAddressEqual(
            wallet.address as Address,
            web3Address.address as Address
          );

          return (isAddressMatch || isEnsMatch) && walletIndex !== index;
        } catch {
          return false;
        }
      });

      if (duplicateCheck) {
        setIsDuplicate(true);
        validationResult = t('errors.duplicateAddress');
      }

      return validationResult;
    },
    [provider, t, walletFieldArray]
  );

  const amountValidation = useCallback(
    (amount: string) => {
      let totalSupply = 0;
      let minAmount = walletFieldArray[0]?.amount;
      const address = getValues(`wallets.${index}.address`);
      const eligibilityType = getValues('eligibilityType');
      if (address === '') trigger(`wallets.${index}.address`);

      // calculate total token supply disregarding error invalid fields
      walletFieldArray.forEach((wallet: TokenVotingWalletField) => {
        if (Number(wallet.amount) < Number(minAmount)) {
          minAmount = wallet.amount;
        }
        if (Number(wallet.amount) > 0)
          totalSupply = Number(wallet.amount) + totalSupply;
      });
      setValue('tokenTotalSupply', totalSupply);
      if (eligibilityType === 'token')
        setValue('minimumTokenAmount', minAmount);

      // Number of characters after decimal point greater than
      // the number of decimals in the token itself
      if (amount.split('.')[1]?.length > MAX_TOKEN_DECIMALS)
        return t('errors.exceedsFractionalParts', {
          decimals: MAX_TOKEN_DECIMALS,
        });

      // show max amount error
      if (Big(amount).gt(constants.MaxInt256.toString()))
        return t('errors.ltAmount', {amount: '~ 2.69 * 10^49'});

      // show negative amount error
      if (Big(amount).lte(0)) return t('errors.lteZero');
      return totalSupply === 0 ? t('errors.totalSupplyZero') : true;
    },
    [getValues, index, setValue, t, trigger, walletFieldArray]
  );

  const handleOnChange = useCallback(
    // to avoid nesting the InputWallet value, add the existing amount
    // when the value of the address/ens changes
    (e: unknown, onChange: (e: unknown) => void) => {
      onChange({
        ...(e as WalletInputValue),
        amount: walletFieldArray[index].amount,
      });
    },
    [index, walletFieldArray]
  );

  const handleRemoveWallet = useCallback(() => {
    if (typeof onDelete === 'function') {
      const [totalSupply, amount, eligibilityType, eligibilityTokenAmount] =
        getValues([
          'tokenTotalSupply',
          `wallets.${index}.amount`,
          'eligibilityType',
          'eligibilityTokenAmount',
        ]);

      const newTotalSupply = Number(totalSupply) - Number(amount);
      setValue('tokenTotalSupply', newTotalSupply < 0 ? 0 : newTotalSupply);
      onDelete(index);
      if (eligibilityType === 'token') {
        if (eligibilityTokenAmount === amount) {
          let minAmount = walletFieldArray[0]?.amount;
          walletFieldArray.forEach((wallet, mapIndex) => {
            if (mapIndex !== index)
              if (Number(wallet.amount) < Number(minAmount)) {
                minAmount = wallet.amount;
              }
          });
          setValue('minimumTokenAmount', minAmount);
        }
      }
      alert(t('alert.chip.removedAddress') as string);
    }
  }, [alert, getValues, index, onDelete, setValue, t, walletFieldArray]);

  return (
    <Container data-testid="wallet-row">
      <Controller
        defaultValue={{address: '', ensName: ''}}
        name={`wallets.${index}`}
        control={control}
        rules={{validate: value => addressValidator(value, index)}}
        render={({
          field: {name, ref, value, onBlur, onChange},
          fieldState: {error},
        }) => (
          <AddressWrapper>
            <LabelWrapper>
              <Label label={t('labels.whitelistWallets.address')} />
            </LabelWrapper>
            <InputContainer>
              <WrappedWalletInput
                state={error && 'critical'}
                value={value}
                onBlur={onBlur}
                onChange={e => handleOnChange(e, onChange)}
                error={error?.message}
                resolveLabels="onBlur"
                ref={ref}
                name={name}
              />
            </InputContainer>
            {console.log('error', error)}
          </AddressWrapper>
        )}
      />

      <Controller
        name={`wallets.${index}.amount`}
        control={control}
        rules={{
          required: t('errors.required.amount'),
          validate: amountValidation,
        }}
        defaultValue={1}
        render={({field, fieldState: {error}}) => (
          <AmountsWrapper>
            <LabelWrapper>
              <Label label={t('finance.tokens')} />
            </LabelWrapper>

            <NumberInput
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              placeholder="1"
              min={1}
              includeDecimal
              disabled={isDuplicate}
              mode={error?.message ? 'critical' : 'default'}
              value={field.value}
            />

            {error?.message && (
              <ErrorContainer>
                <AlertInline message={error.message} variant="critical" />
              </ErrorContainer>
            )}
          </AmountsWrapper>
        )}
      />

      <Break />

      <PercentageInputDisplayWrapper>
        <LabelWrapper>
          <Label label={t('finance.allocation')} />
        </LabelWrapper>
        <PercentageInputDisplay
          name={`wallets.${index}.amount`}
          value={calculateTotalTokenSupply(
            Number(walletFieldArray[index].amount)
          )}
          mode="default"
          disabled
        />
      </PercentageInputDisplayWrapper>

      <DropdownMenuWrapper>
        {/* Disable index 0 when minting to DAO Treasury is supported */}
        <Dropdown.Container
          align="start"
          customTrigger={
            <Button
              variant="tertiary"
              size="lg"
              iconLeft={IconType.DOTS_VERTICAL}
              data-testid="trigger"
            />
          }
        >
          <Dropdown.Item
            disabled={typeof onDelete !== 'function'}
            onClick={handleRemoveWallet}
          >
            {t('labels.removeWallet')}
          </Dropdown.Item>
        </Dropdown.Container>
      </DropdownMenuWrapper>
    </Container>
  );
};

export default WalletRow;

const Container = styled.div.attrs({
  className: 'flex flex-wrap gap-x-4 gap-y-3 p-4 bg-neutral-0',
})``;

const PercentageInputDisplay = styled(TextInput).attrs({
  className: 'text-right',
})``;

const PercentageInputDisplayWrapper = styled.div.attrs({
  className: 'order-5 md:order-4 w-20',
})``;

const LabelWrapper = styled.div.attrs({
  className: 'md:hidden mb-1',
})``;

const AddressWrapper = styled.div.attrs({
  className: 'flex-1 order-1',
})``;

const AmountsWrapper = styled.div.attrs({
  className: 'flex-1 md:flex-none order-4 md:order-2 w-[200px]',
})``;

const ErrorContainer = styled.div.attrs({
  className: 'mt-1',
})``;

const Break = styled.hr.attrs({
  className: 'order-3 md:hidden w-full border-0',
})``;

const DropdownMenuWrapper = styled.div.attrs({
  className: 'flex order-2 md:order-5 mt-7 md:mt-0 w-12',
})``;

const InputContainer = styled.div.attrs(() => ({
  className: 'space-y-2',
}))``;
