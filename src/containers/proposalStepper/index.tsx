import React, {useState} from 'react';
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
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import {
  isMultisigVotingSettings,
  useVotingSettings,
} from 'hooks/useVotingSettings';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {getCanonicalUtcOffset} from 'utils/date';
import {removeUnchangedMinimumApprovalAction} from 'utils/library';
import {Governance} from 'utils/paths';
import {Action} from 'utils/types';
import {actionsAreValid} from 'utils/validators';

type ProposalStepperType = {
  enableTxModal: () => void;
};

const ProposalStepper: React.FC<ProposalStepperType> = ({
  enableTxModal,
}: ProposalStepperType) => {
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  const {data: votingSettings, isLoading: settingsLoading} = useVotingSettings({
    pluginAddress: daoDetails?.plugins?.[0]?.instanceAddress as string,
    pluginType: daoDetails?.plugins?.[0]?.id as PluginTypes,
  });

  const {actions} = useActionsContext();
  const {open} = useGlobalModalContext();

  const {t} = useTranslation();
  const {network} = useNetwork();
  const {trigger, control, getValues, setValue} = useFormContext();
  const {address, isConnected} = useWallet();
  const [isActionsValid, setIsActionsValid] = useState(false);

  const [formActions] = useWatch({
    name: ['actions'],
  });

  const {errors, dirtyFields} = useFormState({
    control,
  });

  actionsAreValid(formActions, actions, errors, network).then(isValid =>
    setIsActionsValid(isValid)
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (isLoading || settingsLoading) {
    return <Loading />;
  }

  if (!daoDetails || !votingSettings) return null;

  return (
    <FullScreenStepper
      wizardProcessName={t('newProposal.title')}
      processType="ProposalCreation"
      navLabel={t('newProposal.title')}
      returnPath={generatePath(Governance, {network, dao: daoDetails.address})}
    >
      <Step
        wizardTitle={t('newWithdraw.defineProposal.heading')}
        wizardDescription={t('newWithdraw.defineProposal.description')}
        isNextButtonDisabled={!defineProposalIsValid(dirtyFields, errors)}
        onNextButtonClicked={next => {
          trackEvent('newProposal_nextBtn_clicked', {
            dao_address: daoDetails.address,
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
        isNextButtonDisabled={!setupVotingIsValid(errors)}
        onNextButtonClicked={next => {
          const [startDate, startTime, startUtc, endDate, endTime, endUtc] =
            getValues([
              'startDate',
              'startTime',
              'startUtc',
              'endDate',
              'endTime',
              'endUtc',
            ]);
          trackEvent('newProposal_nextBtn_clicked', {
            dao_address: daoDetails.address,
            step: '2_setup_voting',
            settings: {
              start: `${startDate}T${startTime}:00${getCanonicalUtcOffset(
                startUtc
              )}`,
              end: `${endDate}T${endTime}:00${getCanonicalUtcOffset(endUtc)}`,
            },
          });
          next();
        }}
      >
        <SetupVotingForm pluginSettings={votingSettings} />
      </Step>
      <Step
        wizardTitle={t('newProposal.configureActions.heading')}
        wizardDescription={t('newProposal.configureActions.description')}
        isNextButtonDisabled={!isActionsValid}
        onNextButtonDisabledClicked={() => {
          trigger('actions');
        }}
        onNextButtonClicked={next => {
          if (isMultisigVotingSettings(votingSettings)) {
            setValue(
              'actions',
              removeUnchangedMinimumApprovalAction(formActions, votingSettings)
            );
          }

          trackEvent('newProposal_nextBtn_clicked', {
            dao_address: daoDetails.address,
            step: '3_configure_actions',
            settings: {
              actions: formActions.map((action: Action) => action.name),
              actions_count: formActions.length,
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
        nextButtonLabel={t('labels.submitProposal')}
        onNextButtonClicked={() => {
          if (!isConnected) {
            open('wallet');
          } else {
            trackEvent('newProposal_publishBtn_clicked', {
              dao_address: daoDetails.address,
            });
            enableTxModal();
          }
        }}
        fullWidth
      >
        <ReviewProposal defineProposalStepNumber={1} addActionsStepNumber={3} />
      </Step>
    </FullScreenStepper>
  );
};

export default ProposalStepper;
