import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {useForm, FormProvider, useFormState} from 'react-hook-form';
import {generatePath} from 'react-router-dom';

import {Governance} from 'utils/paths';
import AddActionMenu from 'containers/addActionMenu';
import ReviewProposal from 'containers/reviewProposal';
import ConfigureActions, {
  isValid as actionsAreValid,
} from 'containers/configureActions';
import {ActionsProvider} from 'context/actions';
import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import SetupVotingForm, {
  isValid as setupVotingIsValid,
} from 'containers/setupVotingForm';
import {useNetwork} from 'context/network';
import {useDaoParam} from 'hooks/useDaoParam';
import {Loading} from 'components/temporary';
import {CreateProposalProvider} from 'context/createProposal';
import {useDaoActions} from 'hooks/useDaoActions';

const NewProposal: React.FC = () => {
  const {data: dao, loading} = useDaoParam();
  const {data: actions} = useDaoActions(dao);
  const [showTxModal, setShowTxModal] = useState(false);

  const {t} = useTranslation();
  const {network} = useNetwork();
  const formMethods = useForm({
    mode: 'onChange',
  });
  const {errors, dirtyFields} = useFormState({
    control: formMethods.control,
  });
  const [durationSwitch] = formMethods.getValues(['durationSwitch']);

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
        <ActionsProvider>
          <FullScreenStepper
            wizardProcessName={t('newProposal.title')}
            navLabel={t('newProposal.title')}
            returnPath={generatePath(Governance, {network, dao})}
          >
            <Step
              wizardTitle={t('newWithdraw.defineProposal.heading')}
              wizardDescription={t('newWithdraw.defineProposal.description')}
              isNextButtonDisabled={!defineProposalIsValid(dirtyFields, errors)}
            >
              <DefineProposal />
            </Step>
            <Step
              wizardTitle={t('newWithdraw.setupVoting.title')}
              wizardDescription={t('newWithdraw.setupVoting.description')}
              isNextButtonDisabled={!setupVotingIsValid(errors, durationSwitch)}
            >
              <SetupVotingForm />
            </Step>
            <Step
              wizardTitle={t('newProposal.configureActions.heading')}
              wizardDescription={t('newProposal.configureActions.description')}
              isNextButtonDisabled={!actionsAreValid(errors)}
            >
              <ConfigureActions />
            </Step>
            <Step
              wizardTitle={t('newWithdraw.reviewProposal.heading')}
              wizardDescription={t('newWithdraw.reviewProposal.description')}
              nextButtonLabel={t('labels.submitWithdraw')}
              onNextButtonClicked={() => setShowTxModal(true)}
              fullWidth
            >
              <ReviewProposal defineProposalStepNumber={1} />
            </Step>
          </FullScreenStepper>

          <AddActionMenu actions={actions} />
        </ActionsProvider>
      </CreateProposalProvider>
    </FormProvider>
  );
};

export default withTransaction('NewProposal', 'component')(NewProposal);
