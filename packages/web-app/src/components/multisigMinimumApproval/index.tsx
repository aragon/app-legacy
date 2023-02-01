import {
  AlertInline,
  Label,
  LinearProgress,
  NumberInput,
} from '@aragon/ui-components';
import {m} from 'framer-motion';
import React, {useEffect} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

export const MultisigMinimumApproval = () => {
  const {t} = useTranslation();
  const {control, setValue} = useFormContext();
  const [multisigWallets, multisigMinimumApprovals] = useWatch({
    name: ['multisigWallets', 'multisigMinimumApprovals'],
    control: control,
  });

  useEffect(() => {
    if (multisigMinimumApprovals > multisigWallets.length) {
      setValue('multisigMinimumApprovals', multisigWallets.length);
    }
  }, [multisigMinimumApprovals, setValue, multisigWallets.length]);

  const validateminimumApprovals = (value: number) =>
    value <= multisigWallets.length;

  return (
    <>
      <Label
        label={t('labels.minimumApproval')}
        helpText={t('createDAO.step4.minimumApprovalSubtitle')}
      />
      <Controller
        name="multisigMinimumApprovals"
        control={control}
        defaultValue={Math.ceil(multisigWallets.length / 2)}
        rules={{
          validate: value => validateminimumApprovals(value),
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
                />
              </div>

              <div className="flex flex-1 items-center">
                <LinearProgressContainer>
                  <LinearProgress max={multisigWallets.length} value={value} />
                  <ProgressBarTick />
                  <ProgressInfo>
                    {multisigMinimumApprovals !== multisigWallets.length && (
                      <p
                        className="font-bold text-right text-primary-500"
                        style={{
                          flexBasis: `${
                            (value / multisigWallets.length) * 100
                          }%`,
                        }}
                      >
                        {value}
                      </p>
                    )}
                    {multisigMinimumApprovals === multisigWallets.length && (
                      <p
                        className="font-bold text-right text-primary-500"
                      >
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
            {value < multisigWallets.length / 2 ? (
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
    'flex absolute -top-2.5 justify-between space-x-0.5 w-full text-sm',
})``;
