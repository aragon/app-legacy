import {
  AlertInline,
  ButtonIcon,
  Dropdown,
  IconMenuVertical,
  Label,
  ListItemAction,
  NumberInput,
  TextInput,
} from '@aragon/ods';
import Big from 'big.js';
import React, {useCallback} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {WalletInputValue} from '@aragon/ui-components/dist/components/input/walletInput';
import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useAlertContext} from 'context/alert';
import {useProviders} from 'context/providers';
import useScreen from 'hooks/useScreen';
import {Web3Address} from 'utils/library';
import {ActionIndex, ActionMintToken} from 'utils/types';
import {validateWeb3Address} from 'utils/validators';

type IndexProps = ActionIndex & {
  fieldIndex: number;
};

type AddressAndTokenRowProps = IndexProps & {
  newTokenSupply: Big;
  onClear?: (index: number) => void;
  onDelete: (index: number) => void;
  onEnterDaoAddress?: (index: number) => void;
  daoAddress?: string;
  isModalOpened?: boolean;
  ensName?: string;
};

type AddressFieldProps = IndexProps &
  Pick<
    AddressAndTokenRowProps,
    'onClear' | 'onEnterDaoAddress' | 'daoAddress' | 'ensName' | 'isModalOpened'
  >;

const AddressField: React.FC<AddressFieldProps> = ({
  actionIndex,
  fieldIndex,
  onClear,
  onEnterDaoAddress,
  isModalOpened,
  daoAddress,
  ensName,
}) => {
  const {t} = useTranslation();
  const {infura: provider} = useProviders();

  const {control} = useFormContext();
  const walletFieldArray: ActionMintToken['inputs']['mintTokensToWallets'] =
    useWatch({
      name: `actions.${actionIndex}.inputs.mintTokensToWallets`,
      control,
    });

  const addressValidator = useCallback(
    async (address, index) => {
      const web3Address = new Web3Address(provider, address, ensName);

      // check if address is valid
      let validationResult = await validateWeb3Address(
        web3Address,
        t('errors.required.walletAddress'),
        t
      );

      // check if address is duplicated
      if (
        walletFieldArray?.some(
          (wallet, walletIndex) =>
            (wallet.address === web3Address.address ||
              wallet.ensName === web3Address.ensName) &&
            walletIndex !== index
        )
      )
        validationResult = t('errors.duplicateAddress');

      if (onEnterDaoAddress && validationResult === true) {
        // do not open the modal for more than one time for the same address
        if (
          (web3Address.address === daoAddress?.toLowerCase() ||
            web3Address.ensName === ensName?.toLowerCase()) &&
          !isModalOpened
        ) {
          onEnterDaoAddress(index);
        }
      }
      return validationResult;
    },
    [
      daoAddress,
      ensName,
      isModalOpened,
      onEnterDaoAddress,
      provider,
      t,
      walletFieldArray,
    ]
  );

  const handleOnChange = useCallback(
    // to avoid nesting the InputWallet value, add the existing amount
    // when the value of the address/ens changes
    (e: unknown, onChange: (e: unknown) => void) => {
      onChange({
        ...(e as WalletInputValue),
        amount: walletFieldArray[fieldIndex].amount,
      });
    },
    [fieldIndex, walletFieldArray]
  );

  return (
    <Controller
      defaultValue={{address: '', ensName: ''}}
      name={`actions.${actionIndex}.inputs.mintTokensToWallets.${fieldIndex}`}
      rules={{validate: value => addressValidator(value, fieldIndex)}}
      render={({
        field: {name, ref, value, onBlur, onChange},
        fieldState: {error},
      }) => (
        <div className="flex-1">
          <WrappedWalletInput
            name={name}
            state={error && 'critical'}
            value={value}
            onBlur={onBlur}
            onChange={e => handleOnChange(e, onChange)}
            error={error?.message}
            showResolvedLabels={false}
            ref={ref}
          />
        </div>
      )}
    />
  );
};

const TokenField: React.FC<IndexProps> = ({actionIndex, fieldIndex}) => {
  const {trigger} = useFormContext();
  const {t} = useTranslation();

  const amountValidator = (value: string) => {
    if (Number(value) > 0) return true;
    return t('errors.lteZero') as string;
  };

  return (
    <Controller
      name={`actions.${actionIndex}.inputs.mintTokensToWallets.${fieldIndex}.amount`}
      rules={{
        required: t('errors.required.amount') as string,
        validate: amountValidator,
      }}
      render={({
        field: {name, value, onBlur, onChange},
        fieldState: {error},
      }) => (
        <div className="flex-1 w-25">
          <NumberInput
            name={name}
            value={value}
            onBlur={onBlur}
            onChange={e => {
              trigger(
                `actions.${actionIndex}.inputs.mintTokensToWallets.${fieldIndex}.address`
              );
              onChange(e);
            }}
            placeholder="0"
            min={0}
            includeDecimal
            mode={error?.message ? 'critical' : 'default'}
          />
          {error?.message && (
            <ErrorContainer>
              <AlertInline label={error.message} mode="critical" />
            </ErrorContainer>
          )}
        </div>
      )}
    />
  );
};

type DropdownProps = Omit<AddressAndTokenRowProps, 'newTokenSupply'> & {
  disabled?: boolean;
};

const DropdownMenu: React.FC<DropdownProps> = ({
  fieldIndex,
  onDelete,
  disabled = false,
}) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();

  return (
    <Dropdown
      disabled={disabled}
      align="start"
      trigger={
        <ButtonIcon
          mode="secondary"
          size="large"
          icon={<IconMenuVertical />}
          bgWhite
        />
      }
      sideOffset={8}
      listItems={[
        {
          component: (
            <ListItemAction title={t('labels.removeWallet')} bgWhite />
          ),
          callback: () => {
            onDelete(fieldIndex);
            alert(t('alert.chip.removedAddress'));
          },
        },
      ]}
    />
  );
};

const PercentageDistribution: React.FC<
  Omit<AddressAndTokenRowProps, 'onDelete'>
> = ({actionIndex, fieldIndex, newTokenSupply}) => {
  const mintAmount = useWatch({
    name: `actions.${actionIndex}.inputs.mintTokensToWallets.${fieldIndex}.amount`,
  });
  let percentage;
  try {
    percentage =
      newTokenSupply && !newTokenSupply.eq(Big(0))
        ? Big(mintAmount).div(newTokenSupply).mul(Big(100))
        : Big(0);
  } catch {
    percentage = Big(0);
  }

  return (
    <div className="w-10" style={{maxWidth: '12ch'}}>
      <TextInput
        className="text-right"
        name={`actions.${actionIndex}.inputs.mintTokensToWallets.${fieldIndex}.amount`}
        value={percentage.toPrecision(3) + '%'}
        mode="default"
        disabled
      />
    </div>
  );
};

export const AddressAndTokenRow: React.FC<AddressAndTokenRowProps> = ({
  actionIndex,
  fieldIndex,
  onDelete,
  onClear,
  newTokenSupply,
  onEnterDaoAddress,
  isModalOpened,
  daoAddress,
  ensName,
}) => {
  const {isDesktop} = useScreen();
  const {t} = useTranslation();

  const {control} = useFormContext();
  const walletFieldArray = useWatch({
    name: `actions.${actionIndex}.inputs.mintTokensToWallets`,
    control,
  });

  if (isDesktop) {
    return (
      <Container>
        <HStack>
          <AddressField
            {...{
              actionIndex,
              fieldIndex,
              onClear,
              onEnterDaoAddress,
              isModalOpened,
              ensName,
              daoAddress,
            }}
          />
          <TokenField actionIndex={actionIndex} fieldIndex={fieldIndex} />
          <PercentageDistribution
            actionIndex={actionIndex}
            fieldIndex={fieldIndex}
            newTokenSupply={newTokenSupply}
          />
          <DropdownMenu
            actionIndex={actionIndex}
            fieldIndex={fieldIndex}
            onDelete={onDelete}
            disabled={walletFieldArray.length === 1}
          />
        </HStack>
      </Container>
    );
  }

  return (
    <Container>
      <VStack>
        <Label label={t('labels.whitelistWallets.address')} />

        <HStack>
          <AddressField
            {...{
              actionIndex,
              fieldIndex,
              onClear,
              onEnterDaoAddress,
              isModalOpened,
              ensName,
              daoAddress,
            }}
          />
          <DropdownMenu
            actionIndex={actionIndex}
            fieldIndex={fieldIndex}
            onDelete={onDelete}
            disabled={walletFieldArray.length === 1}
          />
        </HStack>
      </VStack>

      <VStack>
        <div className="flex space-x-2">
          <div className="flex-1">
            <Label label={t('finance.tokens')} />
          </div>
          <div className="flex-1" style={{maxWidth: '12ch'}}>
            <Label label={t('finance.allocation')} />
          </div>
        </div>

        <HStackWithPadding>
          <TokenField actionIndex={actionIndex} fieldIndex={fieldIndex} />
          <PercentageDistribution
            actionIndex={actionIndex}
            fieldIndex={fieldIndex}
            newTokenSupply={newTokenSupply}
          />
        </HStackWithPadding>
      </VStack>
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'p-2 tablet:p-3 space-y-3',
})``;

const ErrorContainer = styled.div.attrs({
  className: 'mt-0.5',
})``;

const VStack = styled.div.attrs({
  className: 'space-y-0.5',
})``;

const HStack = styled.div.attrs({
  className: 'flex space-x-2',
})``;

const HStackWithPadding = styled.div.attrs({
  className: 'flex tablet:pr-8 space-x-2',
})``;
