import {withTransaction} from '@elastic/apm-rum-react';
import React from 'react';
import {FormProvider, useForm, useFormState} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath} from 'react-router-dom';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm, {
  isValid as setupVotingIsValid,
} from 'containers/setupVotingForm';
import {ActionsProvider} from 'context/actions';
import {useNetwork} from 'context/network';
import {useDaoParam} from 'hooks/useDaoParam';
import {Community} from 'utils/paths';
import AddAddresses from 'containers/actionBuilder/addAddresses';
import RemoveAddresses from 'containers/actionBuilder/removeAddresses';

const ManageMembers: React.FC = () => {
  const {data: dao, loading} = useDaoParam();

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
      <ActionsProvider daoId={dao}>
        <FullScreenStepper
          wizardProcessName={t('newProposal.title')}
          navLabel={t('labels.manageMember')}
          returnPath={generatePath(Community, {network, dao})}
        >
          <Step
            wizardTitle={t('newProposal.manageWallets.title')}
            wizardDescription={t('newProposal.manageWallets.description')}
          >
            <>
              <AddAddresses actionIndex={0} useCustomHeader />
              <RemoveAddresses actionIndex={1} useCustomHeader />
            </>
          </Step>
          <Step
            wizardTitle={t('newWithdraw.setupVoting.title')}
            wizardDescription={t('newWithdraw.setupVoting.description')}
            isNextButtonDisabled={!setupVotingIsValid(errors, durationSwitch)}
          >
            <SetupVotingForm />
          </Step>
          <Step
            wizardTitle={t('newWithdraw.defineProposal.heading')}
            wizardDescription={t('newWithdraw.defineProposal.description')}
            isNextButtonDisabled={!defineProposalIsValid(dirtyFields, errors)}
          >
            <DefineProposal />
          </Step>
          <Step
            wizardTitle={t('newWithdraw.reviewProposal.heading')}
            wizardDescription={t('newWithdraw.reviewProposal.description')}
            nextButtonLabel={t('labels.submitWithdraw')}
            onNextButtonClicked={() => alert('submit tx')}
            fullWidth
          >
            <ReviewProposal defineProposalStepNumber={3} />
          </Step>
        </FullScreenStepper>
      </ActionsProvider>
    </FormProvider>
  );
};

export default withTransaction('ManageMembers', 'component')(ManageMembers);
