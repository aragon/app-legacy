import {withTransaction} from '@elastic/apm-rum-react';
import React, {useCallback, useState} from 'react';
import {
  FieldErrors,
  FormProvider,
  useForm,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath} from 'react-router-dom';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import AddAddresses from 'containers/actionBuilder/addAddresses';
import RemoveAddresses from 'containers/actionBuilder/removeAddresses';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm, {
  isValid as setupVotingIsValid,
} from 'containers/setupVotingForm';
import {ActionsProvider} from 'context/actions';
import {CreateProposalProvider} from 'context/createProposal';
import {useNetwork} from 'context/network';
import {useDaoParam} from 'hooks/useDaoParam';
import {Community} from 'utils/paths';
import {ActionAddAddress, ActionRemoveAddress} from 'utils/types';

const ManageMembers: React.FC = () => {
  const {data: dao, isLoading} = useDaoParam();

  const {t} = useTranslation();
  const {network} = useNetwork();
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: {
      links: [{name: '', url: ''}],
      durationSwitch: 'date',
      actions: [] as Array<ActionAddAddress | ActionRemoveAddress>,
    },
  });
  const {errors, dirtyFields} = useFormState({
    control: formMethods.control,
  });

  const [durationSwitch, formActions] = useWatch({
    name: ['durationSwitch', 'actions'],
    control: formMethods.control,
  });

  const [showTxModal, setShowTxModal] = useState(false);

  const handleOnNextButtonClicked = useCallback(
    (next: () => void) => {
      if (formActions) {
        formMethods.setValue('actions', getNonEmptyActions(formActions));
      }

      next();
    },
    [formActions, formMethods]
  );

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
          <FullScreenStepper
            wizardProcessName={t('newProposal.title')}
            navLabel={t('labels.manageMember')}
            returnPath={generatePath(Community, {network, dao})}
          >
            <Step
              wizardTitle={t('newProposal.manageWallets.title')}
              wizardDescription={t('newProposal.manageWallets.description')}
              onNextButtonClicked={handleOnNextButtonClicked}
              isNextButtonDisabled={!actionsAreValid(errors, formActions)}
              onNextButtonDisabledClicked={() => formMethods.trigger('actions')}
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
              onNextButtonClicked={() => setShowTxModal(true)}
              fullWidth
            >
              <ReviewProposal defineProposalStepNumber={3} />
            </Step>
          </FullScreenStepper>
        </CreateProposalProvider>
      </ActionsProvider>
    </FormProvider>
  );
};

export default withTransaction('ManageMembers', 'component')(ManageMembers);

// Note: Keeping the following helpers here because they are very specific to this flow
/**
 * Check whether the add/remove actions are valid as a whole
 * @param errors form errors
 * @param formActions add and remove address actions
 * @returns whether the actions are valid
 */
function actionsAreValid(
  errors: FieldErrors,
  formActions: Array<ActionAddAddress | ActionRemoveAddress> = []
) {
  if (errors.actions) return false;

  let containsEmptyField = false;
  let totalWallets = 0;

  for (let i = 0; i < formActions.length; i++) {
    containsEmptyField = formActions[i].inputs.memberWallets.some(
      w => w.address === ''
    );

    if (containsEmptyField) {
      return false;
    }

    totalWallets += formActions[i].inputs.memberWallets.length;
  }

  return totalWallets > 0;
}

/**
 * Filter out all empty add/remove address actions
 * @param actions add/remove address actions
 * @returns list of non empty address
 */
function getNonEmptyActions(
  actions: Array<ActionAddAddress | ActionRemoveAddress>
) {
  let memberWallets;

  return actions.filter(a => {
    memberWallets = a.inputs.memberWallets;

    return (
      // at least one address to be removed
      (a.name === 'remove_address' && memberWallets.length > 0) ||
      // no empty address to be added
      (a.name === 'add_address' && !memberWallets.some(w => w.address === ''))
    );
  });
}
