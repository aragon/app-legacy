import React from 'react';
import {useFormContext, useFormState, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm, {
  isValid as setupVotingIsValid,
} from 'containers/setupVotingForm';
import TokenMenu from 'containers/tokenMenu';
import {useNetwork} from 'context/network';
import {useDaoBalances} from 'hooks/useDaoBalances';
import {useWallet} from 'hooks/useWallet';
import {generatePath} from 'react-router-dom';
import {trackEvent} from 'services/analytics';
import {fetchTokenPrice} from 'services/prices';
import {getCanonicalUtcOffset} from 'utils/date';
import {formatUnits, toDisplayEns} from 'utils/library';
import {Finance} from 'utils/paths';
import {Action, BaseTokenInfo, SupportedVotingSettings} from 'utils/types';
import ConfigureActions from 'containers/configureActions';
import {actionsAreValid} from 'utils/validators';
import {useActionsContext} from 'context/actions';
import {DaoDetails} from '@aragon/sdk-client';

interface WithdrawStepperProps {
  enableTxModal: () => void;
  daoDetails: DaoDetails;
  pluginSettings: SupportedVotingSettings;
}

const WithdrawStepper: React.FC<WithdrawStepperProps> = ({
  enableTxModal,
  daoDetails,
  pluginSettings,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {address} = useWallet();
  const {actions} = useActionsContext();

  const {data: balances} = useDaoBalances(
    daoDetails?.address.toLowerCase() as string
  );

  const {setValue, control, resetField, clearErrors, trigger, getValues} =
    useFormContext();

  const {errors, dirtyFields} = useFormState({control: control});

  const [formActions] = useWatch({
    name: ['actions'],
    control,
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const handleTokenSelect = (token: BaseTokenInfo) => {
    formActions.forEach((item: Action, actionIdx: number) => {
      setValue(`actions.${actionIdx}.tokenSymbol`, token.symbol);

      if (token.address === '') {
        setValue(`actions.${actionIdx}.isCustomToken`, true);
        resetField(`actions.${actionIdx}.tokenName`);
        resetField(`actions.${actionIdx}.tokenImgUrl`);
        resetField(`actions.${actionIdx}.tokenAddress`);
        resetField(`actions.${actionIdx}.tokenBalance`);
        clearErrors(`actions.${actionIdx}.amount`);
        return;
      }

      clearErrors([
        `actions.${actionIdx}.tokenAddress`,
        `actions.${actionIdx}.tokenSymbol`,
      ]);
      setValue(`actions.${actionIdx}.isCustomToken`, false);
      setValue(`actions.${actionIdx}.tokenName`, token.name);
      setValue(`actions.${actionIdx}.tokenImgUrl`, token.imgUrl);
      setValue(`actions.${actionIdx}.tokenAddress`, token.address);
      setValue(`actions.${actionIdx}.tokenDecimals`, token.decimals);
      setValue(
        `actions.${actionIdx}.tokenBalance`,
        formatUnits(token.count, token.decimals)
      );

      fetchTokenPrice(token.address, network, token.symbol).then(price => {
        setValue(`actions.${actionIdx}.tokenPrice`, price);
      });

      if (dirtyFields.actions?.[actionIdx].amount) {
        trigger(`actions.${actionIdx}.amount`);
      }
    });
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
          isNextButtonDisabled={!actionsAreValid(formActions, actions, errors)}
          onNextButtonClicked={next => {
            trackEvent('newWithdraw_continueBtn_clicked', {
              step: '1_configure_withdraw',
              settings: {
                to: getValues('actions.0.to'),
                token_address: getValues('actions.0.tokenAddress'),
                amount: getValues('actions.0.amount'),
              },
            });
            next();
          }}
        >
          <ConfigureActions
            label=""
            initialActions={['withdraw_assets']}
            whitelistedActions={['withdraw_assets']}
            addNewActionLabel="Initiate Withdrawal"
            onAddNewActionClick={addAction =>
              addAction({name: 'withdraw_assets'})
            }
            addExtraActionLabel={t(
              'newWithdraw.configureWithdraw.ctaAddAnother'
            )}
            onAddExtraActionClick={addAction =>
              addAction({name: 'withdraw_assets'})
            }
            hideAlert
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
          onNextButtonClicked={() => {
            trackEvent('newWithdraw_publishBtn_clicked', {
              dao_address: daoDetails?.address,
            });
            enableTxModal();
          }}
          fullWidth
        >
          <ReviewProposal defineProposalStepNumber={3} />
        </Step>
      </FullScreenStepper>
      {balances && (
        <TokenMenu
          isWallet={false}
          onTokenSelect={handleTokenSelect}
          tokenBalances={balances}
        />
      )}
    </>
  );
};

export default WithdrawStepper;
