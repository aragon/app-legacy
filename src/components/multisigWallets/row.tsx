import React from 'react';
import {Dropdown, InputValue, ListItemAction} from '@aragon/ods-old';
import {Button, IconType} from '@aragon/ods';
import {Controller, useFormContext, ValidateResult} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useAlertContext} from 'context/alert';
import {useProviders} from 'context/providers';
import useScreen from 'hooks/useScreen';
import {Web3Address} from 'utils/library';

export type MultisigWalletField = {
  id: string;
  address: string;
  ensName: string;
};

export type RowValidator = (
  wallet: Web3Address,
  index: number
) => Promise<ValidateResult | string | undefined>;

type MultisigWalletsRowProps = {
  index: number;
  onResetEntry: (index: number) => void;
  onDeleteEntry: (index: number) => void;
  validator: RowValidator;
  walletFieldName: string;
};

export const Row = ({
  index,
  walletFieldName,
  ...props
}: MultisigWalletsRowProps) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isMobile} = useScreen();
  const {api: provider} = useProviders();

  const {control, trigger} = useFormContext();
  const addressValidator = async (value: InputValue, index: number) => {
    const wallet = new Web3Address(provider, value?.address, value?.ensName);
    return props.validator(wallet, index);
  };
  return (
    <RowContainer>
      {isMobile && <Title>{t('labels.whitelistWallets.address')}</Title>}
      <Controller
        name={`${walletFieldName}.${index}`}
        defaultValue={{address: '', ensName: ''}}
        control={control}
        rules={{validate: value => addressValidator(value, index)}}
        render={({
          field: {onChange, value, onBlur, ref},
          fieldState: {error},
        }) => (
          <Container>
            <InputContainer>
              <WrappedWalletInput
                state={error && 'critical'}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                error={error?.message}
                resolveLabels="onBlur"
                ref={ref}
                onClearButtonClick={() => {
                  alert(t('alert.chip.inputCleared'));
                  setTimeout(() => {
                    trigger(walletFieldName);
                  }, 50);
                }}
              />
            </InputContainer>
            <Dropdown
              side="bottom"
              align="start"
              sideOffset={4}
              trigger={
                <Button
                  size="lg"
                  variant="tertiary"
                  iconLeft={IconType.DOTS_VERTICAL}
                  data-testid="trigger"
                />
              }
              listItems={[
                {
                  component: (
                    <ListItemAction
                      title={t('labels.whitelistWallets.resetEntry')}
                      bgWhite
                    />
                  ),
                  callback: () => {
                    props.onResetEntry(index);
                    alert(t('alert.chip.resetAddress'));
                  },
                },
                {
                  component: (
                    <ListItemAction
                      title={t('labels.whitelistWallets.deleteEntry')}
                      bgWhite
                    />
                  ),
                  callback: () => {
                    props.onDeleteEntry(index);
                    alert(t('alert.chip.removedAddress'));
                  },
                },
              ]}
            />
          </Container>
        )}
      />
    </RowContainer>
  );
};

const RowContainer = styled.div.attrs(() => ({
  className: 'gap-1 flex flex-col xl:px-6 xl:py-3 p-4',
}))``;

const Container = styled.div.attrs(() => ({
  className: 'flex gap-4 items-start',
}))``;
const InputContainer = styled.div.attrs(() => ({
  className: 'flex flex-col gap-2 flex-1',
}))``;

const Title = styled.div.attrs(() => ({
  className: 'text-neutral-800 font-semibold ft-text-base',
}))``;
