import React, {useCallback, useEffect, useMemo} from 'react';
import {DaoDetails, MultisigVotingSettings} from '@aragon/sdk-client';
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
  MultisigEligibility,
  MultisigProposerEligibility,
} from 'components/multisigEligibility';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import ConfigureCommunity from 'containers/configureCommunity';
import DefineMetadata from 'containers/defineMetadata';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import useScreen from 'hooks/useScreen';
import {Layout} from 'pages/settings';
import {toDisplayEns} from 'utils/library';
import {ProposeNewSettings} from 'utils/paths';

type EditMsSettingsProps = {
  daoDetails: DaoDetails;
};

export const EditMsSettings: React.FC<EditMsSettingsProps> = ({daoDetails}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork(); // TODO get network from dao details
  const {isMobile} = useScreen();

  const {setValue, control} = useFormContext();
  const {fields, replace} = useFieldArray({name: 'daoLinks', control});
  const {errors, isValid, isDirty} = useFormState({control});

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType: PluginTypes = 'multisig.plugin.dao.eth';
  const {data: pluginVotingSettings, isLoading: settingsAreLoading} =
    useVotingSettings({
      pluginAddress,
      pluginType,
    });

  const {data: members, isLoading: membersAreLoading} = useDaoMembers(
    pluginAddress,
    pluginType
  );

  const isLoading = membersAreLoading || settingsAreLoading;

  const votingSettings = pluginVotingSettings as
    | MultisigVotingSettings
    | undefined;

  const dataFetched = !!(!isLoading && members && votingSettings?.minApprovals);

  const [
    daoName,
    daoSummary,
    daoLogo,
    resourceLinks,
    formEligibleProposer,
    multisigMinimumApprovals,
  ] = useWatch({
    name: [
      'daoName',
      'daoSummary',
      'daoLogo',
      'daoLinks',
      'eligibilityType',
      'multisigMinimumApprovals',
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

  const isMetadataChanged = (daoDetails?.metadata.name &&
    (daoName !== daoDetails.metadata.name ||
      daoSummary !== daoDetails.metadata.description ||
      daoLogo !== daoDetails.metadata.avatar ||
      !resourceLinksAreEqual)) as boolean;

  let isGovernanceChanged = false;
  if (multisigMinimumApprovals && votingSettings?.minApprovals) {
    isGovernanceChanged =
      multisigMinimumApprovals !== votingSettings.minApprovals;
  }

  let daoEligibleProposer: MultisigProposerEligibility = formEligibleProposer;
  if (votingSettings) {
    daoEligibleProposer = votingSettings.onlyListed ? 'multisig' : 'anyone';
  }

  const isCommunityChanged = daoEligibleProposer !== formEligibleProposer;

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
    setValue,
    daoDetails.metadata.name,
    daoDetails.metadata.description,
    daoDetails.metadata?.avatar,
    daoDetails.metadata.links,
    replace,
  ]);

  const setCurrentCommunity = useCallback(() => {
    setValue('eligibilityType', daoEligibleProposer);
  }, [daoEligibleProposer, setValue]);

  const setCurrentGovernance = useCallback(() => {
    if (votingSettings) {
      const multisigWallets = members.members;
      setValue('multisigMinimumApprovals', votingSettings.minApprovals);
      setValue('multisigWallets', multisigWallets);
      setValue(
        'membership',
        daoDetails?.plugins[0].id === 'token-voting.plugin.dao.eth'
          ? 'token'
          : 'multisig'
      );
    }
  }, [votingSettings, members.members, setValue, daoDetails?.plugins]);

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
      setCurrentGovernance();
      setCurrentCommunity();
    }
  }, [
    dataFetched,
    isDirty,
    setCurrentCommunity,
    setCurrentGovernance,
    setCurrentMetadata,
    settingsUnchanged,
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
    return <Loading />;
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
                    <MultisigEligibility />
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
                className="w-full md:w-max"
                label={t('settings.reviewProposal')}
                iconLeft={<Icon icon={IconType.APP_GOVERNANCE} />}
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
  ) : (
    <Loading />
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
