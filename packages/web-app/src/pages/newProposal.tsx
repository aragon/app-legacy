import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {useForm, FormProvider, useFormState} from 'react-hook-form';

import {ActionsProvider} from 'context/actions';
import {useDaoParam} from 'hooks/useDaoParam';
import {Loading} from 'components/temporary';
import {CreateProposalProvider} from 'context/createProposal';
import ProposalStepper from 'containers/proposalStepper';

const NewProposal: React.FC = () => {
  const {data: dao, loading} = useDaoParam();
  const [showTxModal, setShowTxModal] = useState(false);

  const formMethods = useForm({
    mode: 'onChange',
  });

  const enableTxModal = () => {
    setShowTxModal(true);
  };

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (loading) {
    return <Loading />;
  }

  return (
    <FormProvider {...formMethods}>
      <CreateProposalProvider
        showTxModal={showTxModal}
        setShowTxModal={setShowTxModal}
      >
        <ActionsProvider daoId={dao}>
          <ProposalStepper enableTxModal={enableTxModal} />
        </ActionsProvider>
      </CreateProposalProvider>
    </FormProvider>
  );
};

export default withTransaction('NewProposal', 'component')(NewProposal);
