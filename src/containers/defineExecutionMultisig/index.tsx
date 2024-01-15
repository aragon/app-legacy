import {Label} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import AddCommittee from 'components/addCommittee';
import ExecutionExpirationTime from 'components/executionExpirationTime';
import MinimumApproval from '../../components/multisigMinimumApproval/minimumApproval';
import {generateAlert} from '../../components/multisigMinimumApproval';

const MIN_REQUIRED_APPROVALS = 1;

const DefineExecutionMultisig: React.FC = () => {
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
    if (Number(committeeMinimumApproval) === 0 && committeeCount === 1) {
      setValue('committeeMinimumApproval', committeeCount.toString());
    } else if (Number(committeeMinimumApproval) > committeeCount) {
      setValue('committeeMinimumApproval', committeeCount.toString());
    }
  }, [committeeCount, committeeMinimumApproval, setValue]);

  return (
    <>
      {/*Executive committee members*/}
      <FormItem>
        <Label
          label={t('createDao.executionMultisig.membersLabel')}
          helpText={t('createDao.executionMultisig.membersDesc')}
        />
        <AddCommittee />
      </FormItem>

      {/*Minimum Approval*/}
      <FormItem>
        <Label
          label={t('labels.minimumApproval')}
          helpText={t('createDAO.step4.minimumApprovalSubtitle')}
        />
        <Controller
          name="committeeMinimumApproval"
          control={control}
          defaultValue="1"
          rules={{
            required: t('errors.required.amount'),
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
      </FormItem>

      {/* Execution Expiration Time */}
      <ExecutionExpirationTime />
    </>
  );
};

export default DefineExecutionMultisig;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

styled.div.attrs({
  className:
    'flex flex-col xl:flex-row items-center p-4 pt-8 xl:p-6 gap-x-6 gap-y-8 rounded-xl bg-neutral-0',
})``;

styled.div.attrs({
  className: 'flex relative flex-1 items-center',
})``;

styled.div.attrs({
  className:
    'flex absolute whitespace-nowrap -top-5 justify-between space-x-1 w-full text-sm leading-normal ',
})``;

styled.p.attrs({
  className: 'font-semibold text-right text-primary-500',
})``;

styled.p.attrs({
  className: 'text-neutral-600 ft-text-sm',
})``;

styled.div.attrs({
  className: 'order-2 xl:order-1 w-full xl:w-1/4',
})``;

styled.div.attrs({
  className: 'flex flex-1 xl:order-2 items-center w-full',
})``;
