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
import {WhitelistWallet} from 'pages/createDAO';
import {handleClipboardActions} from 'utils/library';

type Props = {
  actionIndex: number;
  fieldIndex: number;
  dropdownItems: Array<{
    component: React.ReactNode;
    callback: (index: number) => void;
  }>;
  disabled?: boolean;
};

export const AddressRow = ({actionIndex, fieldIndex, ...props}: Props) => {
  const {t} = useTranslation();

  const {control} = useFormContext();
  const memberWallets = useWatch({
    name: `actions.${actionIndex}.inputs.memberWallets`,
    control,
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAdornmentClick = useCallback(
    (value: string, onChange: (value: string) => void) => {
      // allow the user to copy the address even when input is disabled
      if (props.disabled) {
        handleClipboardActions(value, onChange);
        return;
      }

      // if the input is not disabled, when there is a value clear it,
      // paste from clipboard, and set the value
      if (value) {
        onChange('');
      } else {
        handleClipboardActions(value, onChange);
      }
    },
    [props.disabled]
  );

  const addressValidator = useCallback(
    (address: string, index: number) => {
      // allowing empty addresses as valid for better user experience
      if (address === '') return true;

      let validationResult = validateAddress(address);
      if (memberWallets) {
        memberWallets.forEach(
          (wallet: WhitelistWallet, walletIndex: number) => {
            if (address === wallet.address && index !== walletIndex) {
              validationResult = t('errors.duplicateAddress');
            }
          }
        );
      }
      return validationResult;
    },
    [t, memberWallets]
  );

  // gets the proper label for adornment button. ick.
  const getAdornmentText = (value: string) => {
    if (props.disabled) return t('labels.copy');
    return value ? t('labels.clear') : t('labels.paste');
  };

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <Controller
      name={`actions.${actionIndex}.inputs.memberWallets.${fieldIndex}.address`}
      defaultValue=""
      control={control}
      rules={{
        validate: value => addressValidator(value, fieldIndex),
      }}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <Container>
          <InputContainer>
            <ValueInput
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.value);
              }}
              mode="default"
              placeholder="0x..."
              adornmentText={getAdornmentText(value)}
              onAdornmentClick={() => handleAdornmentClick(value, onChange)}
              disabled={props.disabled}
            />
            {error?.message && (
              <AlertInline label={error.message} mode="critical" />
            )}
          </InputContainer>
          <Dropdown
            side="bottom"
            align="start"
            sideOffset={4}
            listItems={props.dropdownItems.map(item => ({
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
