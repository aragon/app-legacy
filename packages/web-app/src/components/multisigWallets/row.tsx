import {
  AlertInline,
  ButtonIcon,
  Dropdown,
  IconMenuVertical,
  Link,
  ListItemAction,
  ValueInput,
} from '@aragon/ui-components';
import {useAlertContext} from 'context/alert';
import useScreen from 'hooks/useScreen';
import {WalletItem} from 'pages/createDAO';
import React from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {handleClipboardActions} from 'utils/library';
import {validateAddress} from 'utils/validators';

type MultisigWalletsRowProps = {
  index: number;
  onResetEntry: (index: number) => void;
  onDeleteEntry: (index: number) => void;
};

export const Row = ({index, ...props}: MultisigWalletsRowProps) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();

  const {control} = useFormContext();
  const multisigWallets = useWatch({name: 'multisigWallets', control});

  const addressValidator = (address: string, index: number) => {
    let validationResult = validateAddress(address);
    if (multisigWallets) {
      multisigWallets.forEach((wallet: WalletItem, walletIndex: number) => {
        if (address === wallet.address && index !== walletIndex) {
          validationResult = t('errors.duplicateAddress');
        }
      });
    }
    return validationResult;
  };

  const {isMobile} = useScreen();

  return (
    <Controller
      name={`multisigWallets.${index}.address`}
      defaultValue=""
      control={control}
      rules={{
        required: t('errors.required.walletAddress'),
        validate: value => addressValidator(value, index),
      }}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <RowContainer>
          {isMobile && <Title>Address</Title>}
          <Container>
            <InputContainer>
              <ValueInput
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  onChange(e.target.value);
                }}
                mode="default"
                placeholder="0x..."
                adornmentText={value ? t('labels.copy') : t('labels.paste')}
                onAdornmentClick={() =>
                  handleClipboardActions(value, onChange, alert)
                }
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </InputContainer>
            <Dropdown
              side="bottom"
              align="start"
              sideOffset={4}
              trigger={
                <ButtonIcon
                  size="large"
                  mode="secondary"
                  icon={<IconMenuVertical />}
                  data-testid="trigger"
                />
              }
              listItems={[
                {
                  component: (
                    <ListItemAction title={t('labels.copy')} bgWhite />
                  ),
                  callback: () => {
                    props.onResetEntry(index);
                    alert(t('alert.chip.resetAddress'));
                  },
                },
                {
                  component: (
                    <ListItemAction title={t('labels.copy')} bgWhite />
                  ),
                  callback: () => {
                    props.onDeleteEntry(index);
                    alert(t('alert.chip.removedAddress'));
                  },
                },
              ]}
            />
          </Container>
        </RowContainer>
      )}
    />
  );
};

const RowContainer = styled.div.attrs(() => ({
  className: 'gap-0.5 flex flex-col desktop:px-3 desktop:py-1.5 p-2',
}))``;

const Container = styled.div.attrs(() => ({
  className: 'flex gap-2 items-start',
}))``;
const InputContainer = styled.div.attrs(() => ({
  className: 'flex flex-col gap-1 flex-1',
}))``;

const Title = styled.div.attrs(() => ({
  className: 'text-ui-800 font-bold ft-text-base',
}))``;
