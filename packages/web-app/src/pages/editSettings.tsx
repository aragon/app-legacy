import {VotingMode, VotingSettings} from '@aragon/sdk-client';
import {
  AlertInline,
  ButtonText,
  IconGovernance,
  ListItemAction,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
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
import {SelectEligibility} from 'components/selectEligibility';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import ConfigureCommunity from 'containers/configureCommunity';
import DefineMetadata from 'containers/defineMetadata';
import {useNetwork} from 'context/network';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {getDHMFromSeconds} from 'utils/date';
import {decodeVotingMode, formatUnits} from 'utils/library';
import {ProposeNewSettings} from 'utils/paths';
import {Layout} from './settings';

const EditSettings: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isMobile} = useScreen();
  const {data: daoId, isLoading: paramsAreLoading} = useDaoParam();

  const {setValue, control} = useFormContext();
  const {fields, replace} = useFieldArray({
    name: 'daoLinks',
    control,
  });
  const {errors, isValid} = useFormState({control});

  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId!
  );

  const {data: daoToken, isLoading: tokensAreLoading} = useDaoToken(
    daoDetails?.plugins?.[0]?.instanceAddress || ''
  );

  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address || ''
  );

  const {data, isLoading: settingsAreLoading} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  // TODO: fix when integrating multisig
  const daoSettings = data as VotingSettings;
  const formattedProposerAmount = Math.ceil(
    Number(
      formatUnits(
        daoSettings.minProposerVotingPower || 0,
        daoToken?.decimals || 18
      )
    )
  );
  const formattedEligibilityType = formattedProposerAmount ? 'token' : 'anyone';

  const {days, hours, minutes} = getDHMFromSeconds(daoSettings.minDuration);

  const [
    daoName,
    daoEnsName,
    daoSummary,
    daoLogo,
    minimumApproval,
    minimumParticipation,
    eligibilityType,
    eligibilityTokenAmount,
    durationDays,
    durationHours,
    durationMinutes,
    resourceLinks,
    earlyExecution,
    voteReplacement,
  ] = useWatch({
    name: [
      'daoName',
      'daoEnsName',
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
  const isMetadataChanged =
    daoDetails?.metadata.name &&
    (daoName !== daoDetails.metadata.name ||
      daoEnsName !== daoDetails.ensDomain ||
      daoSummary !== daoDetails.metadata.description ||
      daoLogo !== daoDetails.metadata.avatar ||
      !resourceLinksAreEqual);

  // governance
  const daoVotingMode = decodeVotingMode(
    daoSettings?.votingMode || VotingMode.STANDARD
  );

  // TODO: We need to force forms to only use one type, Number or string
  const isGovernanceChanged =
    Number(minimumParticipation) !==
      Math.round(daoSettings.minParticipation * 100) ||
    Number(minimumApproval) !==
      Math.round(daoSettings.supportThreshold * 100) ||
    Number(durationDays) !== days ||
    Number(durationHours) !== hours ||
    Number(durationMinutes) !== minutes ||
    earlyExecution !== daoVotingMode.earlyExecution ||
    voteReplacement !== daoVotingMode.voteReplacement;

  const isCommunityChanged =
    eligibilityTokenAmount !== formattedProposerAmount ||
    eligibilityType !== formattedEligibilityType;

  const setCurrentMetadata = useCallback(() => {
    setValue('daoName', daoDetails?.metadata.name);
    setValue('daoEnsName', daoDetails?.ensDomain);
    setValue('daoSummary', daoDetails?.metadata.description);
    setValue('daoLogo', daoDetails?.metadata.avatar);

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
    setValue,
    daoDetails?.metadata.name,
    daoDetails?.metadata.description,
    daoDetails?.metadata.avatar,
    daoDetails?.metadata.links,
    daoDetails?.ensDomain,
    replace,
  ]);

  const setCurrentCommunity = useCallback(() => {
    setValue('eligibilityTokenAmount', formattedProposerAmount);
    setValue('minimumTokenAmount', formattedProposerAmount);
    setValue('eligibilityType', formattedEligibilityType);
  }, [formattedEligibilityType, formattedProposerAmount, setValue]);

  const setCurrentGovernance = useCallback(() => {
    setValue('tokenTotalSupply', tokenSupply?.formatted);
    setValue('minimumApproval', Math.round(daoSettings.supportThreshold * 100));
    setValue(
      'minimumParticipation',
      Math.round(daoSettings.minParticipation * 100)
    );

    const votingMode = decodeVotingMode(
      daoSettings?.votingMode || VotingMode.STANDARD
    );

    setValue('earlyExecution', votingMode.earlyExecution);
    setValue('voteReplacement', votingMode.voteReplacement);

    setValue('durationDays', days);
    setValue('durationHours', hours);
    setValue('durationMinutes', minutes);

    // TODO: Alerts share will be added later
    setValue(
      'membership',
      daoDetails?.plugins[0].id === 'token-voting.plugin.dao.eth'
        ? 'token'
        : 'wallet'
    );
  }, [
    daoDetails?.plugins,
    daoSettings.supportThreshold,
    daoSettings.votingMode,
    daoSettings.minParticipation,
    days,
    hours,
    minutes,
    tokenSupply?.formatted,
    setValue,
  ]);

  const settingsUnchanged =
    !isGovernanceChanged && !isMetadataChanged && !isCommunityChanged;

  const handleResetChanges = () => {
    setCurrentMetadata();
    setCurrentCommunity();
    setCurrentGovernance();
  };

  useEffect(() => {
    setCurrentMetadata();
    setCurrentCommunity();
    setCurrentGovernance();
  }, [setCurrentGovernance, setCurrentCommunity, setCurrentMetadata]);

  if (
    paramsAreLoading ||
    detailsAreLoading ||
    settingsAreLoading ||
    tokensAreLoading ||
    tokenSupplyIsLoading
  ) {
    return <Loading />;
  }

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
          mode={isGovernanceChanged ? 'default' : 'disabled'}
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
                  <DefineMetadata
                    bgWhite
                    arrayName="daoLinks"
                    currentDaoEnsName={daoDetails?.ensDomain || ''}
                  />
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
                  <SelectEligibility />
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
                  <ConfigureCommunity />
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
                    generatePath(ProposeNewSettings, {network, dao: daoId})
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
  );
};

export default withTransaction('EditSettings', 'component')(EditSettings);

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
