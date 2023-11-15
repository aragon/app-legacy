import React, {useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {useParams} from 'react-router-dom';

import {Loading} from 'components/temporary';
import ProposalStepper from 'containers/proposalStepper';
import {ActionsProvider} from 'context/actions';
import {CreateProposalProvider} from 'context/createProposal';
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

  const isUpdateProposal = type !== 'default';

  const [showTxModal, setShowTxModal] = useState(false);

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

  const enableTxModal = () => {
    setShowTxModal(true);
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (isLoading) return <Loading />;

  if (!data) return null;

  return (
    <FormProvider {...formMethods}>
      <ActionsProvider daoId={data.address}>
        <CreateProposalProvider
          showTxModal={showTxModal}
          setShowTxModal={setShowTxModal}
        >
          <UpdateProvider>
            <ProposalStepper enableTxModal={enableTxModal} />
          </UpdateProvider>
        </CreateProposalProvider>
      </ActionsProvider>
    </FormProvider>
  );
};
