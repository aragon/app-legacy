import React, {useEffect, useMemo, useRef} from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {TokenVotingWalletField} from 'components/addWallets/row';
import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {MultisigWalletField} from 'components/multisigWallets/row';
import ConfigureCommunity from 'containers/configureCommunity';
import {OverviewDAOHeader, OverviewDAOStep} from 'containers/daoOverview';
import DefineMetadata from 'containers/defineMetadata';
import GoLive, {GoLiveFooter, GoLiveHeader} from 'containers/goLive';
import SelectChain from 'containers/selectChainForm';
import SetupCommunity from 'containers/setupCommunity';
import {CreateDaoProvider} from 'context/createDao';
import {useNetwork} from 'context/network';
import {ApiProvider, useProviders} from 'context/providers';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';
import {htmlIn} from 'utils/htmlIn';
import {hasValue} from 'utils/library';
import {Landing} from 'utils/paths';
import {CreateDaoFormData} from 'utils/types';
import {isFieldValid} from 'utils/validators';
import DefineExecutionMultisig from '../containers/defineExecutionMultisig';

const defaultValues = {
  tokenName: '',
  tokenAddress: {address: '', ensName: ''},
  tokenSymbol: '',
  tokenDecimals: 18,
  tokenTotalSupply: 1,
  tokenTotalHolders: undefined,
  tokenType: undefined,
  links: [{name: '', url: ''}],

  // Uncomment when DAO Treasury minting is supported
  // wallets: [{address: constants.AddressZero, amount: '0'}],
  earlyExecution: true,
  voteReplacement: false,
  membership: 'token' as CreateDaoFormData['membership'],
  eligibilityType: 'token' as CreateDaoFormData['eligibilityType'],
  eligibilityTokenAmount: 1,
  minimumTokenAmount: 1,
  isCustomToken: true,
  durationDays: '1',
  durationHours: '0',
  durationMinutes: '0',
  minimumParticipation: '15',
};

export const CreateDAO: React.FC = () => {
  const {t} = useTranslation();
  const {chainId} = useWallet();
  const {api: provider} = useProviders();
  const {setNetwork, isL2Network} = useNetwork();

  const formMethods = useForm<CreateDaoFormData>({
    mode: 'onChange',
    defaultValues,
  });

  const {update: updateMultisigFields} = useFieldArray({
    control: formMethods.control,
    name: 'multisigWallets',
  });

  const {update: updateTokenFields} = useFieldArray({
    name: 'wallets',
    control: formMethods.control,
  });

  const {update: updateCommittee} = useFieldArray({
    name: 'committee',
    control: formMethods.control,
  });

  const {errors, dirtyFields} = useFormState({control: formMethods.control});

  const [
    formChain,
    daoName,
    daoEnsName,
    eligibilityType,
    isCustomToken,
    tokenAddress,
    tokenName,
    tokenSymbol,
    membership,
    multisigWallets,
    tokenWallets,
    tokenTotalSupply,
    tokenType,
    committee,
    votingType,
  ] = useWatch({
    control: formMethods.control,
    name: [
      'blockchain.id',
      'daoName',
      'daoEnsName',
      'eligibilityType',
      'isCustomToken',
      'tokenAddress',
      'tokenName',
      'tokenSymbol',
      'membership',
      'multisigWallets',
      'wallets',
      'tokenTotalSupply',
      'tokenType',
      'committee',
      'votingType',
    ],
  });
  const prevFormChain = useRef<number>(formChain);

  /*************************************************
   *                     Effects                   *
   *************************************************/
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
      network: CHAIN_METADATA[defaultNetwork].isTestnet ? 'test' : 'main',
    });

    // intentionally disabling this next line so that changing the
    // wallet network doesn't cause effect to run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const refetchWalletsENS = async () => {
      if (multisigWallets) {
        updateWalletsENS(multisigWallets, provider, updateMultisigFields);
      }

      if (tokenWallets) {
        updateWalletsENS(tokenWallets, provider, updateTokenFields);
      }

      if (committee) {
        updateWalletsENS(tokenWallets, provider, updateCommittee);
      }
    };

    if (prevFormChain.current !== formChain) {
      prevFormChain.current = formChain;
      refetchWalletsENS();
    }

    // intentionally setting only formChain as the dependency
    // since this update needs to happen only on form network change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formChain]);

  /*************************************************
   *                    Callbacks                  *
   *************************************************/
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

  /**
   * Validates multisig community values.
   * - Ensures multisig includes at least one wallet.
   * - Checks all multisig wallets are valid.
   * - Verifies proposal creation eligibility type is set appropriately.
   *
   * @returns True if multisig values are valid, false otherwise.
   */
  const validateMultisigCommunity = () =>
    multisigWallets?.length > 0 &&
    isFieldValid(errors.multisigWallets) &&
    ['anyone', 'multisig'].includes(eligibilityType);

  /**
   * Validates custom token values for DAO community.
   * - Ensures tokens are minted to at least one wallet.
   * - Validates all token wallets.
   * - Checks if custom token values are filled and without errors.
   * - Ensures proposal creation eligibility type is set correctly.
   * - Validates token supply is greater than zero.
   *
   * @returns True if custom token values are valid, false otherwise.
   */
  const validateCustomTokenCommunity = () =>
    tokenWallets?.length > 0 &&
    isFieldValid(errors.wallets) &&
    hasValue(tokenName) &&
    isFieldValid(errors.tokenName) &&
    hasValue(tokenSymbol) &&
    isFieldValid(errors.tokenSymbol) &&
    ['anyone', 'token'].includes(eligibilityType) &&
    isFieldValid(errors.eligibilityTokenAmount) &&
    tokenTotalSupply > 0;

  /**
   * Validates existing token values for DAO community.
   * - Ensures token address and name are valid.
   * - Validates the type of the existing token.
   * - Ensures token supply is greater than zero.
   *
   * @returns True if existing token values are valid, false otherwise.
   */
  const validateExistingTokenCommunity = () =>
    hasValue(tokenAddress?.address) &&
    isFieldValid(errors.tokenAddress?.address) &&
    hasValue(tokenName) &&
    isFieldValid(errors.tokenName) &&
    hasValue(tokenType) &&
    isFieldValid(errors.tokenType) &&
    tokenType !== 'Unknown' &&
    tokenTotalSupply > 0;

  /*************************************************
   *             Step Validation States            *
   *************************************************/
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const daoMetadataIsValid = useMemo(() => {
    // required fields not dirty
    if (!isL2Network && !daoEnsName) return false;
    if (!daoName || !dirtyFields.daoSummary) return false;

    return errors.daoEnsName ||
      errors.daoName ||
      errors.links ||
      errors.daoSummary
      ? false
      : true;
  }, [
    daoEnsName,
    daoName,
    dirtyFields.daoSummary,
    errors.daoEnsName,
    errors.daoName,
    errors.daoSummary,
    errors.links,
    isL2Network,
  ]);

  let daoCommunitySetupIsValid = false;

  switch (membership) {
    case 'multisig':
      daoCommunitySetupIsValid = validateMultisigCommunity();
      break;
    case 'token':
      daoCommunitySetupIsValid = isCustomToken
        ? validateCustomTokenCommunity()
        : validateExistingTokenCommunity();
      break;
  }
  const defineCommitteeIsValid = useMemo(() => {
    if (
      !committee ||
      !committee.length ||
      errors.committee ||
      errors.committeeMinimumApproval ||
      errors.executionExpirationMinutes ||
      errors.executionExpirationHours ||
      errors.executionExpirationDays
    )
      return false;
    return true;
  }, [
    committee,
    errors.committee,
    errors.committeeMinimumApproval,
    errors.executionExpirationMinutes,
    errors.executionExpirationHours,
    errors.executionExpirationDays,
  ]);

  const daoCommunityConfigurationIsValid = useMemo(() => {
    if (
      errors.minimumApproval ||
      errors.minimumParticipation ||
      errors.support ||
      errors.durationDays ||
      errors.durationHours ||
      errors.durationMinutes ||
      errors.multisigMinimumApprovals
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
    errors.multisigMinimumApprovals,
  ]);

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
          processType="DaoCreation"
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
            wizardDescription={htmlIn(t)('createDAO.step1.description')}
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
            wizardDescription={htmlIn(t)('createDAO.step2.description')}
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
            wizardDescription={htmlIn(t)('createDAO.step3.description')}
            isNextButtonDisabled={!daoCommunitySetupIsValid}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '3_setup_community', {
                governance_type: formMethods.getValues('membership'),
                voting_type: formMethods.getValues('votingType'),
                token_name: formMethods.getValues('tokenName'),
                symbol: formMethods.getValues('tokenSymbol'),
                token_address: formMethods.getValues('tokenAddress.address'),
                multisigWallets: formMethods.getValues('multisigWallets'),
              })
            }
          >
            <SetupCommunity />
          </Step>
          <Step
            wizardTitle={t('createDAO.step4.title')}
            wizardDescription={htmlIn(t)('createDAO.step4.description')}
            isNextButtonDisabled={!daoCommunityConfigurationIsValid}
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
            skipStep={votingType !== 'gasless'}
            wizardTitle={t('createDAO.step5.title')}
            wizardDescription={htmlIn(t)('createDAO.step5.description')}
            isNextButtonDisabled={!defineCommitteeIsValid}
            onNextButtonClicked={next => {
              handleNextButtonTracking(next, '5_define_execution_multisig', {
                committee: formMethods.getValues('committee'),
                committeeMinimumApproval: formMethods.getValues(
                  'committeeMinimumApproval'
                ),
                executionExpirationMinutes: formMethods.getValues(
                  'executionExpirationMinutes'
                ),
                executionExpirationHours: formMethods.getValues(
                  'executionExpirationHours'
                ),
                executionExpirationDays: formMethods.getValues(
                  'executionExpirationDays'
                ),
              });
            }}
          >
            <DefineExecutionMultisig />
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

type UpdateFunction = (
  index: number,
  value: Partial<MultisigWalletField> | Partial<TokenVotingWalletField>
) => void;

/**
 * Utility function to fetch ENS names for given wallets and
 * update them using the provided update function.
 *
 * @param wallets - List of wallets to fetch ENS names for
 * @param provider - Web3 provider
 * @param updateFunction - Function to update each wallet with its ENS name
 */
const updateWalletsENS = async (
  wallets: Array<MultisigWalletField | TokenVotingWalletField>,
  provider: ApiProvider,
  updateFunction: UpdateFunction
) => {
  const ensNames = await Promise.all(
    wallets.map(w => provider.lookupAddress(w.address))
  );

  wallets.forEach((wallet, index) => {
    updateFunction(index, {
      ...wallet,
      ensName: ensNames[index] ?? '',
    });
  });
};
