import {
  Controller,
  useFormContext,
  useWatch,
  ValidateResult,
} from 'react-hook-form';
import MinimumApproval from '../multisigMinimumApproval/minimumApproval';
import React, {useCallback, useEffect} from 'react';
import {generateAlert} from '../multisigMinimumApproval';
import {useTranslation} from 'react-i18next';

const MIN_REQUIRED_APPROVALS = 1;

export const ExecutionMultisigMinimumApproval = () => {
  const {t} = useTranslation();
  const {control, setValue, trigger} = useFormContext();
  const [committee, committeeMinimumApproval] = useWatch({
    name: ['committee', 'committeeMinimumApproval'],
  });

  const committeeCount = committee?.length ?? 0;

  const validateMinimumApproval = (value: number): ValidateResult => {
    if (value > committeeCount) {
      return t('errors.minimumApproval.exceedMaxThreshold');
    } else if (value <= 0) {
      return t('errors.required.minApproval');
    }
    return true;
  };

  const minApprovalChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      if (value > committeeCount) {
        setValue('committeeMinimumApproval', committeeCount.toString());
        e.target.value = committeeCount;
      }
      trigger(['committeeMinimumApproval']);
      onChange(e);
    },
    [committeeCount, setValue, trigger]
  );

  // This is used to update the committeeMinimumApproval when a wallet is deleted
  useEffect(() => {
    if (
      (Number(committeeMinimumApproval) === 0 && committeeCount === 1) ||
      Number(committeeMinimumApproval) > committeeCount
    ) {
      setValue('committeeMinimumApproval', committeeCount.toString());
    }
  }, [committeeCount, committeeMinimumApproval, setValue]);

  return (
    <Controller
      name="committeeMinimumApproval"
      control={control}
      defaultValue="1"
      rules={{
        validate: value => validateMinimumApproval(value),
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
            max={committeeCount}
            onBlur={onBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              minApprovalChanged(e, onChange)
            }
            error={generateAlert(value, committee.length, t, error)}
          />
        </>
      )}
    />
  );
};
