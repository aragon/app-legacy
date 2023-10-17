import {
  AlertCard,
  ButtonIcon,
  ButtonText,
  IconChevronLeft,
  InputValue,
} from '@aragon/ods-old';
import React, {useCallback, useMemo, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {StateEmpty} from 'components/stateEmpty';
import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useProviders} from 'context/providers';
import {Web3Address} from 'utils/library';
import {validateWeb3Address} from 'utils/validators';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCloseReset: () => void;
  daoAddress: {
    address?: string;
    ensName?: string;
  };
};

const MintTokensToTreasuryMenu: React.FC<Props> = ({
  isOpen,
  onClose,
  onCloseReset,
  daoAddress: dao,
}) => {
  const {t} = useTranslation();
  const [step, setStep] = useState(0);
  const {api: provider} = useProviders();

  const {control, resetField} = useFormContext();
  const treasury = useWatch({name: 'mintTokensToTreasury', control: control});

  const isActionEnabled = useMemo(() => {
    if (treasury)
      if (
        treasury.address.toLowerCase() === dao.address?.toLowerCase() ||
        treasury.ensName.toLowerCase() === dao.ensName?.toLowerCase()
      )
        return true;
    return false;
  }, [dao.address, dao.ensName, treasury]);

  const validateAddress = useCallback(
    async (value: InputValue) => {
      return validateWeb3Address(
        new Web3Address(provider, value.address, value.ensName),
        t('errors.required.walletAddress'),
        t
      );
    },
    [provider, t]
  );

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} {...{onCloseReset}}>
      {step === 0 ? (
        <div className="px-4 pb-6">
          <StateEmpty
            type="Object"
            object="warning"
            mode="inline"
            title={t('modal.mintTokensToTreasury.title')}
            description={t('modal.mintTokensToTreasury.description')}
            content={
              <div className="mb-3 mt-6">
                <AlertCard
                  mode="critical"
                  title={t('modal.mintTokensToTreasury.alertTitle')}
                  helpText={t('modal.mintTokensToTreasury.alertDescription')}
                />
              </div>
            }
            primaryButton={{
              label: t('modal.mintTokensToTreasury.step1CtaLabel'),
              onClick: () => {
                onCloseReset();
                setStep(0);
              },
            }}
            secondaryButton={{
              label: t('modal.mintTokensToTreasury.step1CancelLabel'),
              onClick: () => {
                setStep(1);
              },
              bgWhite: false,
            }}
            actionsColumn
          />
        </div>
      ) : (
        <>
          <ModalHeader>
            <ButtonIcon
              mode="secondary"
              size="small"
              icon={<IconChevronLeft />}
              onClick={() => {
                setStep(0);
                resetField('mintTokensToTreasury');
              }}
              bgWhite
            />
            <Title>{t('modal.mintTokensToTreasury.title')}</Title>
            <div role="presentation" className="h-8 w-8" />
          </ModalHeader>
          <div className="flex flex-col px-4 py-6">
            <FormTitle>{t('modal.mintTokensToTreasury.inputLabel')}</FormTitle>
            <FormHelpText>
              {t('modal.mintTokensToTreasury.inputHelptext')}
            </FormHelpText>
            <Controller
              defaultValue={{address: '', ensName: ''}}
              name={'mintTokensToTreasury'}
              control={control}
              rules={{validate: validateAddress}}
              render={({
                field: {name, ref, value, onBlur, onChange},
                fieldState: {error},
              }) => (
                <>
                  <InputContainer>
                    <WrappedWalletInput
                      name={name}
                      state={error && 'critical'}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      error={error?.message}
                      ref={ref}
                    />
                  </InputContainer>
                  <div className="mb-3 mt-6">
                    <AlertCard
                      mode="critical"
                      title={t('modal.mintTokensToTreasury.alertTitle')}
                      helpText={t(
                        'modal.mintTokensToTreasury.alertDescription'
                      )}
                    />
                  </div>
                  <ActionContainer>
                    <ButtonText
                      label={t('modal.mintTokensToTreasury.step2CtaLabel')}
                      mode="primary"
                      size="large"
                      onClick={() => {
                        onClose();
                        setStep(0);
                      }}
                      disabled={!isActionEnabled}
                    />
                    <ButtonText
                      label={t('modal.mintTokensToTreasury.step2CancelLabel')}
                      mode="secondary"
                      size="large"
                      bgWhite={false}
                      onClick={() => {
                        resetField('mintTokensToTreasury');
                        onCloseReset();
                        setStep(0);
                      }}
                    />
                  </ActionContainer>
                </>
              )}
            />
          </div>
        </>
      )}
    </ModalBottomSheetSwitcher>
  );
};

const Title = styled.div.attrs({
  className: 'flex-1 font-semibold text-center text-neutral-800',
})``;

const ModalHeader = styled.div.attrs({
  className:
    'flex items-center p-4 space-x-4 bg-neutral-0 rounded-xl sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const FormTitle = styled.span.attrs({
  className: 'ft-text-base font-semibold text-neutral-800 pb-0.5',
})``;

const FormHelpText = styled.p.attrs({
  className: 'ft-text-sm text-neutral-600 pb-3',
})``;

const ActionContainer = styled.div.attrs({
  className: 'flex flex-col w-full space-y-3',
})``;

const InputContainer = styled.div.attrs({className: 'flex-1 space-y-2'})``;

export default MintTokensToTreasuryMenu;
