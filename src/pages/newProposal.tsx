import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {useParams} from 'react-router-dom';

import {Loading} from 'components/temporary';
import ProposalStepper from 'containers/proposalStepper';
import {ActionsProvider} from 'context/actions';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {CreateProposalFormData} from 'utils/types';
import {UpdateProvider} from 'context/update';

const updateProposalValues = {
  updateFramework: {
    os: false,
    plugin: false,
  },
};

export const NewProposal: React.FC = () => {
  const {type} = useParams();
  const {data, isLoading} = useDaoDetailsQuery();

  const isUpdateProposal = type === 'os-update';

  const formMethods = useForm<CreateProposalFormData>({
    mode: 'onChange',
    defaultValues: {
      links: [{name: '', url: ''}],
      startSwitch: 'now',
      durationSwitch: 'duration',
      actions: [],
      ...(isUpdateProposal ? updateProposalValues : {}),
    },
  });

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (isLoading) return <Loading />;

  if (!data) return null;

  return (
    <FormProvider {...formMethods}>
      <ActionsProvider daoId={data.address}>
        <UpdateProvider>
          <ProposalStepper />
        </UpdateProvider>
      </ActionsProvider>
    </FormProvider>
  );
};
