import {DaoDetails} from '@aragon/sdk-client';
import React, {useState} from 'react';
import {useFormContext, useFormState, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import ConfigureActions from 'containers/configureActions';
import {
  DefineProposal,
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm, {
  isValid as setupVotingIsValid,
} from 'containers/setupVotingForm';
import {useActionsContext} from 'context/actions';
import {useNetwork} from 'context/network';
import {useWallet} from 'hooks/useWallet';
import {generatePath} from 'react-router-dom';
import {trackEvent} from 'services/analytics';
import {getCanonicalUtcOffset} from 'utils/date';
import {toDisplayEns} from 'utils/library';
import {Finance} from 'utils/paths';
import {SupportedVotingSettings} from 'utils/types';
import {actionsAreValid} from 'utils/validators';
import {CreateProposalDialog} from 'containers/createProposalDialog';

interface WithdrawStepperProps {
  daoDetails: DaoDetails;
  pluginSettings: SupportedVotingSettings;
}

const WithdrawStepper: React.FC<WithdrawStepperProps> = ({
  daoDetails,
  pluginSettings,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {address} = useWallet();
  const {actions, addAction} = useActionsContext();

  const {control, getValues} = useFormContext();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {isConnected, isOnWrongNetwork} = useWallet();

  const {errors, dirtyFields} = useFormState({control: control});

  const formActions = useWatch({
    name: 'actions',
    control,
  });

  const handlePublishProposalClick = () => {
    if (isConnected) {
      if (isOnWrongNetwork) {
        open('network');
      } else {
        setIsDialogOpen(true);
      }
    } else {
      open('wallet');
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/

  return (
    <>
      <FullScreenStepper
        wizardProcessName={t('TransferModal.item2Title')}
        navLabel={t('allTransfer.newTransfer')}
        processType="ProposalCreation"
        returnPath={generatePath(Finance, {
          network,
          dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
        })}
      >
        <Step
          wizardTitle={t('newWithdraw.configureWithdraw.title')}
          wizardDescription={t('newWithdraw.configureWithdraw.subtitle')}
          isNextButtonDisabled={
            !actions.length || !actionsAreValid(formActions, actions, errors)
          }
          onNextButtonClicked={next => {
            trackEvent('newWithdraw_continueBtn_clicked', {
              step: '1_configure_withdraw',
              settings: actions.map((item, itemIdx) => ({
                to: getValues(`actions.${itemIdx}.to`),
                token_address: getValues(`actions.${itemIdx}.tokenAddress`),
                amount: getValues(`actions.${itemIdx}.amount`),
              })),
            });
            next();
          }}
        >
          <ConfigureActions
            label=""
            initialActions={['withdraw_assets']}
            whitelistedActions={['withdraw_assets']}
            addExtraActionLabel={t(
              'newWithdraw.configureWithdraw.ctaAddAnother'
            )}
            onAddExtraActionClick={() => {
              addAction({name: 'withdraw_assets'});
              trackEvent('newWithdraw_addAnother_clicked', {
                dao_address: daoDetails.address,
              });
            }}
            hideAlert
            allowEmpty={false}
          />
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
            trackEvent('newWithdraw_continueBtn_clicked', {
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
          <SetupVotingForm pluginSettings={pluginSettings} />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.defineProposal.heading')}
          wizardDescription={t('newWithdraw.defineProposal.description')}
          isNextButtonDisabled={!defineProposalIsValid(dirtyFields, errors)}
          onNextButtonClicked={next => {
            trackEvent('newWithdraw_continueBtn_clicked', {
              step: '3_define_proposal',
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
          wizardTitle={t('newWithdraw.reviewProposal.heading')}
          wizardDescription={t('newWithdraw.reviewProposal.description')}
          nextButtonLabel={t('labels.submitProposal')}
          onNextButtonClicked={handlePublishProposalClick}
          fullWidth
        >
          <ReviewProposal defineProposalStepNumber={3} />
          <CreateProposalDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
          />
        </Step>
      </FullScreenStepper>
    </>
  );
};

export default WithdrawStepper;
