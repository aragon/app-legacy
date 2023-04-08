import {Address} from '@aragon/ui-components/src/utils/addresses';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect, useRef} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import DepositForm from 'containers/depositForm';
import ReviewDeposit, {CustomFooter} from 'containers/reviewDeposit';
import TokenMenu from 'containers/tokenMenu';
import {DepositProvider} from 'context/deposit';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useWallet} from 'hooks/useWallet';
import {useWalletTokens} from 'hooks/useWalletTokens';
import {generatePath} from 'react-router-dom';
import {trackEvent} from 'services/analytics';
import {MAX_TOKEN_DECIMALS} from 'utils/constants';
import {formatUnits, toDisplayEns} from 'utils/library';
import {Finance} from 'utils/paths';
import {BaseTokenInfo} from 'utils/types';
import {TokenFormData} from './newWithdraw';

export type DepositFormData = TokenFormData & {
  // Deposit data
  to: Address;
  from: Address;
  amount: string;
  reference: string;
  daoName?: string;

  // Form metadata
  tokenDecimals: number;
  isCustomToken: boolean;
};

const defaultValues = {
  amount: '',
  reference: '',
  tokenName: '',
  tokenImgUrl: '',
  tokenDecimals: MAX_TOKEN_DECIMALS,
  tokenAddress: '',
  tokenSymbol: '',
  isCustomToken: false,
};

const NewDeposit: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  const {address, isConnected, status, isOnWrongNetwork} = useWallet();
  const {data: walletTokens} = useWalletTokens();
  const {open, close} = useGlobalModalContext();
  const userWentThroughLoginFlow = useRef(false);

  const formMethods = useForm<DepositFormData>({
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    // add form metadata
    if (address && daoDetails) {
      formMethods.setValue('from', address);
      formMethods.setValue('to', daoDetails.address);
      formMethods.setValue('daoName', daoDetails.metadata.name);
    }
  }, [address, formMethods, daoDetails]);

  useEffect(() => {
    // show the wallet menu only if the user hasn't gone through the flow previously
    // and is currently logged out; this allows user to log out mid flow with
    // no lasting consequences considering status will be checked upon proposal creation
    // If we want to keep user logged in (I'm in favor of), remove ref throughout component
    // Fabrice F. - [12/07/2022]
    if (address) {
      userWentThroughLoginFlow.current = true;
    }

    if (
      !isConnected &&
      status !== 'connecting' &&
      userWentThroughLoginFlow.current === false
    )
      open('wallet');
    else {
      if (isOnWrongNetwork) open('network');
      else close('network');
    }

    // Closes any open modal when the user goes back to /finance page
    return () => {
      close('wallet');
      close('network');
    };
  }, [address, close, isConnected, isOnWrongNetwork, open, status]);

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
      formMethods.resetField('tokenDecimals');
      formMethods.clearErrors('amount');
      return;
    }

    // fill form with curated token values
    formMethods.clearErrors(['tokenAddress', 'tokenSymbol']);
    formMethods.setValue('isCustomToken', false);
    formMethods.setValue('tokenName', token.name);
    formMethods.setValue('tokenImgUrl', token.imgUrl);
    formMethods.setValue('tokenAddress', token.address);
    formMethods.setValue('tokenDecimals', token.decimals);
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
          returnPath={generatePath(Finance, {
            network,
            dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
          })}
          wizardProcessName={t('newDeposit.depositAssets')}
        >
          <Step
            wizardTitle={t('newDeposit.depositAssets')}
            wizardDescription={t('newDeposit.configureDepositSubtitle')}
            isNextButtonDisabled={!formMethods.formState.isValid}
            onNextButtonClicked={next => {
              trackEvent('newDeposit_continueBtn_clicked', {
                dao_address: daoDetails?.address,
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
