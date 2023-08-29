import {
  AlertInline,
  ButtonText,
  IconGovernance,
  ListItemAction,
} from '@aragon/ods';
import {
  DaoDetails,
  MajorityVotingSettings,
  VotingMode,
} from '@aragon/sdk-client';
import {BigNumber} from 'ethers/lib/ethers';
import React, {useCallback, useEffect, useMemo} from 'react';
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
import {useVotingSettings} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {Layout} from 'pages/settings';
import {getDHMFromSeconds} from 'utils/date';
import {decodeVotingMode, formatUnits, toDisplayEns} from 'utils/library';
import {ProposeNewSettings} from 'utils/paths';

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
  const {errors, isValid, isDirty} = useFormState({control});

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const {data: daoToken, isLoading: tokensAreLoading} =
    useDaoToken(pluginAddress);

  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address || ''
  );

  const {data, isLoading: settingsAreLoading} = useVotingSettings({
    pluginAddress,
    pluginType: 'token-voting.plugin.dao.eth',
  });

  const isLoading =
    settingsAreLoading || tokensAreLoading || tokenSupplyIsLoading;

  const votingSettings = data as MajorityVotingSettings;
  const dataFetched = !!(
    !isLoading &&
    daoToken &&
    tokenSupply &&
    votingSettings
  );

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
    ],
    control,
  });

  const {days, hours, minutes} = getDHMFromSeconds(votingSettings.minDuration);

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
    votingSettings.votingMode ?? VotingMode.STANDARD
  );

  // TODO: We need to force forms to only use one type, Number or string
  const isGovernanceChanged =
    Number(minimumParticipation) !==
      Math.round(votingSettings.minParticipation * 100) ||
    Number(minimumApproval) !==
      Math.round(votingSettings.supportThreshold * 100) ||
    Number(durationDays) !== days ||
    Number(durationHours) !== hours ||
    Number(durationMinutes) !== minutes ||
    earlyExecution !== daoVotingMode.earlyExecution ||
    voteReplacement !== daoVotingMode.voteReplacement;

  // calculate proposer
  let daoEligibleProposer: TokenVotingProposalEligibility =
    formEligibleProposer;
  if (data) {
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
  if (daoToken?.decimals && votingSettings.minProposerVotingPower) {
    daoProposerTokenAmount = Math.ceil(
      Number(
        formatUnits(votingSettings.minProposerVotingPower, daoToken.decimals)
      )
    ).toString();
  }

  const isCommunityChanged =
    daoEligibleProposer !== formEligibleProposer ||
    !BigNumber.from(daoProposerTokenAmount).eq(formProposerTokenAmount ?? 0);

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
      votingSettings?.votingMode || VotingMode.STANDARD
    );

    setValue('earlyExecution', votingMode.earlyExecution);
    setValue('voteReplacement', votingMode.voteReplacement);

    setValue('durationDays', days?.toString());
    setValue('durationHours', hours?.toString());
    setValue('durationMinutes', minutes?.toString());

    // TODO: Alerts share will be added later
    setValue(
      'membership',
      daoDetails?.plugins[0].id === 'token-voting.plugin.dao.eth'
        ? 'token'
        : 'wallet'
    );
  }, [
    setValue,
    tokenSupply?.formatted,
    votingSettings.supportThreshold,
    votingSettings.minParticipation,
    votingSettings?.votingMode,
    daoToken?.decimals,
    days,
    hours,
    minutes,
    daoDetails?.plugins,
  ]);

  const settingsUnchanged =
    !isGovernanceChanged && !isMetadataChanged && !isCommunityChanged;

  const handleResetChanges = () => {
    setCurrentMetadata();
    setCurrentCommunity();
    setCurrentGovernance();
  };

  useEffect(() => {
    setValue('isMetadataChanged', isMetadataChanged);
    setValue('areSettingsChanged', isCommunityChanged || isGovernanceChanged);
  }, [isCommunityChanged, isGovernanceChanged, isMetadataChanged, setValue]);

  useEffect(() => {
    if (dataFetched && !isDirty) {
      setCurrentMetadata();
      setCurrentCommunity();
      setCurrentGovernance();
    }
  }, [
    dataFetched,
    isDirty,
    setCurrentCommunity,
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

  if (isLoading) {
    <Loading />;
  }

  // Note: using isDirty here to allow time for form to fill up before
  // rendering a value or else there will be noticeable render with blank form.
  return isDirty ? (
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
            <AccordionMultiple defaultValue="metadata" className="space-y-3">
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
                methodName={t('navLinks.community')}
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
            </AccordionMultiple>
          </Container>
          {/* Footer */}
          <Footer>
            <HStack>
              <ButtonText
                className="w-full tablet:w-max"
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
                className="w-full tablet:w-max"
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
  ) : (
    <Loading />
  );
};

const Container = styled.div.attrs({
  className: 'mt-5 desktop:mt-8',
})``;

const AccordionContent = styled.div.attrs({
  className:
    'p-3 pb-6 space-y-3 bg-ui-0 border border-ui-100 rounded-b-xl border-t-0',
})``;

const HStack = styled.div.attrs({
  className: 'tablet:flex space-y-2 tablet:space-y-0 tablet:space-x-3',
})``;

const Footer = styled.div.attrs({
  className: 'mt-5 desktop:mt-8 space-y-2',
})``;

const EligibilityWrapper = styled.div.attrs({})``;
