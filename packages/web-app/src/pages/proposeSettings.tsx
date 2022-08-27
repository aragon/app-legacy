import React from 'react';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import {generatePath, useParams} from 'react-router-dom';

import ReviewProposal from 'containers/reviewProposal';
import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import DefineProposal from 'containers/defineProposal';
import SetupVotingForm from 'containers/setupVotingForm';
import {useNetwork} from 'context/network';
import {EditSettings} from 'utils/paths';
import CompareSettings from 'containers/compareSettings';

const ProposeSettings: React.FC = () => {
  const {t} = useTranslation();
  const {dao} = useParams();
  const {network} = useNetwork();

  return (
    <>
      <FullScreenStepper
        wizardProcessName={t('newProposal.title')}
        navLabel={t('navLinks.settings')}
        returnPath={generatePath(EditSettings, {network, dao})}
      >
        <Step
          wizardTitle={t('settings.proposeSettings')}
          wizardDescription={t('settings.proposeSettingsSubtitle')}
        >
          <CompareSettings />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.defineProposal.heading')}
          wizardDescription={t('newWithdraw.defineProposal.description')}
        >
          <DefineProposal />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.setupVoting.title')}
          wizardDescription={t('newWithdraw.setupVoting.description')}
        >
          <SetupVotingForm />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.reviewProposal.heading')}
          wizardDescription={t('newWithdraw.reviewProposal.description')}
          nextButtonLabel={t('labels.submitWithdraw')}
          isNextButtonDisabled
          fullWidth
        >
          <ReviewProposal defineProposalStepNumber={2} />
        </Step>
      </FullScreenStepper>
    </>
  );
};

export default withTransaction('ProposeSettings', 'component')(ProposeSettings);
