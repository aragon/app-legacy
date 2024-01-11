import {Label} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import AddCommittee from 'components/addCommittee';
import ExecutionExpirationTime from 'components/executionExpirationTime';
import {ExecutionMultisigMinimumApproval} from '../../components/executionMultisigMinimumApproval';

export type ConfigureExecutionMultisigProps = {
  isSettingPage?: boolean;
};

const DefineExecutionMultisig: React.FC<ConfigureExecutionMultisigProps> = ({
  isSettingPage = false,
}) => {
  const {t} = useTranslation();

  return (
    <>
      {/*Executive committee members*/}
      {!isSettingPage && (
        <FormItem>
          <Label
            label={t('createDao.executionMultisig.membersLabel')}
            helpText={t('createDao.executionMultisig.membersDesc')}
          />
          <AddCommittee />
        </FormItem>
      )}

      {/*Minimum Approval*/}
      <FormItem>
        <Label
          label={t('labels.minimumApproval')}
          helpText={t('createDAO.step4.minimumApprovalSubtitle')}
        />
        <ExecutionMultisigMinimumApproval />
      </FormItem>

      {/* Execution Expiration Time */}
      <FormItem>
        <Label
          label={t('createDao.executionMultisig.executionTitle')}
          helpText={t('createDao.executionMultisig.executionDesc')}
        />
        <ExecutionExpirationTime />
      </FormItem>
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
