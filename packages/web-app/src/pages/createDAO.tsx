import React, {useEffect, useMemo} from 'react';
import {withTransaction} from '@elastic/apm-rum-react';
import {useTranslation} from 'react-i18next';
import {FormProvider, useForm, useFormState, useWatch} from 'react-hook-form';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {OverviewDAOHeader, OverviewDAOStep} from 'containers/daoOverview';
import SelectChain from 'containers/selectChainForm';
import DefineMetadata from 'containers/defineMetadata';
import ConfigureCommunity from 'containers/configureCommunity';
import SetupCommunity from 'containers/setupCommunity';
import GoLive, {GoLiveHeader, GoLiveFooter} from 'containers/goLive';
import {WalletField} from '../components/addWallets/row';
import {Landing} from 'utils/paths';
import {CreateDaoProvider} from 'context/createDao';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';
import {useNetwork} from 'context/network';
import {useWallet} from 'hooks/useWallet';
import {Link} from '@aragon/ui-components';
import {trackEvent} from 'services/analytics';

export type WhitelistWallet = {
  id: string;
  address: string;
};

export type CreateDaoFormData = {
  blockchain: {
    id: number;
    label: string;
    network: string;
  };
  daoLogo: string;
  daoName: string;
  daoSummary: string;
  tokenName: string;
  tokenSymbol: string;
  tokenTotalSupply: number;
  isCustomToken: boolean;
  links: {label: string; link: string}[];
  wallets: WalletField[];
  tokenAddress: string;
  durationMinutes: string;
  durationHours: string;
  durationDays: string;
  minimumApproval: string;
  minimumParticipation: string;
  support: string;
  membership: string;
  whitelistWallets: WhitelistWallet[];
};

const defaultValues = {
  tokenName: '',
  tokenAddress: '',
  tokenSymbol: '',
  tokenTotalSupply: 0,
  links: [{label: '', href: ''}],

  // Uncomment when DAO Treasury minting is supported
  // wallets: [{address: constants.AddressZero, amount: '0'}],
  membership: 'token',
};

const CreateDAO: React.FC = () => {
  const {t} = useTranslation();
  const {chainId} = useWallet();
  const {setNetwork} = useNetwork();
  const formMethods = useForm<CreateDaoFormData>({
    mode: 'onChange',
    defaultValues,
  });
  const {errors, dirtyFields} = useFormState({control: formMethods.control});
  const [whitelistWallets, isCustomToken, tokenTotalSupply, membership] =
    useWatch({
      control: formMethods.control,
      name: [
        'whitelistWallets',
        'isCustomToken',
        'tokenTotalSupply',
        'membership',
      ],
    });

  // Note: The wallet network determines the expected network when entering
  // the flow so that the process is more convenient for already logged in
  // users and so that the process doesn't start with a warning. Afterwards,
  // the select blockchain form dictates the expected network
  useEffect(() => {
    // get the default expected network using the connected wallet, use ethereum
    // mainnet in case user accesses the flow without wallet connection. Ideally,
    // this should not happen
    const defaultNetwork = getSupportedNetworkByChainId(chainId) || 'ethereum';

    // update the network context
    setNetwork(defaultNetwork);

    // set the default value in the form
    formMethods.setValue('blockchain', {
      id: CHAIN_METADATA[defaultNetwork].id,
      label: CHAIN_METADATA[defaultNetwork].name,
      network: CHAIN_METADATA[defaultNetwork].testnet ? 'test' : 'main',
    });

    // intentionally disabling this next line so that changing the
    // wallet network doesn't cause effect to run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*************************************************
   *             Step Validation States            *
   *************************************************/
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const daoMetadataIsValid = useMemo(() => {
    // required fields not dirty
    if (!dirtyFields.daoName || !dirtyFields.daoSummary) return false;

    return errors.daoName || errors.links || errors.daoSummary ? false : true;
  }, [
    dirtyFields.daoName,
    dirtyFields.daoSummary,
    errors.daoName,
    errors.daoSummary,
    errors.links,
  ]);

  const daoSetupCommunityIsValid = useMemo(() => {
    // required fields not dirty
    // if wallet based dao
    if (membership === 'wallet') {
      if (
        !whitelistWallets ||
        errors.whitelistWallets ||
        whitelistWallets?.length === 0
      ) {
        return false;
      }
      return true;
      // if token based dao
    } else {
      if (isCustomToken === true) {
        if (
          !dirtyFields.tokenName ||
          !dirtyFields.wallets ||
          !dirtyFields.tokenSymbol ||
          errors.wallets ||
          tokenTotalSupply === 0
        )
          return false;
        return errors.tokenName || errors.tokenSymbol || errors.wallets
          ? false
          : true;
      } else {
        if (!dirtyFields.tokenAddress || errors.tokenAddress) return false;
        return true;
      }
    }
  }, [
    membership,
    errors.whitelistWallets,
    errors.wallets,
    errors.tokenName,
    errors.tokenSymbol,
    errors.tokenAddress,
    whitelistWallets,
    isCustomToken,
    dirtyFields.tokenName,
    dirtyFields.wallets,
    dirtyFields.tokenSymbol,
    dirtyFields.tokenAddress,
    tokenTotalSupply,
  ]);

  const daoConfigureCommunity = useMemo(() => {
    if (
      errors.minimumApproval ||
      errors.minimumParticipation ||
      errors.support ||
      errors.durationDays ||
      errors.durationHours ||
      errors.durationMinutes
    )
      return false;
    return true;
  }, [
    errors.durationDays,
    errors.durationHours,
    errors.durationMinutes,
    errors.minimumApproval,
    errors.minimumParticipation,
    errors.support,
  ]);

  const handleNextButtonTracking = (
    next: () => void,
    stepName: string,
    properties: Record<string, unknown>
  ) => {
    trackEvent('daoCreation_continueBtn', {
      step: stepName,
      settings: properties,
    });
    next();
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <FormProvider {...formMethods}>
      <CreateDaoProvider>
        <FullScreenStepper
          wizardProcessName={t('createDAO.title')}
          navLabel={t('createDAO.title')}
          returnPath={Landing}
        >
          <Step
            fullWidth
            hideWizard
            customHeader={
              <OverviewDAOHeader
                navLabel={t('createDAO.title')}
                returnPath={Landing}
              />
            }
            customFooter={<></>}
          >
            <OverviewDAOStep />
          </Step>
          <Step
            wizardTitle={t('createDAO.step1.title')}
            wizardDescription={
              <>
                {t('createDAO.step1.description')}
                <Link
                  href=""
                  label={t('createDAO.step1.blockchainOverviewGuide.')}
                />
              </>
            }
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '1_select_blockchain', {
                network: formMethods.getValues('blockchain')?.network,
              })
            }
          >
            <SelectChain />
          </Step>
          <Step
            wizardTitle={t('createDAO.step2.title')}
            wizardDescription={t('createDAO.step2.description')}
            isNextButtonDisabled={!daoMetadataIsValid}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '2_define_metadata', {
                dao_name: formMethods.getValues('daoName'),
                links: formMethods.getValues('links'),
              })
            }
          >
            <DefineMetadata />
          </Step>
          <Step
            wizardTitle={t('createDAO.step3.title')}
            wizardDescription={t('createDAO.step3.description')}
            isNextButtonDisabled={!daoSetupCommunityIsValid}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '3_setup_community', {
                governance_type: formMethods.getValues('membership'),
                token_name: formMethods.getValues('tokenName'),
                symbol: formMethods.getValues('tokenSymbol'),
                token_address: formMethods.getValues('tokenAddress'),
                whitelistWallets: formMethods.getValues('whitelistWallets'),
              })
            }
          >
            <SetupCommunity />
          </Step>
          <Step
            wizardTitle={t('createDAO.step4.title')}
            wizardDescription={
              <>
                {t('createDAO.step4.description')}
                <Link href="" label={t('createDAO.step4.bestPractices')} />
              </>
            }
            isNextButtonDisabled={!daoConfigureCommunity}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '4_configure_governance', {
                minimum_approval: formMethods.getValues('minimumApproval'),
                support: formMethods.getValues('support'),
                duration_days: formMethods.getValues('durationDays'),
                duration_hours: formMethods.getValues('durationHours'),
                duration_minutes: formMethods.getValues('durationMinutes'),
                governance_type: formMethods.getValues('membership'),
              })
            }
          >
            <ConfigureCommunity />
          </Step>
          <Step
            hideWizard
            fullWidth
            customHeader={<GoLiveHeader />}
            customFooter={<GoLiveFooter />}
          >
            <GoLive />
          </Step>
        </FullScreenStepper>
      </CreateDaoProvider>
    </FormProvider>
  );
};

export default withTransaction('CreateDAO', 'component')(CreateDAO);
