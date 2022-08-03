import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import React from 'react';
import {useForm, FormProvider, useFormState} from 'react-hook-form';
import {generatePath} from 'react-router-dom';

import {Community} from 'utils/paths';
import ReviewProposal from 'containers/reviewProposal';
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
import {
  MintTokenDescription,
  MintTokenForm,
} from 'containers/actionBuilder/mintTokens';
import {AlertInline} from '@aragon/ui-components';

const MintToken: React.FC = () => {
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
      <ActionsProvider>
        <FullScreenStepper
          wizardProcessName={t('labels.addMember')}
          navLabel={t('labels.addMember')}
          returnPath={generatePath(Community, {network, dao})}
        >
          <Step
            wizardTitle={t('labels.mintTokens')}
            wizardDescription={<MintTokenDescription />}
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
            <ReviewProposal />
          </Step>
        </FullScreenStepper>
      </ActionsProvider>
    </FormProvider>
  );
};

export default withTransaction('MintToken', 'component')(MintToken);
