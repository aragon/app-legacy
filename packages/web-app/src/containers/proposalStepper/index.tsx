import React from 'react';
import {useFormContext, useFormState, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath} from 'react-router-dom';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import ConfigureActions from 'containers/configureActions';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm, {
  isValid as setupVotingIsValid,
} from 'containers/setupVotingForm';
import {useActionsContext} from 'context/actions';
import {useNetwork} from 'context/network';
import {useDaoParam} from 'hooks/useDaoParam';
import {Governance} from 'utils/paths';
import {actionsAreValid} from 'utils/validators';
import {trackEvent} from 'services/analytics';
import {useWallet} from 'hooks/useWallet';

type ProposalStepperType = {
  enableTxModal: () => void;
};

const ProposalStepper: React.FC<ProposalStepperType> = ({
  enableTxModal,
}: ProposalStepperType) => {
  const {data: dao, isLoading} = useDaoParam();
  const {actions} = useActionsContext();

  const {t} = useTranslation();
  const {network} = useNetwork();
  const {trigger, control, getValues} = useFormContext();
  const {address} = useWallet();

  const [durationSwitch, formActions] = useWatch({
    name: ['durationSwitch', 'actions'],
    control,
  });

  const {errors, dirtyFields} = useFormState({
    control,
  });

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading) {
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
        onNextButtonClicked={next => {
          trackEvent('newProposal_nextBtn_clicked', {
            dao_address: dao,
            step: '1_define_proposal',
            settings: {
              author_address: address,
              title: getValues('proposalTitle'),
              summary: getValues('proposalSummary'),
              proposal: getValues('proposal'),
              resources_list: getValues('links'),
            },
          });
          next();
        }}
      >
        <DefineProposal />
      </Step>
      <Step
        wizardTitle={t('newWithdraw.setupVoting.title')}
        wizardDescription={t('newWithdraw.setupVoting.description')}
        isNextButtonDisabled={!setupVotingIsValid(errors, durationSwitch)}
        onNextButtonClicked={next => {
          trackEvent('newProposal_nextBtn_clicked', {
            dao_address: dao,
            step: '2_setup_voting',
            settings: {
              start: getValues('startUtc'),
              end: getValues('endUtc'),
            },
          });
          next();
        }}
      >
        <SetupVotingForm />
      </Step>
      <Step
        wizardTitle={t('newProposal.configureActions.heading')}
        wizardDescription={t('newProposal.configureActions.description')}
        isNextButtonDisabled={!actionsAreValid(formActions, actions, errors)}
        onNextButtonDisabledClicked={() => {
          trigger('actions');
        }}
        onNextButtonClicked={next => {
          trackEvent('newProposal_nextBtn_clicked', {
            dao_address: dao,
            step: '3_configure_actions',
            settings: {
              actions: actions.map(action => action.name),
              actions_count: actions.length,
            },
          });
          next();
        }}
      >
        <ConfigureActions />
      </Step>
      <Step
        wizardTitle={t('newWithdraw.reviewProposal.heading')}
        wizardDescription={t('newWithdraw.reviewProposal.description')}
        nextButtonLabel={t('labels.submitWithdraw')}
        onNextButtonClicked={() => {
          trackEvent('newProposal_publishBtn_clicked', {dao_address: dao});
          enableTxModal();
        }}
        fullWidth
      >
        <ReviewProposal defineProposalStepNumber={1} addActionsStepNumber={3} />
      </Step>
    </FullScreenStepper>
  );
};

export default ProposalStepper;
