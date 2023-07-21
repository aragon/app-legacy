import {
  AlertInline,
  CheckboxListItem,
  Label,
  LinearProgress,
  NumberInput,
  Tag,
} from '@aragon/ods';
import {MultisigMinimumApproval} from 'components/multisigMinimumApproval';
import React, {useCallback} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import AddWallets from 'components/addWallets';
import AddCommitteeMembers from 'components/addCommitteeMembers';

const DefineCommittee: React.FC = () => {
  const {t} = useTranslation();
  const {control, setValue, getValues, trigger} = useFormContext();

  // const [] = useWatch({
  //   name: [],
  // });

  return (
    <>
      <FormItem>
        <Label
          label={t('labels.executiveCommitteeMembers')}
          helpText={t('createDAO.step5.executiveCommitteeMembersSubtitle')}
        />
        <AddCommitteeMembers />
      </FormItem>
    </>
  );
};

export default DefineCommittee;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;
