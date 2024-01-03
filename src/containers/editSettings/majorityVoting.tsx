import React, {useCallback, useEffect, useMemo} from 'react';
import {DaoDetails, VotingMode, VotingSettings} from '@aragon/sdk-client';
import {BigNumber} from 'ethers/lib/ethers';
import {AlertInline, ButtonText, ListItemAction} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';
import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {AccordionItem, AccordionMultiple} from 'components/accordionMethod';
import {
  SelectEligibility,
  TokenVotingProposalEligibility,
} from 'components/selectEligibility';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import ConfigureCommunity from 'containers/configureCommunity';
import DefineMetadata from 'containers/defineMetadata';
import {useNetwork} from 'context/network';
import {useDaoToken} from 'hooks/useDaoToken';
import {GaselessPluginName, PluginTypes} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import {Layout} from 'pages/settings';
import {getDHMFromSeconds} from 'utils/date';
import {decodeVotingMode, formatUnits, toDisplayEns} from 'utils/library';
import {ProposeNewSettings} from 'utils/paths';
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';
import {ManageExecutionMultisig} from '../manageExecutionMultisig';
import {MultisigDaoMember} from '../../hooks/useDaoMembers';

type EditMvSettingsProps = {
  daoDetails: DaoDetails;
};

export const EditMvSettings: React.FC<EditMvSettingsProps> = ({daoDetails}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork(); // TODO get network from daoDetails
  const {isMobile} = useScreen();

  const {setValue, control} = useFormContext();
  const {fields, replace} = useFieldArray({name: 'daoLinks', control});
  const {errors, isValid, isDirty, dirtyFields} = useFormState({control});

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType: PluginTypes = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const isGasless = pluginType === GaselessPluginName;

  const {data: daoToken, isLoading: tokensAreLoading} =
    useDaoToken(pluginAddress);

  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address ?? ''
  );

  const {data: pluginSettings, isLoading: settingsAreLoading} =
    useVotingSettings({
      pluginAddress,
      pluginType,
    });
  const votingSettings = pluginSettings as
    | GaslessPluginVotingSettings
    | VotingSettings
    | undefined;

  const isLoading =
    settingsAreLoading || tokensAreLoading || tokenSupplyIsLoading;

  const minDuration = votingSettings?.minDuration;

  const dataFetched = !!(!isLoading && daoToken && tokenSupply && minDuration);

  const [
    daoName,
    daoSummary,
    daoLogo,
    minimumApproval,
    minimumParticipation,
    formEligibleProposer,
    formProposerTokenAmount,
    durationDays,
    durationHours,
    durationMinutes,
    resourceLinks,
    earlyExecution,
    voteReplacement,
    executionExpirationMinutes,
    executionExpirationHours,
    executionExpirationDays,
    committeeMinimumApproval,
  ] = useWatch({
    name: [
      'daoName',
      'daoSummary',
      'daoLogo',
      'minimumApproval',
      'minimumParticipation',
      'eligibilityType',
      'eligibilityTokenAmount',
      'durationDays',
      'durationHours',
      'durationMinutes',
      'daoLinks',
      'earlyExecution',
      'voteReplacement',
      'executionExpirationMinutes',
      'executionExpirationHours',
      'executionExpirationDays',
      'committeeMinimumApproval',
    ],
    control,
  });

  const {days, hours, minutes} = getDHMFromSeconds(minDuration ?? 0);

  let approvalDays: number | undefined;
  let approvalHours: number | undefined;
  let approvalMinutes: number | undefined;
  let executionMultisigMembers: MultisigDaoMember[] | undefined;
  if (isGasless && votingSettings) {
    const {days, hours, minutes} = getDHMFromSeconds(
      (votingSettings as GaslessPluginVotingSettings).minTallyDuration ?? 0
    );
    approvalDays = days;
    approvalHours = hours;
    approvalMinutes = minutes;
    executionMultisigMembers = (
      votingSettings as GaslessPluginVotingSettings
    ).executionMultisigMembers?.map(wallet => ({
      address: wallet,
    })) as MultisigDaoMember[];
  }

  const controlledLinks = fields.map((field, index) => {
    return {
      ...field,
      ...(resourceLinks && {...resourceLinks[index]}),
    };
  });

  const resourceLinksAreEqual: boolean = useMemo(() => {
    if (!daoDetails?.metadata.links || !resourceLinks) return true;

    // length validation
    const lengthDifference =
      resourceLinks.length - daoDetails.metadata.links.length;

    // links were added to form
    if (lengthDifference > 0) {
      // loop through extra links
      for (
        let i = daoDetails.metadata.links.length;
        i < resourceLinks.length;
        i++
      ) {
        // check if link is filled without error -> then consider it as a proper change
        if (
          resourceLinks[i].name &&
          resourceLinks[i].url &&
          !errors.daoLinks?.[i]
        )
          return false;
      }
    }

    // links were removed
    if (lengthDifference < 0) return false;

    // content validation (i.e. same number of links)
    for (let i = 0; i < daoDetails.metadata.links.length; i++) {
      if (
        controlledLinks[i].name !== daoDetails.metadata.links[i].name ||
        controlledLinks[i].url !== daoDetails.metadata.links[i].url
      )
        return false;
    }

    return true;
  }, [
    controlledLinks,
    daoDetails?.metadata.links,
    errors.daoLinks,
    resourceLinks,
  ]);

  // metadata setting changes
  const isMetadataChanged = (daoDetails?.metadata.name &&
    (daoName !== daoDetails.metadata.name ||
      daoSummary !== daoDetails.metadata.description ||
      daoLogo !== daoDetails.metadata.avatar ||
      !resourceLinksAreEqual)) as boolean;

  // governance
  const daoVotingMode = decodeVotingMode(
    isGasless
      ? VotingMode.STANDARD
      : (votingSettings as VotingSettings)?.votingMode ?? VotingMode.STANDARD
  );

  // TODO: We need to force forms to only use one type, Number or string
  let isGovernanceChanged = false;
  if (votingSettings) {
    isGovernanceChanged =
      Number(minimumParticipation) !==
        Math.round(votingSettings.minParticipation * 100) ||
      Number(minimumApproval) !==
        Math.round(votingSettings.supportThreshold * 100) ||
      Number(durationDays) !== days ||
      Number(durationHours) !== hours ||
      Number(durationMinutes) !== minutes ||
      earlyExecution !== daoVotingMode.earlyExecution ||
      voteReplacement !== daoVotingMode.voteReplacement;
  }

  const isGaslessChanged = useMemo(() => {
    if (isGasless && votingSettings) {
      return (
        Number(executionExpirationMinutes) !== approvalMinutes ||
        Number(executionExpirationHours) !== approvalHours ||
        Number(executionExpirationDays) !== approvalDays ||
        committeeMinimumApproval !==
          (votingSettings as GaslessPluginVotingSettings).minTallyApprovals
      );
    }
    return false;
  }, [
    approvalDays,
    approvalHours,
    approvalMinutes,
    committeeMinimumApproval,
    executionExpirationDays,
    executionExpirationHours,
    executionExpirationMinutes,
    isGasless,
    votingSettings,
  ]);

  // calculate proposer
  let daoEligibleProposer: TokenVotingProposalEligibility =
    formEligibleProposer;

  if (votingSettings) {
    if (!votingSettings.minProposerVotingPower) {
      daoEligibleProposer = 'anyone';
    } else {
      daoEligibleProposer = BigNumber.from(
        votingSettings.minProposerVotingPower
      ).isZero()
        ? 'anyone'
        : 'token';
    }
  }

  let daoProposerTokenAmount = '0';
  if (daoToken?.decimals && votingSettings?.minProposerVotingPower) {
    daoProposerTokenAmount = Math.ceil(
      Number(
        formatUnits(votingSettings.minProposerVotingPower, daoToken.decimals)
      )
    ).toString();
  }

  // Note: formProposerTokenAmount may be an empty string
  const isCommunityChanged =
    daoEligibleProposer !== formEligibleProposer ||
    !BigNumber.from(daoProposerTokenAmount).eq(
      formProposerTokenAmount !== '' ? formProposerTokenAmount : 0
    );

  const setCurrentMetadata = useCallback(() => {
    setValue('daoName', daoDetails?.metadata.name);
    setValue('daoSummary', daoDetails?.metadata.description);
    setValue('daoLogo', daoDetails?.metadata?.avatar);

    /**
     * FIXME - this is the dumbest workaround: because there is an internal
     * field array in 'AddLinks', conflicts arise when removing rows via remove
     * and update. While the append, remove and replace technically happens whe
     * we reset the form, a row is not added to the AddLinks component leaving
     * the component in a state where one or more rows are hidden until the Add
     * Link button is clicked. The workaround is to forcefully set empty fields
     * for each link coming from daoDetails and then replacing them with the
     * proper values
     */
    if (daoDetails?.metadata.links) {
      setValue('daoLinks', [...daoDetails.metadata.links.map(() => ({}))]);
      replace([...daoDetails.metadata.links]);
    }
  }, [
    daoDetails.metadata?.avatar,
    daoDetails.metadata.description,
    daoDetails.metadata.links,
    daoDetails.metadata.name,
    replace,
    setValue,
  ]);

  const setCurrentCommunity = useCallback(() => {
    setValue('eligibilityType', daoEligibleProposer);
    setValue('eligibilityTokenAmount', daoProposerTokenAmount);
    setValue('minimumTokenAmount', daoProposerTokenAmount);
  }, [daoEligibleProposer, daoProposerTokenAmount, setValue]);

  const setCurrentGovernance = useCallback(() => {
    if (!votingSettings) return;

    setValue('tokenTotalSupply', tokenSupply?.formatted);
    setValue(
      'minimumApproval',
      Math.round(votingSettings.supportThreshold * 100)
    );
    setValue(
      'minimumParticipation',
      Math.round(votingSettings.minParticipation * 100)
    );
    setValue('tokenDecimals', daoToken?.decimals || 18);

    const votingMode = decodeVotingMode(
      isGasless
        ? VotingMode.STANDARD
        : (votingSettings as VotingSettings)?.votingMode ?? VotingMode.STANDARD
    );

    setValue('earlyExecution', votingMode.earlyExecution);
    setValue('voteReplacement', votingMode.voteReplacement);

    setValue('durationDays', days?.toString());
    setValue('durationHours', hours?.toString());
    setValue('durationMinutes', minutes?.toString());

    // TODO: Alerts share will be added later
    setValue(
      'membership',
      daoDetails?.plugins[0].id === 'token-voting.plugin.dao.eth' ||
        daoDetails?.plugins[0].id === GaselessPluginName
        ? 'token'
        : 'wallet'
    );
  }, [
    daoDetails?.plugins,
    daoToken?.decimals,
    days,
    hours,
    isGasless,
    minutes,
    setValue,
    tokenSupply?.formatted,
    votingSettings,
  ]);

  const setCurrentGasless = useCallback(() => {
    if (!isGasless) return;

    setValue('votingType', 'gasless');
    setValue('executionExpirationMinutes', approvalMinutes?.toString());
    setValue('executionExpirationHours', approvalHours?.toString());
    setValue('executionExpirationDays', approvalDays?.toString());
    // Used to show the original execution committee members on the review screen
    setValue('committee', executionMultisigMembers);

    setValue('actions', [
      {
        name: 'add_address',
        inputs: {memberWallets: []},
      },
    ]);

    setValue(
      'committeeMinimumApproval',
      (votingSettings as GaslessPluginVotingSettings).minTallyApprovals
    );
  }, [
    approvalDays,
    approvalHours,
    approvalMinutes,
    executionMultisigMembers,
    isGasless,
    setValue,
    votingSettings,
  ]);

  const settingsUnchanged =
    !isGovernanceChanged &&
    !isMetadataChanged &&
    !isCommunityChanged &&
    !isGaslessChanged;

  const handleResetChanges = () => {
    setCurrentMetadata();
    setCurrentCommunity();
    setCurrentGovernance();
    setCurrentGasless();
  };

  useEffect(() => {
    setValue('isMetadataChanged', isMetadataChanged);
    setValue(
      'areSettingsChanged',
      isCommunityChanged || isGovernanceChanged || isGaslessChanged
    );
  }, [
    isCommunityChanged,
    isGaslessChanged,
    isGovernanceChanged,
    isMetadataChanged,
    setValue,
  ]);

  useEffect(() => {
    if (dataFetched && !isDirty) {
      setCurrentMetadata();
      setCurrentCommunity();
      setCurrentGovernance();
      setCurrentGasless();
    }
  }, [
    dataFetched,
    isDirty,
    setCurrentCommunity,
    setCurrentGasless,
    setCurrentGovernance,
    setCurrentMetadata,
  ]);

  const metadataAction = [
    {
      component: (
        <ListItemAction
          title={t('settings.resetChanges')}
          bgWhite
          mode={isMetadataChanged ? 'default' : 'disabled'}
        />
      ),
      callback: setCurrentMetadata,
    },
  ];

  const communityAction = [
    {
      component: (
        <ListItemAction
          title={t('settings.resetChanges')}
          bgWhite
          mode={isCommunityChanged ? 'default' : 'disabled'}
        />
      ),
      callback: setCurrentCommunity,
    },
  ];
  const governanceAction = [
    {
      component: (
        <ListItemAction
          title={t('settings.resetChanges')}
          bgWhite
          mode={isGovernanceChanged ? 'default' : 'disabled'}
        />
      ),
      callback: setCurrentGovernance,
    },
  ];

  const gaslessAction = [
    {
      component: (
        <ListItemAction
          title={t('settings.resetChanges')}
          bgWhite
          mode={isGaslessChanged ? 'default' : 'disabled'}
        />
      ),
      callback: setCurrentGasless,
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  // Note: using isDirty here to allow time for form to fill up before
  // rendering a value or else there will be noticeable render with blank form.
  if (!isDirty) {
    console.log('NOT DIRTY', dirtyFields);
    return <Loading />;
  }

  console.log('DIRTY', dirtyFields);

  return (
    <PageWrapper
      title={t('settings.editDaoSettings')}
      description={t('settings.editSubtitle')}
      secondaryBtnProps={
        isMobile
          ? {
              disabled: settingsUnchanged,
              label: t('settings.resetChanges'),
              onClick: () => handleResetChanges(),
            }
          : undefined
      }
      customBody={
        <Layout>
          <Container>
            <AccordionMultiple defaultValue="metadata" className="space-y-6">
              <AccordionItem
                type="action-builder"
                name="metadata"
                methodName={t('labels.review.daoMetadata')}
                alertLabel={
                  isMetadataChanged ? t('settings.newSettings') : undefined
                }
                dropdownItems={metadataAction}
              >
                <AccordionContent>
                  <DefineMetadata bgWhite arrayName="daoLinks" isSettingPage />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                type="action-builder"
                name="community"
                methodName={t('navLinks.members')}
                alertLabel={
                  isCommunityChanged ? t('settings.newSettings') : undefined
                }
                dropdownItems={communityAction}
              >
                <AccordionContent>
                  <EligibilityWrapper>
                    <SelectEligibility />
                  </EligibilityWrapper>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                type="action-builder"
                name="governance"
                methodName={t('labels.review.governance')}
                alertLabel={
                  isGovernanceChanged ? t('settings.newSettings') : undefined
                }
                dropdownItems={governanceAction}
              >
                <AccordionContent>
                  <ConfigureCommunity isSettingPage />
                </AccordionContent>
              </AccordionItem>

              {isGasless && (
                <AccordionItem
                  type="action-builder"
                  name="executionMultisigSettings"
                  methodName={t('label.executionMultisig')}
                  alertLabel={
                    isGaslessChanged ? t('settings.newSettings') : undefined
                  }
                  dropdownItems={gaslessAction}
                >
                  <AccordionContent>
                    <ManageExecutionMultisig
                      members={executionMultisigMembers}
                      minTallyApprovals={
                        (votingSettings as GaslessPluginVotingSettings)
                          .minTallyApprovals
                      }
                      daoAddress={daoDetails.address}
                    />
                  </AccordionContent>
                </AccordionItem>
              )}
            </AccordionMultiple>
          </Container>
          {/* Footer */}
          <Footer>
            <HStack>
              <ButtonText
                className="w-full md:w-max"
                label={t('settings.reviewProposal')}
                iconLeft={<IconGovernance />}
                size="large"
                disabled={settingsUnchanged || !isValid}
                onClick={() =>
                  navigate(
                    generatePath(ProposeNewSettings, {
                      network,
                      dao:
                        toDisplayEns(daoDetails.ensDomain) ||
                        daoDetails.address,
                    })
                  )
                }
              />
              <ButtonText
                className="w-full md:w-max"
                label={t('settings.resetChanges')}
                mode="secondary"
                size="large"
                disabled={settingsUnchanged}
                onClick={handleResetChanges}
              />
            </HStack>
            <AlertInline label={t('settings.proposeSettingsInfo')} />
          </Footer>
        </Layout>
      }
    />
  );
};

const Container = styled.div.attrs({})``;

const AccordionContent = styled.div.attrs({
  className:
    'p-6 pb-12 space-y-6 bg-neutral-0 border border-neutral-100 rounded-b-xl border-t-0',
})``;

const HStack = styled.div.attrs({
  className: 'md:flex space-y-4 md:space-y-0 md:space-x-6',
})``;

const Footer = styled.div.attrs({
  className: 'mt-10 xl:mt-16 space-y-4',
})``;

const EligibilityWrapper = styled.div.attrs({})``;
