import React, {useState} from 'react';
import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import {useForm, FormProvider, useWatch, useFormState} from 'react-hook-form';

import TokenMenu from 'containers/tokenMenu';
import {Finance} from 'utils/paths';
import {formatUnits} from 'utils/library';
import ReviewProposal from 'containers/reviewProposal';
import {BaseTokenInfo} from 'utils/types';
import {useDaoBalances} from 'hooks/useDaoBalances';
import {fetchTokenPrice} from 'services/prices';
import {FullScreenStepper, Step} from 'components/fullScreenStepper';

import ConfigureWithdrawForm, {
  isValid as configureWithdrawScreenIsValid,
} from 'containers/configureWithdraw';

import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';

import SetupVotingForm, {
  isValid as setupVotingIsValid,
} from 'containers/setupVotingForm';
import {generatePath} from 'react-router-dom';
import {useNetwork} from 'context/network';
import {useDaoParam} from 'hooks/useDaoParam';
import {Loading} from 'components/temporary';
import {CreateProposalProvider} from 'context/createProposal';
import {ActionsProvider} from 'context/actions';

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
};

export const defaultValues = {
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
  const {data: dao, loading} = useDaoParam();
  const {network} = useNetwork();
  const [showTxModal, setShowTxModal] = useState(false);

  const formMethods = useForm<WithdrawFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const {errors, dirtyFields} = useFormState({control: formMethods.control});

  const [durationSwitch, tokenAddress] = useWatch({
    name: ['durationSwitch', 'actions.0.tokenAddress'],
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

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <ActionsProvider>
          <CreateProposalProvider
            showTxModal={showTxModal}
            setShowTxModal={setShowTxModal}
          >
            <FullScreenStepper
              wizardProcessName={t('newWithdraw.withdrawAssets')}
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
              >
                <ConfigureWithdrawForm />
              </Step>
              <Step
                wizardTitle={t('newWithdraw.setupVoting.title')}
                wizardDescription={t('newWithdraw.setupVoting.description')}
                isNextButtonDisabled={
                  !setupVotingIsValid(errors, durationSwitch)
                }
              >
                <SetupVotingForm />
              </Step>
              <Step
                wizardTitle={t('newWithdraw.defineProposal.heading')}
                wizardDescription={t('newWithdraw.defineProposal.description')}
                isNextButtonDisabled={
                  !defineProposalIsValid(dirtyFields, errors)
                }
              >
                <DefineProposal />
              </Step>
              <Step
                wizardTitle={t('newWithdraw.reviewProposal.heading')}
                wizardDescription={t('newWithdraw.reviewProposal.description')}
                nextButtonLabel={t('labels.submitWithdraw')}
                onNextButtonClicked={() => setShowTxModal(true)}
                fullWidth
              >
                <ReviewProposal defineProposalStepNumber={3} />
              </Step>
            </FullScreenStepper>
            <TokenMenu
              isWallet={false}
              onTokenSelect={handleTokenSelect}
              tokenBalances={balances}
            />
          </CreateProposalProvider>
        </ActionsProvider>
      </FormProvider>
    </>
  );
};

export default withTransaction('NewWithdraw', 'component')(NewWithdraw);
