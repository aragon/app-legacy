import {AlertInline} from '@aragon/ods';
import React, {useState} from 'react';
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
import {MintTokenForm} from 'containers/actionBuilder/mintTokens';
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
import {PluginTypes} from 'hooks/usePluginClient';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import {toDisplayEns} from 'utils/library';
import {Community} from 'utils/paths';
import {MintTokensFormData} from 'utils/types';

export const MintToken: React.FC = () => {
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();
  const {data: votingSettings, isLoading: settingsLoading} = useVotingSettings({
    pluginAddress: daoDetails?.plugins[0].instanceAddress as string,
    pluginType: daoDetails?.plugins[0].id as PluginTypes,
  });

  const {t} = useTranslation();
  const {network} = useNetwork();

  const formMethods = useForm<MintTokensFormData>({
    mode: 'onChange',
    defaultValues: {
      links: [{name: '', url: ''}],
      startSwitch: 'now',
      durationSwitch: 'duration',
      actions: [],
    },
  });

  const {errors, dirtyFields} = useFormState({
    control: formMethods.control,
  });

  const [formActions] = useWatch({
    name: ['actions'],
    control: formMethods.control,
  });

  const [showTxModal, setShowTxModal] = useState(false);
  const enableTxModal = () => {
    setShowTxModal(true);
  };
  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading || settingsLoading) {
    return <Loading />;
  }

  if (!daoDetails || !votingSettings) {
    return null;
  }

  return (
    <FormProvider {...formMethods}>
      <ActionsProvider daoId={daoDetails.address}>
        <CreateProposalProvider
          showTxModal={showTxModal}
          setShowTxModal={setShowTxModal}
        >
          <FullScreenStepper
            wizardProcessName={t('newProposal.title')}
            processType="ProposalCreation"
            navLabel={t('labels.addMember')}
            returnPath={generatePath(Community, {
              network,
              dao: toDisplayEns(daoDetails.ensDomain) || daoDetails.address,
            })}
          >
            <Step
              wizardTitle={t('labels.mintTokens')}
              wizardDescription={t('newProposal.mintTokens.methodDescription')}
              isNextButtonDisabled={!actionIsValid(errors, formActions)}
              onNextButtonDisabledClicked={() => formMethods.trigger('actions')}
            >
              <div className="space-y-2">
                <AlertInline
                  label={t('newProposal.mintTokens.additionalInfo')}
                  mode="neutral"
                />
                <MintTokenForm actionIndex={0} standAlone />
              </div>
            </Step>
            <Step
              wizardTitle={t('newWithdraw.setupVoting.title')}
              wizardDescription={t('newWithdraw.setupVoting.description')}
              isNextButtonDisabled={!setupVotingIsValid(errors)}
            >
              <SetupVotingForm pluginSettings={votingSettings} />
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
              onNextButtonClicked={enableTxModal}
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

/**
 * Check whether the mint tokens action is valid
 * @param errors form errors
 * @param formActions mint tokens actions
 * @returns whether the action is valid
 */
function actionIsValid(
  errors: FieldErrors,
  formActions: MintTokensFormData['actions']
) {
  if (errors.actions || !formActions[0]) return false;

  return !formActions[0]?.inputs?.mintTokensToWallets?.some(
    wallet => wallet.web3Address?.address === '' || Number(wallet.amount) === 0
  );
}
