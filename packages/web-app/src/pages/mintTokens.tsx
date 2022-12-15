import {AlertInline} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
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
import {
  MintTokenDescription,
  MintTokenForm,
} from 'containers/actionBuilder/mintTokens';
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
import {ActionMintToken} from 'utils/types';

const MintToken: React.FC = () => {
  const {data: dao, isLoading} = useDaoParam();

  const {t} = useTranslation();
  const {network} = useNetwork();

  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: {
      links: [{name: '', url: ''}],
      durationSwitch: 'date',
      actions: [] as Array<ActionMintToken>,
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
            navLabel={t('labels.addMember')}
            returnPath={generatePath(Community, {network, dao})}
          >
            <Step
              wizardTitle={t('labels.mintTokens')}
              wizardDescription={<MintTokenDescription />}
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

export default withTransaction('MintToken', 'component')(MintToken);

/**
 * Check whether the mint tokens action is valid
 * @param errors form errors
 * @param formActions mint tokens actions
 * @returns whether the action is valid
 */
function actionIsValid(
  errors: FieldErrors,
  formActions: Array<ActionMintToken>
) {
  if (errors.actions || !formActions[0]) return false;

  return !formActions[0]?.inputs?.mintTokensToWallets?.some(
    wallet => wallet.address === '' || Number(wallet.amount) === 0
  );
}
