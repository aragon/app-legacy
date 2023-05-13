import React, {useMemo, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
  AlertCard,
  ButtonIcon,
  ButtonText,
  IconChevronLeft,
  WalletInput,
} from '@aragon/ui-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {StateEmpty} from 'components/stateEmpty';
import {validateAddress} from 'utils/validators';
import {handleClipboardActions} from 'utils/library';
import {useAlertContext} from 'context/alert';

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
  daoAddress,
}) => {
  const {t} = useTranslation();
  const [step, setStep] = useState(0);
  const {control} = useFormContext();
  const {alert} = useAlertContext();
  const treasuryAddress = useWatch({
    name: 'mintTokensToTreasury',
    control: control,
  });

  const isActionEnabled = useMemo(() => {
    if (treasuryAddress !== '')
      if (
        treasuryAddress === daoAddress.address ||
        treasuryAddress === daoAddress.ensName
      )
        return true;
    return false;
  }, [daoAddress.address, daoAddress.ensName, treasuryAddress]);

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} {...{onCloseReset}}>
      {step === 0 ? (
        <div className="px-2 pb-3">
          <StateEmpty
            type="Object"
            object="warning"
            mode="inline"
            title={t('modal.mintTokensToTreasury.title')}
            description={t('modal.mintTokensToTreasury.description')}
            content={
              <div className="mt-3 mb-1.5">
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
              }}
              bgWhite
            />
            <Title>{t('modal.mintTokensToTreasury.title')}</Title>
            <div role="presentation" className="w-4 h-4" />
          </ModalHeader>
          <div className="flex flex-col py-3 px-2">
            <FormTitle>{t('modal.mintTokensToTreasury.inputLabel')}</FormTitle>
            <FormHelpText>
              {t('modal.mintTokensToTreasury.inputHelptext')}
            </FormHelpText>
            <Controller
              defaultValue=""
              name={'mintTokensToTreasury'}
              control={control}
              rules={{
                required: t('errors.required.walletAddress'),
                validate: value => validateAddress(value),
              }}
              render={({
                field: {name, value, onBlur, onChange},
                fieldState: {error},
              }) => (
                <>
                  <WalletInput
                    mode={error ? 'critical' : 'default'}
                    name={name}
                    value={value}
                    onBlur={onBlur}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onChange(e.target.value);
                    }}
                    placeholder="0x"
                    adornmentText={value ? t('labels.copy') : t('labels.paste')}
                    onAdornmentClick={() =>
                      handleClipboardActions(value, onChange, alert)
                    }
                  />
                  <div className="mt-3 mb-1.5">
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
  className: 'flex-1 font-bold text-center text-ui-800',
})``;

const ModalHeader = styled.div.attrs({
  className: 'flex items-center p-2 space-x-2 bg-ui-0 rounded-xl sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const FormTitle = styled.span.attrs({
  className: 'ft-text-base font-bold text-ui-800 pb-0.5',
})``;

const FormHelpText = styled.p.attrs({
  className: 'ft-text-sm text-ui-600 pb-1.5',
})``;

const ActionContainer = styled.div.attrs({
  className: 'flex flex-col w-full space-y-1.5',
})``;

export default MintTokensToTreasuryMenu;
