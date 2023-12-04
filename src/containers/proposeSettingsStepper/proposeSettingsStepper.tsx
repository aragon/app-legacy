import {generatePath} from 'react-router-dom';
import {Settings} from '../../utils/paths';
import {toDisplayEns} from '../../utils/library';
import {FullScreenStepper, Step} from '../../components/fullScreenStepper';
import CompareSettings from '../compareSettings';
import {
  DefineProposal,
  isValid as defineProposalIsValid,
} from '../defineProposal';
import SetupVotingForm from '../setupVotingForm';
import ReviewProposal from '../reviewProposal';
import React, {useCallback} from 'react';
import {useFormContext, useFormState} from 'react-hook-form';
import {useDaoDetailsQuery} from '../../hooks/useDaoDetails';
import {
  isGaslessVotingSettings,
  isTokenVotingSettings,
  useVotingSettings,
} from '../../services/aragon-sdk/queries/use-voting-settings';
import {PluginTypes} from '../../hooks/usePluginClient';
import {useDaoToken} from '../../hooks/useDaoToken';
import {useTokenSupply} from '../../hooks/useTokenSupply';
import {
  Action,
  ActionUpdateGaslessSettings,
  ActionUpdateMetadata,
  ActionUpdateMultisigPluginSettings,
  ActionUpdatePluginSettings,
} from '../../utils/types';
import {MultisigWalletField} from '../../components/multisigWallets/row';
import {getSecondsFromDHM} from '../../utils/date';
import {parseUnits} from 'ethers/lib/utils';
import {VotingMode} from '@aragon/sdk-client';
import {useTranslation} from 'react-i18next';
import {useNetwork} from '../../context/network';
import {Loading} from '../../components/temporary';

type ProposalStepperType = {
  enableTxModal: () => void;
};

export const ProposeSettingsStepper: React.FC<ProposalStepperType> = ({
  enableTxModal,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {getValues, setValue, control} = useFormContext();
  const {errors, dirtyFields} = useFormState({
    control,
  });

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const {data: pluginSettings, isLoading: settingsLoading} = useVotingSettings({
    pluginAddress: daoDetails?.plugins[0].instanceAddress as string,
    pluginType: daoDetails?.plugins[0].id as PluginTypes,
  });

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const {data: daoToken} = useDaoToken(pluginAddress);
  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address || ''
  );

  // filter actions making sure unchanged information is not bundled
  // into the list of actions
  const filterActions = useCallback(
    (actions: Action[]) => {
      const [settingsChanged, metadataChanged] = getValues([
        'areSettingsChanged',
        'isMetadataChanged',
      ]);

      // ignore every action that is not modifying the metadata and voting settings
      const filteredActions = (actions as Array<Action>).filter(action => {
        if (action.name === 'modify_metadata' && metadataChanged) {
          return action;
        } else if (
          (action.name === 'modify_token_voting_settings' ||
            action.name === 'modify_multisig_voting_settings' ||
            action.name === 'modify_gasless_voting_settings') &&
          settingsChanged
        ) {
          return action;
        }
      });
      return filteredActions;
    },
    [getValues]
  );

  // Not a fan, but this sets the actions on the form context so that the Action
  // Widget can read them
  const setFormActions = useCallback(async () => {
    const [
      daoName,
      daoSummary,
      daoLogo,
      minimumApproval,
      multisigMinimumApprovals,
      minimumParticipation,
      eligibilityType,
      eligibilityTokenAmount,
      earlyExecution,
      voteReplacement,
      durationDays,
      durationHours,
      durationMinutes,
      resourceLinks,
      tokenDecimals,

      executionExpirationMinutes,
      executionExpirationHours,
      executionExpirationDays,
      committee,
      committeeMinimumApproval,
    ] = getValues([
      'daoName',
      'daoSummary',
      'daoLogo',
      'minimumApproval',
      'multisigMinimumApprovals',
      'minimumParticipation',
      'eligibilityType',
      'eligibilityTokenAmount',
      'earlyExecution',
      'voteReplacement',
      'durationDays',
      'durationHours',
      'durationMinutes',
      'daoLinks',
      'tokenDecimals',

      'executionExpirationMinutes',
      'executionExpirationHours',
      'executionExpirationDays',
      'committee',
      'committeeMinimumApproval',
    ]);

    let daoLogoFile = '';

    if (daoDetails && !daoName) return;

    if (daoLogo?.startsWith?.('blob'))
      daoLogoFile = (await fetch(daoLogo).then(r => r.blob())) as string;
    else daoLogoFile = daoLogo;

    const metadataAction: ActionUpdateMetadata = {
      name: 'modify_metadata',
      inputs: {
        name: daoName,
        description: daoSummary,
        avatar: daoLogoFile,
        links: resourceLinks,
      },
    };

    let settingsAction: Action;

    if (isGaslessVotingSettings(pluginSettings)) {
      const gaslessSettingsAction: ActionUpdateGaslessSettings = {
        name: 'modify_gasless_voting_settings',
        inputs: {
          executionMultisigMembers: (committee as MultisigWalletField[]).map(
            wallet => wallet.address
          ),
          minTallyApprovals: committeeMinimumApproval,
          minDuration: getSecondsFromDHM(
            executionExpirationDays,
            executionExpirationHours,
            executionExpirationMinutes
          ),
          minTallyDuration: getSecondsFromDHM(
            durationDays,
            durationHours,
            durationMinutes
          ),
          minParticipation: Number(minimumParticipation) / 100,
          supportThreshold: Number(minimumApproval) / 100,

          minProposerVotingPower:
            eligibilityType === 'token'
              ? parseUnits(
                  eligibilityTokenAmount.toString(),
                  tokenDecimals
                ).toBigInt()
              : BigInt(0),
          censusStrategy: '',
          daoTokenAddress: daoToken?.address,
          // onlyExecutionMultisigProposalCreation?: boolean;
          id: pluginAddress,
          // dao: {
          //   id: dao,
          //   proposalsCount: number;
          // };
        },
      };
      // setValue('actions', [metadataAction, gaslessSettingsAction]);
      // console.log('-> Gasless Actions added', getValues('actions'));
      settingsAction = gaslessSettingsAction;
    } else if (isTokenVotingSettings(pluginSettings)) {
      const voteSettingsAction: ActionUpdatePluginSettings = {
        name: 'modify_token_voting_settings',
        inputs: {
          token: daoToken,
          totalVotingWeight: tokenSupply?.raw || BigInt(0),

          minDuration: getSecondsFromDHM(
            durationDays,
            durationHours,
            durationMinutes
          ),
          supportThreshold: Number(minimumApproval) / 100,
          minParticipation: Number(minimumParticipation) / 100,
          minProposerVotingPower:
            eligibilityType === 'token'
              ? parseUnits(
                  eligibilityTokenAmount.toString(),
                  tokenDecimals
                ).toBigInt()
              : undefined,
          votingMode: earlyExecution
            ? VotingMode.EARLY_EXECUTION
            : voteReplacement
            ? VotingMode.VOTE_REPLACEMENT
            : VotingMode.STANDARD,
        },
      };
      // setValue('actions', [metadataAction, voteSettingsAction]);
      settingsAction = voteSettingsAction;
    } else {
      const multisigSettingsAction: ActionUpdateMultisigPluginSettings = {
        name: 'modify_multisig_voting_settings',
        inputs: {
          minApprovals: multisigMinimumApprovals,
          onlyListed: eligibilityType === 'multisig',
        },
      };
      // setValue('actions', [metadataAction, multisigSettingsAction]);
      settingsAction = multisigSettingsAction;
    }
    setValue('actions', filterActions([metadataAction, settingsAction]));
  }, [
    getValues,
    daoDetails,
    pluginSettings,
    daoToken,
    pluginAddress,
    setValue,
    tokenSupply?.raw,
    filterActions,
  ]);

  if (daoDetailsLoading || settingsLoading || tokenSupplyIsLoading) {
    return <Loading />;
  }

  if (!pluginSettings || !daoDetails) {
    return null;
  }

  return (
    <FullScreenStepper
      wizardProcessName={t('newProposal.title')}
      navLabel={t('navLinks.settings')}
      returnPath={generatePath(Settings, {
        network,
        dao: toDisplayEns(daoDetails.ensDomain) || daoDetails.address,
      })}
    >
      <Step
        wizardTitle={t('settings.proposeSettings')}
        wizardDescription={t('settings.proposeSettingsSubtitle')}
        onNextButtonClicked={next => {
          setFormActions();
          next();
        }}
      >
        <CompareSettings />
      </Step>
      <Step
        wizardTitle={t('newWithdraw.defineProposal.heading')}
        wizardDescription={t('newWithdraw.defineProposal.description')}
        isNextButtonDisabled={!defineProposalIsValid(dirtyFields, errors)}
      >
        <DefineProposal />
      </Step>
      <Step
        wizardTitle={t('newWithdraw.setupVoting.title')}
        wizardDescription={t('newWithdraw.setupVoting.description')}
      >
        <SetupVotingForm pluginSettings={pluginSettings} />
      </Step>
      <Step
        wizardTitle={t('newWithdraw.reviewProposal.heading')}
        wizardDescription={t('newWithdraw.reviewProposal.description')}
        nextButtonLabel={t('labels.submitProposal')}
        onNextButtonClicked={enableTxModal}
        fullWidth
      >
        <ReviewProposal defineProposalStepNumber={2} />
      </Step>
    </FullScreenStepper>
  );
};
