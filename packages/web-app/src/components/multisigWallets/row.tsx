import {
  ButtonIcon,
  Dropdown,
  IconMenuVertical,
  InputValue,
  ListItemAction,
} from '@aragon/ui-components';
import React from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useAlertContext} from 'context/alert';
import {useProviders} from 'context/providers';
import useScreen from 'hooks/useScreen';
import {Web3Address} from 'utils/library';
import {validateWeb3Address} from 'utils/validators';

export type WalletItem = {
  id: string;
  web3Address: {
    address: string;
    ensName: string;
  };
};

type MultisigWalletsRowProps = {
  index: number;
  onResetEntry: (index: number) => void;
  onDeleteEntry: (index: number) => void;
};

export const Row = ({index, ...props}: MultisigWalletsRowProps) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isMobile} = useScreen();
  const {infura: provider} = useProviders();

  const {control, trigger} = useFormContext();
  const multisigWallets = useWatch({name: 'multisigWallets', control});

  const addressValidator = async (value: InputValue, index: number) => {
    const wallet = new Web3Address(provider, value?.address, value?.ensName);

    let validationResult = await validateWeb3Address(
      wallet,
      t('errors.required.walletAddress'),
      t
    );

    if (multisigWallets) {
      multisigWallets.forEach(
        ({web3Address: {address, ensName}}: WalletItem, itemIndex: number) => {
          if (
            (address === wallet.address || ensName === wallet.ensName) &&
            itemIndex !== index
          ) {
            validationResult = t('errors.duplicateAddress');
          }
        }
      );
    }
    return validationResult;
  };

  return (
    <RowContainer>
      {isMobile && <Title>{t('labels.whitelistWallets.address')}</Title>}
      <Controller
        name={`multisigWallets.${index}.web3Address`}
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
                showResolvedLabels={false}
                ref={ref}
                onClearButtonClick={() => {
                  alert(t('alert.chip.inputCleared'));
                  setTimeout(() => trigger('multisigWallets'), 50);
                }}
              />
            </InputContainer>
            <Dropdown
              side="bottom"
              align="start"
              sideOffset={4}
              trigger={
                <ButtonIcon
                  bgWhite
                  size="large"
                  mode="secondary"
                  icon={<IconMenuVertical />}
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
