import {
  AlertInline,
  ButtonIcon,
  IconMenuVertical,
  Label,
  ListItemAction,
  Dropdown,
  TextInput,
  NumberInput,
  ValueInput,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {BigNumber} from 'ethers';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext, useWatch} from 'react-hook-form';

import {
  getUserFriendlyWalletLabel,
  handleClipboardActions,
} from 'utils/library';
import {validateAddress} from 'utils/validators';
import {MAX_TOKEN_AMOUNT} from 'utils/constants';
import {useAlertContext} from 'context/alert';

type WalletRowProps = {
  index: number;
  onDelete?: (index: number) => void;
};

export type WalletField = {
  id: string;
  address: string;
  amount: string;
};

const WalletRow: React.FC<WalletRowProps> = ({index, onDelete}) => {
  const {t} = useTranslation();
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const {control, getValues, setValue, trigger} = useFormContext();
  const walletFieldArray = useWatch({name: 'wallets', control});
  const {alert} = useAlertContext();

  const calculateTotalTokenSupply = (value: number) => {
    let totalSupply = 0;

    walletFieldArray?.forEach((wallet: WalletField) => {
      if (Number(wallet.amount) > 0) {
        totalSupply = parseInt(wallet.amount) + totalSupply;
      }
    });

    if (value < 0) return '';

    const CalculateNaN = Math.floor((value / totalSupply) * 100);
    return totalSupply && !isNaN(CalculateNaN) ? CalculateNaN + '%' : '';
  };

  const addressValidator = (address: string, index: number) => {
    let validationResult = validateAddress(address);
    setIsDuplicate(false);
    if (walletFieldArray) {
      walletFieldArray.forEach((wallet: WalletField, walletIndex: number) => {
        if (address === wallet.address && index !== walletIndex) {
          validationResult = t('errors.duplicateAddress') as string;
          setIsDuplicate(true);
        }
      });
    }
    return validationResult;
  };

  const amountValidation = (amount: string) => {
    let totalSupply = 0;
    let minAmount = walletFieldArray[0]?.amount;
    const address = getValues(`wallets.${index}.address`);
    const eligibilityType = getValues('eligibilityType');
    if (address === '') trigger(`wallets.${index}.address`);

    // calculate total token supply disregarding error invalid fields
    walletFieldArray.forEach((wallet: WalletField) => {
      if (Number(wallet.amount) < minAmount) {
        minAmount = wallet.amount;
      }
      if (Number(wallet.amount) > 0)
        totalSupply = parseInt(wallet.amount) + totalSupply;
    });
    setValue('tokenTotalSupply', totalSupply);

    if (eligibilityType === 'token') setValue('minimumTokenAmount', minAmount);

    // show max amount error
    if (BigNumber.from(amount).gt(MAX_TOKEN_AMOUNT))
      return t('errors.ltAmount', {amount: '~ 2.69 * 10^49'});

    // show negative amount error
    if (BigNumber.from(amount).lt(0)) return t('errors.lteZero');
    return totalSupply === 0 ? t('errors.totalSupplyZero') : true;
  };

  return (
    <Container data-testid="wallet-row">
      <Controller
        defaultValue=""
        name={`wallets.${index}.address`}
        control={control}
        rules={{
          required: t('errors.required.walletAddress') as string,
          validate: value => addressValidator(value, index),
        }}
        render={({
          field: {name, value, onBlur, onChange},
          fieldState: {error},
        }) => (
          <AddressWrapper>
            <LabelWrapper>
              <Label label={t('labels.whitelistWallets.address')} />
            </LabelWrapper>
            <ValueInput
              mode={error ? 'critical' : 'default'}
              name={name}
              value={getUserFriendlyWalletLabel(value, t)}
              onBlur={onBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.value);
              }}
              // Uncomment when minting to DAO Treasury is supported
              // disabled={index === 0}
              adornmentText={value ? t('labels.copy') : t('labels.paste')}
              onAdornmentClick={() =>
                handleClipboardActions(value, onChange, alert)
              }
            />
            {error?.message && (
              <ErrorContainer>
                <AlertInline label={error.message} mode="critical" />
              </ErrorContainer>
            )}
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
        render={({field, fieldState: {error}}) => (
          <AmountsWrapper>
            <LabelWrapper>
              <Label label={t('finance.tokens')} />
            </LabelWrapper>

            <NumberInput
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              placeholder="0"
              min={0}
              includeDecimal
              disabled={isDuplicate}
              mode={error?.message ? 'critical' : 'default'}
              value={field.value}
            />

            {error?.message && (
              <ErrorContainer>
                <AlertInline label={error.message} mode="critical" />
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
          value={calculateTotalTokenSupply(walletFieldArray[index].amount)}
          mode="default"
          disabled
        />
      </PercentageInputDisplayWrapper>

      <DropdownMenuWrapper>
        {/* Disable index 0 when minting to DAO Treasury is supported */}
        <Dropdown
          align="start"
          trigger={
            <ButtonIcon
              mode="ghost"
              size="large"
              bgWhite
              icon={<IconMenuVertical />}
              data-testid="trigger"
            />
          }
          sideOffset={8}
          listItems={[
            {
              component: (
                <ListItemAction
                  title={t('labels.removeWallet')}
                  {...(typeof onDelete !== 'function' && {mode: 'disabled'})}
                  bgWhite
                />
              ),
              callback: () => {
                if (typeof onDelete === 'function') {
                  const [
                    totalSupply,
                    amount,
                    eligibilityType,
                    eligibilityTokenAmount,
                  ] = getValues([
                    'tokenTotalSupply',
                    `wallets.${index}.amount`,
                    'eligibilityType',
                    'eligibilityTokenAmount',
                  ]);

                  setValue('tokenTotalSupply', totalSupply - amount);
                  onDelete(index);
                  if (eligibilityType === 'token') {
                    if (eligibilityTokenAmount === amount) {
                      let minAmount = walletFieldArray[0]?.amount;
                      (walletFieldArray as WalletField[]).map(
                        (wallet, mapIndex) => {
                          if (mapIndex !== index)
                            if (Number(wallet.amount) < minAmount) {
                              minAmount = wallet.amount;
                            }
                        }
                      );
                      setValue('minimumTokenAmount', minAmount);
                    }
                  }
                  alert(t('alert.chip.removedAddress') as string);
                }
              },
            },
          ]}
        />
      </DropdownMenuWrapper>
    </Container>
  );
};

export default WalletRow;

const Container = styled.div.attrs({
  className: 'flex flex-wrap gap-x-2 gap-y-1.5 p-2 bg-ui-0',
})``;

const PercentageInputDisplay = styled(TextInput).attrs({
  className: 'text-right',
})``;

const PercentageInputDisplayWrapper = styled.div.attrs({
  className: 'order-5 tablet:order-4 w-10',
})``;

const LabelWrapper = styled.div.attrs({
  className: 'tablet:hidden mb-0.5',
})``;

const AddressWrapper = styled.div.attrs({
  className: 'flex-1 order-1',
})``;

const AmountsWrapper = styled.div.attrs({
  className: 'flex-1 tablet:flex-none order-4 tablet:order-2 w-25',
})``;

const ErrorContainer = styled.div.attrs({
  className: 'mt-0.5',
})``;

const Break = styled.hr.attrs({
  className: 'order-3 tablet:hidden w-full border-0',
})``;

const DropdownMenuWrapper = styled.div.attrs({
  className: 'flex order-2 tablet:order-5 mt-3.5 tablet:mt-0 w-6',
})``;
