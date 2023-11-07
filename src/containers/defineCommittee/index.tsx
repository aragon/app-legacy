import {AlertInline, Label, LinearProgress, NumberInput} from '@aragon/ods-old';
import React, {useCallback, useEffect} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import AddCommitteeMembers from 'components/addCommitteeMembers';
import ExecutionExpirationTime from 'components/executionExpirationTime';

const DefineCommittee: React.FC = () => {
  const {t} = useTranslation();
  const {control, setValue, trigger} = useFormContext();

  const [committee, committeeMinimumApproval] = useWatch({
    name: ['committee', 'committeeMinimumApproval'],
  });

  const committeeCount = committee?.length ?? 0;

  const minimumApprovalValidator = (value: string | number) => {
    return Number(value) > committeeCount || Number(value) < 1
      ? t('errors.minimumApprovalCommittee', {max: committeeCount})
      : true;
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
    if (committeeMinimumApproval > committeeCount) {
      setValue('committeeMinimumApproval', committeeCount.toString());
    }
  }, [committeeCount, committeeMinimumApproval, setValue]);

  return (
    <>
      {/*Executive committee members*/}
      <FormItem>
        <Label
          label={t('labels.executionMultisigMembers')}
          helpText={t('createDAO.step5.executionMultisigMembersSubtitle')}
        />
        <AddCommitteeMembers />
      </FormItem>

      {/*Minimum Approval*/}
      <FormItem>
        <Label
          label={t('labels.minimumApproval')}
          helpText={t('createDAO.step5.minimumAprovalDescritpion')}
        />
        <Controller
          name="committeeMinimumApproval"
          control={control}
          defaultValue="1"
          rules={{
            validate: value => minimumApprovalValidator(value),
          }}
          render={({
            field: {onBlur, onChange, value, name},
            fieldState: {error},
          }) => (
            <>
              <ApprovalWrapper>
                <div className="tablet:w-1/3">
                  <NumberInput
                    name={name}
                    value={value}
                    onBlur={onBlur}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      minApprovalChanged(e, onChange)
                    }
                    disabled={committeeCount === 0}
                    min="1"
                  />
                </div>

                <LinearProgressContainer>
                  <LinearProgress max={committeeCount} value={value} />

                  <ProgressInfo2>
                    <p
                      className="text-right text-primary-500"
                      style={{
                        flexBasis: `${
                          (Number(value) / Number(committeeCount)) * 100
                        }%`,
                      }}
                    >
                      {value}
                    </p>

                    <p className="shrink-0 text-primary-600">
                      {t('createDAO.step5.alerts.ofAddresses', {
                        number: committeeCount,
                      })}
                    </p>
                  </ProgressInfo2>
                </LinearProgressContainer>
              </ApprovalWrapper>

              {error?.message && (
                <AlertInline
                  label={
                    error?.message ??
                    t('errors.minimumApprovalCommittee', {
                      max: committeeCount,
                    })
                  }
                  mode="warning"
                />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Execution Expiration Time */}
      <FormItem>
        <Label
          label={t('labels.executionExpirationTime')}
          helpText={t('createDAO.step5.executionTimeSubtitle')}
        />
        <ExecutionExpirationTime />
      </FormItem>
    </>
  );
};

export default DefineCommittee;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const ApprovalWrapper = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-3 gap-3',
})``;

const LinearProgressContainer = styled.div.attrs({
  className: 'flex relative flex-1 items-center',
})``;

const ProgressInfo2 = styled.div.attrs({
  className:
    'flex absolute -top-2.5 justify-between space-x-0.5 w-full text-sm',
})``;
