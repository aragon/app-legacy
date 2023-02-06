import {
  AlertInline,
  Label,
  LinearProgress,
  NumberInput,
} from '@aragon/ui-components';
import React from 'react';
import {
  Controller,
  useFormContext,
  useWatch,
  ValidateResult,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

export const MultisigMinimumApproval = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();
  const [multisigWallets, multisigMinimumApprovals] = useWatch({
    name: ['multisigWallets', 'multisigMinimumApprovals'],
    control: control,
  });
  const computeDefaultValue = () => {
    const ceiledApprovals = Math.ceil(multisigWallets.length / 2);
    if (multisigWallets.length % 2) {
      return ceiledApprovals;
    }
    return ceiledApprovals + 1;
  };

  const validateMinimumApprovals = (value: number): ValidateResult => {
    if (value > multisigWallets.length) {
      return t('errors.ltAmount', {amount: multisigWallets.length});
    } else if (value < 0) {
      return t('errors.lteZero');
    }
    return true;
  };

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
          validate: value => validateMinimumApprovals(value),
        }}
        render={({
          field: {onBlur, onChange, value, name},
          fieldState: {error},
        }) => (
          <>
            <Container>
              <div className="w-1/3">
                <NumberInput
                  name={name}
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder={t('placeHolders.daoName')}
                  max={multisigWallets.length}
                  min={0}
                />
              </div>

              <div className="flex flex-1 items-center">
                <LinearProgressContainer>
                  <LinearProgress max={multisigWallets.length} value={value} />
                  <ProgressInfo>
                    {multisigMinimumApprovals !== multisigWallets.length ? (
                      <p
                        className="font-bold text-right text-primary-500"
                        style={{
                          position: 'relative',
                          flexBasis: `${
                            (value / multisigWallets.length) * 100
                          }%`,
                        }}
                      >
                        {value}
                      </p>
                    ) : (
                      <p className="font-bold text-right text-primary-500">
                        {value}
                      </p>
                    )}
                    <p className="text-ui-600 ft-text-sm">
                      {t('createDAO.step4.minApprovalAddressCount', {
                        count: multisigWallets.length,
                      })}
                    </p>
                  </ProgressInfo>
                </LinearProgressContainer>
              </div>
            </Container>

            {error?.message && (
              <AlertInline label={error.message} mode="critical" />
            )}
            {value <= multisigWallets.length / 2 && value >= 0 && (
              <AlertInline
                label={t('createDAO.step4.alerts.minority')}
                mode="warning"
              />
            )}
            {value > multisigWallets.length / 2 &&
              value <= multisigWallets.length && (
                <AlertInline
                  label={t('createDAO.step4.alerts.majority')}
                  mode="success"
                />
              )}
          </>
        )}
      />
    </>
  );
};

const Container = styled.div.attrs({
  className: 'flex items-center p-3 space-x-3 rounded-xl bg-ui-0',
})``;
const LinearProgressContainer = styled.div.attrs({
  className: 'flex relative flex-1 items-center',
})``;
const ProgressInfo = styled.div.attrs({
  className:
    'flex absolute whitespace-nowrap -top-2.5 justify-between space-x-0.5 w-full text-sm',
})``;
