import {AlertInlineProps, Label} from '@aragon/ui-components';
import React, {useCallback, useEffect} from 'react';
import {
  Controller,
  FieldError,
  useFormContext,
  useWatch,
  ValidateResult,
} from 'react-hook-form';
import {TFunction, useTranslation} from 'react-i18next';
import {CORRECTION_DELAY} from 'utils/constants';

import MinimumApproval from './minimumApproval';

const MIN_REQUIRED_APPROVALS = 1;

export const MultisigMinimumApproval = () => {
  const {t} = useTranslation();
  const {control, clearErrors, setValue, trigger} = useFormContext();
  const [multisigWallets] = useWatch({
    name: ['multisigWallets'],
    control: control,
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const computeDefaultValue = useCallback(() => {
    const ceiledApprovals = Math.ceil(multisigWallets.length / 2);
    if (multisigWallets.length % 2) {
      return ceiledApprovals;
    }
    return ceiledApprovals + 1;
  }, [multisigWallets.length]);

  const validateMinimumApproval = (value: number): ValidateResult => {
    if (value > multisigWallets.length) {
      return t('errors.minApprovalGtMembers');
    } else if (value <= 0) {
      return t('errors.required.minApproval');
    }
    return true;
  };

  // handles change of approval
  const handleApprovalChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: React.ChangeEventHandler
  ) => {
    const value = Number(event.target.value);

    if (value > multisigWallets.length) {
      setTimeout(() => {
        clearErrors('multisigMinimumApprovals');
        setValue('multisigMinimumApprovals', multisigWallets.length);
        trigger('multisigMinimumApprovals');
      }, CORRECTION_DELAY);
    } else if (value <= 0) {
      setTimeout(() => {
        clearErrors('multisigMinimumApprovals');
        setValue('multisigMinimumApprovals', 1);
        trigger('multisigMinimumApprovals');
      }, CORRECTION_DELAY);
    } else {
      event.target.value = value.toString();
    }

    onChange(event);
  };

  /*************************************************
   *                      Effects                  *
   *************************************************/
  useEffect(() => {
    setValue('multisigMinimumApprovals', computeDefaultValue());
  }, [computeDefaultValue, setValue]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <>
      <Label
        label={t('labels.minimumApproval')}
        helpText={t('createDAO.step4.minimumApprovalSubtitle')}
      />
      <Controller
        name="multisigMinimumApprovals"
        control={control}
        defaultValue={computeDefaultValue}
        rules={{
          validate: validateMinimumApproval,
        }}
        render={({
          field: {onBlur, onChange, value, name},
          fieldState: {error},
        }) => (
          <>
            <MinimumApproval
              name={name}
              value={value}
              min={MIN_REQUIRED_APPROVALS}
              max={multisigWallets.length}
              onBlur={onBlur}
              onChange={e => handleApprovalChanged(e, onChange)}
              error={generateAlert(value, multisigWallets.length, t, error)}
            />
          </>
        )}
      />
    </>
  );
};

function generateAlert(
  inputValue: string | number,
  max: number,
  t: TFunction,
  error?: FieldError
): AlertInlineProps {
  if (error?.message) return {label: error.message, mode: 'critical'};

  const value = Number(inputValue);

  // minority can pass proposal (0-50%)
  if (value <= max / 2 && value > 0)
    return {label: t('createDAO.step4.alerts.minority'), mode: 'warning'};

  // majority to pass proposal (50% +1 -> 75%)
  if (value < max * 0.75)
    return {label: t('createDAO.step4.alerts.majority'), mode: 'success'};

  // absolute majority
  return {
    label: t('createDAO.step4.alerts.absoluteMajority'),
    mode: 'warning',
  };
}
