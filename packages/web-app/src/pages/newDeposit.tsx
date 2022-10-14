import {Address} from '@aragon/ui-components/src/utils/addresses';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';

import {Finance} from 'utils/paths';
import TokenMenu from 'containers/tokenMenu';
import {useWallet} from 'hooks/useWallet';
import DepositForm from 'containers/depositForm';
import {formatUnits} from 'utils/library';
import ReviewDeposit, {CustomFooter} from 'containers/reviewDeposit';
import {BaseTokenInfo} from 'utils/types';
import {TokenFormData} from './newWithdraw';
import {useWalletTokens} from 'hooks/useWalletTokens';
import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {generatePath} from 'react-router-dom';
import {useNetwork} from 'context/network';
import {useDaoParam} from 'hooks/useDaoParam';
import {Loading} from 'components/temporary';
import {DepositProvider} from 'context/deposit';
import {trackEvent} from 'services/analytics';

export type DepositFormData = TokenFormData & {
  // Deposit data
  to: Address;
  from: Address;
  amount: string;
  reference: string;

  // Form metadata
  isCustomToken: boolean;
};

const defaultValues = {
  amount: '',
  reference: '',
  tokenName: '',
  tokenImgUrl: '',
  tokenAddress: '',
  tokenSymbol: '',
  isCustomToken: false,
};

const NewDeposit: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: dao, isLoading} = useDaoParam();

  const {address} = useWallet();
  const {data: walletTokens} = useWalletTokens();

  const formMethods = useForm<DepositFormData>({
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    // add form metadata
    if (address && dao) {
      formMethods.setValue('from', address);
      formMethods.setValue('to', dao);
    }
  }, [address, dao, formMethods]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const handleTokenSelect = (token: BaseTokenInfo) => {
    formMethods.setValue('tokenSymbol', token.symbol);

    // custom token selected, should reset all fields save amount.
    if (token.address === '') {
      formMethods.setValue('isCustomToken', true);
      formMethods.resetField('tokenName');
      formMethods.resetField('tokenImgUrl');
      formMethods.resetField('tokenAddress');
      formMethods.resetField('tokenBalance');
      formMethods.clearErrors('amount');
      return;
    }

    // fill form with curated token values
    formMethods.clearErrors(['tokenAddress', 'tokenSymbol']);
    formMethods.setValue('isCustomToken', false);
    formMethods.setValue('tokenName', token.name);
    formMethods.setValue('tokenImgUrl', token.imgUrl);
    formMethods.setValue('tokenAddress', token.address);
    formMethods.setValue(
      'tokenBalance',
      formatUnits(token.count, token.decimals)
    );

    if (formMethods.formState.dirtyFields.amount) {
      formMethods.trigger('amount');
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading) {
    return <Loading />;
  }

  return (
    <FormProvider {...formMethods}>
      <DepositProvider>
        <FullScreenStepper
          navLabel={t('allTransfer.newTransfer')}
          returnPath={generatePath(Finance, {network, dao})}
          wizardProcessName={t('newDeposit.depositAssets')}
        >
          <Step
            wizardTitle={t('newDeposit.depositAssets')}
            wizardDescription={t('newDeposit.configureDepositSubtitle')}
            isNextButtonDisabled={!formMethods.formState.isValid}
            onNextButtonClicked={next => {
              trackEvent('newDeposit_continueBtn_clicked', {
                dao_address: dao,
                token_address: formMethods.getValues('tokenAddress'),
                amount: formMethods.getValues('amount'),
                reference: formMethods.getValues('reference'),
              });
              next();
            }}
          >
            <DepositForm />
          </Step>
          <Step
            wizardTitle={t('newDeposit.reviewDeposit')}
            wizardDescription={t('newDeposit.reviewTransferSubtitle')}
            nextButtonLabel={t('labels.submitDeposit')}
            customFooter={<CustomFooter />}
          >
            <ReviewDeposit />
          </Step>
        </FullScreenStepper>
        <TokenMenu
          onTokenSelect={handleTokenSelect}
          tokenBalances={walletTokens}
        />
      </DepositProvider>
    </FormProvider>
  );
};

export default withTransaction('NewDeposit', 'component')(NewDeposit);
