import {MultisigVotingSettings} from '@aragon/sdk-client';
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
import {
  DefineProposal,
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
import {DaoMember, MultisigDaoMember, useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {
  isGaslessVotingSettings,
  useVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {
  removeUnchangedMinimumApprovalAction,
  toDisplayEns,
} from 'utils/library';
import {Community} from 'utils/paths';
import {
  ActionAddAddress,
  ActionRemoveAddress,
  ActionUpdateGaslessSettings,
  ActionUpdateMultisigPluginSettings,
  ManageMembersFormData,
} from 'utils/types';
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';
import {GaslessUpdateMinimumApproval} from '../containers/actionBuilder/updateMinimumApproval/gaslessUpdateMinimumApproval';

export const ManageMembers: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  // dao data
  const {data: daoDetails, isLoading: detailsLoading} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  // plugin data
  const {data: daoMembers, isLoading: membersLoading} = useDaoMembers(
    pluginAddress,
    pluginType
  );

  const {data: pluginSettings, isLoading: votingSettingsLoading} =
    useVotingSettings({pluginAddress, pluginType});

  const multisigVotingSettings = pluginSettings as
    | MultisigVotingSettings
    | undefined;
  const isGasless = isGaslessVotingSettings(pluginSettings);
  const isLoading = detailsLoading || membersLoading || votingSettingsLoading;

  const formMethods = useForm<ManageMembersFormData>({
    mode: 'onChange',
    defaultValues: {
      links: [{name: '', url: ''}],
      proposalTitle: '',
      startSwitch: 'now',
      durationSwitch: 'duration',
      actions: [],
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
      if (multisigVotingSettings || isGasless) {
        formMethods.setValue(
          'actions',
          removeUnchangedMinimumApprovalAction(
            formActions,
            pluginSettings as
              | GaslessPluginVotingSettings
              | MultisigVotingSettings
          ) as ManageMembersFormData['actions']
        );
        next();
      }
    },
    [
      formActions,
      formMethods,
      isGasless,
      multisigVotingSettings,
      pluginSettings,
    ]
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
  if (!daoDetails || !multisigVotingSettings || !daoMembers) return null;

  // For gasless voting, ignore useDaoMembers result
  // We are going to use the execution multisig provided by the sdk
  const members: DaoMember[] = isGasless
    ? pluginSettings.executionMultisigMembers?.map(a => {
        return {address: a} as MultisigDaoMember;
      }) ?? []
    : daoMembers.members;

  const minApprovals = isGasless
    ? pluginSettings.minTallyApprovals
    : multisigVotingSettings.minApprovals;

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
                !actionsAreValid(errors, formActions, minApprovals)
              }
              onNextButtonClicked={handleGoToSetupVoting}
              onNextButtonDisabledClicked={() => formMethods.trigger('actions')}
            >
              <>
                <AddAddresses
                  actionIndex={0}
                  useCustomHeader
                  currentDaoMembers={members}
                />
                <RemoveAddresses
                  actionIndex={1}
                  useCustomHeader
                  currentDaoMembers={members}
                />
                {isGasless ? (
                  <GaslessUpdateMinimumApproval
                    actionIndex={2}
                    useCustomHeader
                    currentDaoMembers={members}
                    currentMinimumApproval={minApprovals}
                    gaslessSettings={pluginSettings}
                    pluginAddress={pluginAddress}
                  />
                ) : (
                  <UpdateMinimumApproval
                    actionIndex={2}
                    useCustomHeader
                    currentDaoMembers={members}
                    currentMinimumApproval={minApprovals}
                  />
                )}
              </>
            </Step>
            <Step
              wizardTitle={t('newWithdraw.setupVoting.title')}
              wizardDescription={t('newWithdraw.setupVoting.description')}
              isNextButtonDisabled={!setupVotingIsValid(errors)}
            >
              <SetupVotingForm
                pluginSettings={
                  isGasless ? pluginSettings : multisigVotingSettings
                }
              />
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

// Note: Keeping the following helpers here because they are very specific to this flow
/**
 * Check whether the add/remove actions are valid as a whole
 * @param errors form errors
 * @param formActions add and remove address actions
 * @returns whether the actions are valid
 */
function actionsAreValid(
  errors: FieldErrors,
  formActions: ManageMembersFormData['actions'],
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

    if (formActions[i].name === 'modify_gasless_voting_settings') {
      const newMinimumApproval = (formActions[i] as ActionUpdateGaslessSettings)
        .inputs.minTallyApprovals;

      minimumApprovalChanged = minApprovals !== newMinimumApproval;
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
