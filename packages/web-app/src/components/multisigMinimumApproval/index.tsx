import {
  AlertInline,
  Label,
  LinearProgress,
  NumberInput,
} from '@aragon/ui-components';
import React, {useCallback} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
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
    if (ceiledApprovals % 2) {
      return ceiledApprovals + 1;
    }
    return ceiledApprovals;
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
            {value <= multisigWallets.length / 2 ? (
              <AlertInline
                label={t('createDAO.step4.alerts.minority')}
                mode="warning"
              />
            ) : (
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
const ProgressBarTick = styled.div.attrs({
  className:
    'absolute left-1/2 w-1 h-2.5 border-r-2 border-l-2 transform -translate-x-1/2 bg-ui-300 border-ui-0',
})``;
const ProgressInfo = styled.div.attrs({
  className:
    'flex absolute whitespace-nowrap -top-2.5 justify-between space-x-0.5 w-full text-sm',
})``;
