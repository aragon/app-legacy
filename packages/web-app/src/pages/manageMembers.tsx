import {MultisigVotingSettings} from '@aragon/sdk-client';
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
import UpdateMinimumApproval from 'containers/actionBuilder/updateMinimumApproval';
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
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {
  removeUnchangedMinimumApprovalAction,
  toDisplayEns,
} from 'utils/library';
import {Community} from 'utils/paths';
import {
  ActionAddAddress,
  ActionRemoveAddress,
  ActionUpdateMultisigPluginSettings,
} from 'utils/types';

type ManageMemberActionTypes = Array<
  ActionAddAddress | ActionRemoveAddress | ActionUpdateMultisigPluginSettings
>;

const ManageMembers: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  // dao data
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();
  // plugin data
  const {data: pluginSettings} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );
  const {data: daoMembers} = useDaoMembers(
    daoDetails?.plugins?.[0]?.instanceAddress || '',
    (daoDetails?.plugins?.[0]?.id as PluginTypes) || undefined
  );
  const multisigDAOSettings = pluginSettings as MultisigVotingSettings;

  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: {
      links: [{name: '', url: ''}],
      proposalTitle: '',
      startSwitch: 'now',
      durationSwitch: 'duration',
      actions: [] as ManageMemberActionTypes,
    },
  });
  const {errors, dirtyFields} = useFormState({
    control: formMethods.control,
  });

  const [formActions] = useWatch({
    control: formMethods.control,
    name: ['actions'],
  });

  const [showTxModal, setShowTxModal] = useState(false);

  const handleGoToSetupVoting = useCallback(
    (next: () => void) => {
      formMethods.setValue(
        'actions',
        removeUnchangedMinimumApprovalAction(
          formActions,
          multisigDAOSettings
        ) as ManageMemberActionTypes
      );
      next();
    },
    [formActions, formMethods, multisigDAOSettings]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading) {
    return <Loading />;
  }

  // this should never happen basically because useDaoDetailsQuery
  // will navigate to NotFound page if the api returns null.
  // using this so that typescript doesn't complain about daoDetails
  // being possibly null. Unfortunately, I don't have a more elegant solution.
  if (!daoDetails) return null;

  return (
    <FormProvider {...formMethods}>
      <ActionsProvider daoId={daoDetails.address}>
        <CreateProposalProvider
          showTxModal={showTxModal}
          setShowTxModal={setShowTxModal}
        >
          <FullScreenStepper
            wizardProcessName={t('newProposal.title')}
            navLabel={t('labels.manageMember')}
            processType="ProposalCreation"
            returnPath={generatePath(Community, {
              network,
              dao: toDisplayEns(daoDetails.ensDomain) || daoDetails.address,
            })}
          >
            <Step
              wizardTitle={t('newProposal.manageWallets.title')}
              wizardDescription={t('newProposal.manageWallets.description')}
              isNextButtonDisabled={
                !actionsAreValid(
                  errors,
                  formActions,
                  multisigDAOSettings?.minApprovals
                )
              }
              onNextButtonClicked={handleGoToSetupVoting}
              onNextButtonDisabledClicked={() => formMethods.trigger('actions')}
            >
              <>
                <AddAddresses
                  actionIndex={0}
                  useCustomHeader
                  currentDaoMembers={daoMembers?.members}
                />
                <RemoveAddresses
                  actionIndex={1}
                  useCustomHeader
                  currentDaoMembers={daoMembers?.members}
                />
                <UpdateMinimumApproval
                  actionIndex={2}
                  useCustomHeader
                  currentDaoMembers={daoMembers?.members}
                  currentMinimumApproval={multisigDAOSettings?.minApprovals}
                />
              </>
            </Step>
            <Step
              wizardTitle={t('newWithdraw.setupVoting.title')}
              wizardDescription={t('newWithdraw.setupVoting.description')}
              isNextButtonDisabled={!setupVotingIsValid(errors)}
            >
              <SetupVotingForm pluginSettings={pluginSettings} />
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
              nextButtonLabel={t('labels.submitProposal')}
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
  formActions: Array<
    ActionAddAddress | ActionRemoveAddress | ActionUpdateMultisigPluginSettings
  >,
  minApprovals: number
) {
  if (errors.actions || !formActions) return false;

  let containsEmptyField = false;
  let removedWallets = 0;
  let minimumApprovalChanged = false;

  for (let i = 0; i < formActions.length; i++) {
    if (formActions[i].name === 'add_address') {
      containsEmptyField = (
        formActions[i] as ActionAddAddress
      ).inputs?.memberWallets.some(w => w.address === '');
      continue;
    }

    if (formActions[i].name === 'remove_address') {
      removedWallets += (formActions[i] as ActionRemoveAddress).inputs
        .memberWallets.length;
      continue;
    }

    if (formActions[i].name === 'modify_multisig_voting_settings') {
      const newMinimumApproval = (
        formActions[i] as ActionUpdateMultisigPluginSettings
      ).inputs.minApprovals;

      minimumApprovalChanged = minApprovals !== newMinimumApproval;
    }
  }

  return (
    !containsEmptyField ||
    minimumApprovalChanged ||
    (containsEmptyField && removedWallets > 0)
  );
}
