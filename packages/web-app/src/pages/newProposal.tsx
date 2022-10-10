import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';

import {ActionsProvider} from 'context/actions';
import {useDaoParam} from 'hooks/useDaoParam';
import {Loading} from 'components/temporary';
import {CreateProposalProvider} from 'context/createProposal';
import ProposalStepper from 'containers/proposalStepper';

const NewProposal: React.FC = () => {
  const {data: dao, isLoading} = useDaoParam();
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <FormProvider {...formMethods}>
      <ActionsProvider daoId={dao}>
        <CreateProposalProvider
          showTxModal={showTxModal}
          setShowTxModal={setShowTxModal}
        >
          <ProposalStepper enableTxModal={enableTxModal} />
        </CreateProposalProvider>
      </ActionsProvider>
    </FormProvider>
  );
};

export default withTransaction('NewProposal', 'component')(NewProposal);
