import {useTranslation} from 'react-i18next';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {generatePath} from 'react-router-dom';

import {Governance} from 'utils/paths';
import ReviewProposal from 'containers/reviewProposal';
import ConfigureActions, {
  isValid as actionsAreValid,
} from 'containers/configureActions';
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
import {useActionsContext} from 'context/actions';
import {StringIndexed} from 'utils/types';

type ProposalStepperType = {
  enableTxModal: () => void;
  errors: StringIndexed;
  dirtyFields: StringIndexed;
};

const ProposalStepper: React.FC<ProposalStepperType> = ({
  enableTxModal,
  errors,
  dirtyFields,
}: ProposalStepperType) => {
  const {data: dao, loading} = useDaoParam();
  const {actions} = useActionsContext();

  const {t} = useTranslation();
  const {network} = useNetwork();
  const {getValues, trigger} = useFormContext();
  const [durationSwitch, actionsForm] = getValues([
    'durationSwitch',
    'actions',
  ]);

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (loading) {
    return <Loading />;
  }

  return (
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
        isNextButtonDisabled={!actionsAreValid(actionsForm, actions, errors)}
        onNextButtonDisabledClicked={() => {
          trigger('actions');
        }}
      >
        <ConfigureActions />
      </Step>
      <Step
        wizardTitle={t('newWithdraw.reviewProposal.heading')}
        wizardDescription={t('newWithdraw.reviewProposal.description')}
        nextButtonLabel={t('labels.submitWithdraw')}
        onNextButtonClicked={enableTxModal}
        fullWidth
      >
        <ReviewProposal defineProposalStepNumber={1} />
      </Step>
    </FullScreenStepper>
  );
};

export default ProposalStepper;
