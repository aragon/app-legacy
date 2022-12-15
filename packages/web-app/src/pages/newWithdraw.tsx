import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {FormProvider, useForm, useFormState, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import ConfigureWithdrawForm, {
  isValid as configureWithdrawScreenIsValid,
} from 'containers/configureWithdraw';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm, {
  isValid as setupVotingIsValid,
} from 'containers/setupVotingForm';
import TokenMenu from 'containers/tokenMenu';
import {ActionsProvider} from 'context/actions';
import {CreateProposalProvider} from 'context/createProposal';
import {useNetwork} from 'context/network';
import {useDaoBalances} from 'hooks/useDaoBalances';
import {useDaoParam} from 'hooks/useDaoParam';
import {useWallet} from 'hooks/useWallet';
import {generatePath} from 'react-router-dom';
import {trackEvent} from 'services/analytics';
import {fetchTokenPrice} from 'services/prices';
import {getCanonicalUtcOffset} from 'utils/date';
import {formatUnits} from 'utils/library';
import {Finance} from 'utils/paths';
import {BaseTokenInfo} from 'utils/types';

export type TokenFormData = {
  tokenName: string;
  tokenSymbol: string;
  tokenImgUrl: string;
  tokenAddress: Address;
  tokenBalance: string;
  tokenPrice?: number;
  isCustomToken: boolean;
};

export type WithdrawAction = TokenFormData & {
  to: Address;
  from: Address;
  amount: string;
  name: string; // This indicates the type of action; Deposit is NOT an action
};

type WithdrawFormData = {
  actions: WithdrawAction[];

  // Proposal data
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  duration: number;
  startUtc: string;
  endUtc: string;
  durationSwitch: string;
  proposalTitle: string;
  proposalSummary: string;
  proposal: unknown;
  links: unknown;
};

export const defaultValues = {
  links: [{name: '', url: ''}],
  actions: [
    {
      name: 'withdraw_assets',
      to: '',
      from: '',
      amount: '',
      tokenAddress: '',
      tokenSymbol: '',
      tokenName: '',
      tokenImgUrl: '',
    },
  ],
};

const NewWithdraw: React.FC = () => {
  const {t} = useTranslation();
  const {data: dao, isLoading} = useDaoParam();
  const {network} = useNetwork();
  const {address} = useWallet();
  const [showTxModal, setShowTxModal] = useState(false);

  const formMethods = useForm<WithdrawFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const {errors, dirtyFields} = useFormState({control: formMethods.control});

  const [tokenAddress] = useWatch({
    name: ['actions.0.tokenAddress'],
    control: formMethods.control,
  });

  const {data: balances} = useDaoBalances(dao);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const handleTokenSelect = (token: BaseTokenInfo) => {
    formMethods.setValue('actions.0.tokenSymbol', token.symbol);

    if (token.address === '') {
      formMethods.setValue('actions.0.isCustomToken', true);
      formMethods.resetField('actions.0.tokenName');
      formMethods.resetField('actions.0.tokenImgUrl');
      formMethods.resetField('actions.0.tokenAddress');
      formMethods.resetField('actions.0.tokenBalance');
      formMethods.clearErrors('actions.0.amount');
      return;
    }

    formMethods.clearErrors([
      'actions.0.tokenAddress',
      'actions.0.tokenSymbol',
    ]);
    formMethods.setValue('actions.0.isCustomToken', false);
    formMethods.setValue('actions.0.tokenName', token.name);
    formMethods.setValue('actions.0.tokenImgUrl', token.imgUrl);
    formMethods.setValue('actions.0.tokenAddress', token.address);
    formMethods.setValue(
      'actions.0.tokenBalance',
      formatUnits(token.count, token.decimals)
    );

    fetchTokenPrice(token.address, network).then(price => {
      formMethods.setValue('actions.0.tokenPrice', price);
    });

    if (dirtyFields.actions?.[0].amount) {
      formMethods.trigger('actions.0.amount');
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <ActionsProvider daoId={dao}>
          <CreateProposalProvider
            showTxModal={showTxModal}
            setShowTxModal={setShowTxModal}
          >
            <FullScreenStepper
              wizardProcessName={t('TransferModal.item2Title')}
              navLabel={t('allTransfer.newTransfer')}
              returnPath={generatePath(Finance, {network, dao})}
            >
              <Step
                wizardTitle={t('newWithdraw.configureWithdraw.title')}
                wizardDescription={t('newWithdraw.configureWithdraw.subtitle')}
                isNextButtonDisabled={
                  !configureWithdrawScreenIsValid(
                    dirtyFields.actions?.[0],
                    errors.actions?.[0],
                    tokenAddress
                  )
                }
                onNextButtonClicked={next => {
                  trackEvent('newWithdraw_continueBtn_clicked', {
                    step: '1_configure_withdraw',
                    settings: {
                      to: formMethods.getValues('actions.0.to'),
                      token_address: formMethods.getValues(
                        'actions.0.tokenAddress'
                      ),
                      amount: formMethods.getValues('actions.0.amount'),
                    },
                  });
                  next();
                }}
              >
                <ConfigureWithdrawForm actionIndex={0} />
              </Step>
              <Step
                wizardTitle={t('newWithdraw.setupVoting.title')}
                wizardDescription={t('newWithdraw.setupVoting.description')}
                isNextButtonDisabled={!setupVotingIsValid(errors)}
                onNextButtonClicked={next => {
                  const [
                    startDate,
                    startTime,
                    startUtc,
                    endDate,
                    endTime,
                    endUtc,
                  ] = formMethods.getValues([
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
                      end: `${endDate}T${endTime}:00${getCanonicalUtcOffset(
                        endUtc
                      )}`,
                    },
                  });
                  next();
                }}
              >
                <SetupVotingForm />
              </Step>
              <Step
                wizardTitle={t('newWithdraw.defineProposal.heading')}
                wizardDescription={t('newWithdraw.defineProposal.description')}
                isNextButtonDisabled={
                  !defineProposalIsValid(dirtyFields, errors)
                }
                onNextButtonClicked={next => {
                  trackEvent('newWithdraw_continueBtn_clicked', {
                    step: '3_define_proposal',
                    settings: {
                      author_address: address,
                      title: formMethods.getValues('proposalTitle'),
                      summary: formMethods.getValues('proposalSummary'),
                      proposal: formMethods.getValues('proposal'),
                      resources_list: formMethods.getValues('links'),
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
                nextButtonLabel={t('labels.submitWithdraw')}
                onNextButtonClicked={() => {
                  trackEvent('newWithdraw_publishBtn_clicked', {
                    dao_address: dao,
                  });
                  setShowTxModal(true);
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
          </CreateProposalProvider>
        </ActionsProvider>
      </FormProvider>
    </>
  );
};

export default withTransaction('NewWithdraw', 'component')(NewWithdraw);
