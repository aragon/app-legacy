import {
  Dropdown,
  Label,
  ListItemAction,
  InputValue as WalletInputValue,
} from '@aragon/ods-old';
import {IconType, Button} from '@aragon/ods';
import React, {useCallback} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useAlertContext} from 'context/alert';
import {useProviders} from 'context/providers';
import {Web3Address} from 'utils/library';
import {validateWeb3Address} from 'utils/validators';
import {MultisigWalletField} from 'components/multisigWallets/row';

type WalletRowProps = {
  index: number;
  onDelete?: (index: number) => void;
};

const AddCommitteeWalletRow: React.FC<WalletRowProps> = ({index, onDelete}) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {api: provider} = useProviders();

  const {control} = useFormContext();
  const committee = useWatch({
    name: 'committee',
    control,
  });

  const addressValidator = useCallback(
    async ({address, ensName}: WalletInputValue, index: number) => {
      const web3Address = new Web3Address(provider, address, ensName);

      // check if address is valid
      let validationResult = await validateWeb3Address(
        web3Address,
        t('errors.required.walletAddress'),
        t
      );

      if (validationResult && validationResult !== true) {
        return validationResult;
      }

      if (committee) {
        committee.forEach(
          ({address, ensName}: MultisigWalletField, itemIndex: number) => {
            if (
              ((web3Address.address &&
                address.toLowerCase() === web3Address.address.toLowerCase()) ||
                (web3Address.ensName &&
                  ensName.toLowerCase() ===
                    web3Address.ensName.toLowerCase())) &&
              itemIndex !== index
            ) {
              validationResult = t('errors.duplicateAddress');
            }
          }
        );
      }
      return validationResult;
    },
    [provider, t, committee]
  );

  const handleOnChange = useCallback(
    // to avoid nesting the InputWallet value, add the existing amount
    // when the value of the address/ens changes
    (e: unknown, onChange: (e: unknown) => void) => {
      onChange({
        ...(e as WalletInputValue),
      });
    },
    // We want this effect to be executed on change of the committee
    // eslint-disable-next-line
    [index, committee]
  );

  return (
    <Container>
      <Controller
        defaultValue={{address: '', ensName: ''}}
        name={`committee.${index}`}
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
          </AddressWrapper>
        )}
      />

      <DropdownMenuWrapper>
        {/* Disable index 0 when minting to DAO Treasury is supported */}
        <Dropdown
          align="start"
          trigger={
            <Button
              variant="tertiary"
              size="lg"
              iconLeft={IconType.DOTS_VERTICAL}
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
                  onDelete(index);
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

export default AddCommitteeWalletRow;

const Container = styled.div.attrs({
  className: 'flex flex-wrap gap-x-2 gap-y-1.5 p-2 bg-ui-0',
})``;

const LabelWrapper = styled.div.attrs({
  className: 'md:hidden mb-1',
})``;

const AddressWrapper = styled.div.attrs({
  className: 'flex-1 order-1',
})``;

// const DropdownMenuWrapper = styled.div.attrs({
//   className: 'flex order-2 tablet:order-5 mt-3.5 tablet:mt-0 w-6',
// })``;
const DropdownMenuWrapper = styled.div.attrs({
  className: 'flex order-2 md:order-5 mt-7 md:mt-0 w-12',
})``;
