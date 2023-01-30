import {
  AlertInline,
  ButtonIcon,
  Dropdown,
  IconMenuVertical,
  ValueInput,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useCallback} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';

import {validateAddress} from 'utils/validators';
import {WalletItem} from 'pages/createDAO';
import {handleClipboardActions} from 'utils/library';
import {useAlertContext} from 'context/alert';

type Props = {
  actionIndex: number;
  // TODO: when refactoring, this is what indicates whether the row
  // should be editable or not. Please rename.
  isRemove?: boolean;
  fieldIndex: number;
  dropdownItems: Array<{
    callback: (index: number) => void;
    component: React.ReactNode;
  }>;
  onClearRow?: (index: number) => void;
};

export const AddressRow = ({
  actionIndex,
  isRemove = false,
  fieldIndex,
  dropdownItems,
  onClearRow,
}: Props) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();

  const {control} = useFormContext();

  const memberWalletsKey = `actions.${actionIndex}.inputs.memberWallets`;
  const memberWallets = useWatch({
    name: memberWalletsKey,
    control,
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAdornmentClick = useCallback(
    (value: string, onChange: (value: string) => void) => {
      // allow the user to copy the address even when input is disabled
      if (isRemove) {
        handleClipboardActions(value, onChange, alert);
        return;
      }

      // if the input is not disabled, when there is a value clear it,
      // paste from clipboard, and set the value
      if (value) {
        onClearRow?.(fieldIndex) || onChange('');
        alert(t('alert.chip.inputCleared'));
      } else {
        handleClipboardActions(value, onChange, alert);
      }
    },
    [alert, fieldIndex, isRemove, onClearRow, t]
  );

  const addressValidator = useCallback(
    (address: string, index: number) => {
      let validationResult = validateAddress(address);
      if (memberWallets) {
        memberWallets.forEach((wallet: WalletItem, walletIndex: number) => {
          if (address === wallet.address && index !== walletIndex) {
            validationResult = t('errors.duplicateAddress');
          }
        });
      }
      return validationResult;
    },
    [t, memberWallets]
  );

  // gets the proper label for adornment button. ick.
  const getAdornmentText = (value: string) => {
    if (isRemove) return t('labels.copy');
    return value ? t('labels.clear') : t('labels.paste');
  };

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <Controller
      name={`${memberWalletsKey}.${fieldIndex}.address`}
      defaultValue=""
      control={control}
      rules={{
        required: t('errors.required.walletAddress') as string,
        validate: value => addressValidator(value, fieldIndex),
      }}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <Container>
          <InputContainer>
            <ValueInput
              mode={error ? 'critical' : 'default'}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.value);
              }}
              placeholder="0x..."
              adornmentText={getAdornmentText(value)}
              onAdornmentClick={() => handleAdornmentClick(value, onChange)}
              disabled={isRemove}
            />
            {error?.message && (
              <AlertInline label={error.message} mode="critical" />
            )}
          </InputContainer>
          <Dropdown
            disabled={memberWallets?.length === 1 && !isRemove}
            side="bottom"
            align="start"
            sideOffset={4}
            listItems={dropdownItems.map(item => ({
              component: item.component,
              callback: () => item.callback(fieldIndex),
            }))}
            trigger={
              <ButtonIcon
                size="large"
                mode="secondary"
                icon={<IconMenuVertical />}
                data-testid="trigger"
                bgWhite
              />
            }
          />
        </Container>
      )}
    />
  );
};

const Container = styled.div.attrs(() => ({
  className: 'flex gap-2 items-start',
}))``;

const InputContainer = styled.div.attrs(() => ({
  className: 'flex flex-col gap-1 flex-1',
}))``;
