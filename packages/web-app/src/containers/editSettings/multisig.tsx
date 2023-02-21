import {DaoDetails, MultisigVotingSettings} from '@aragon/sdk-client';
import {
  AlertInline,
  ButtonText,
  IconGovernance,
  ListItemAction,
} from '@aragon/ui-components';
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
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import ConfigureCommunity from 'containers/configureCommunity';
import DefineMetadata from 'containers/defineMetadata';
import {useNetwork} from 'context/network';
import {MultisigMember, useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {Layout} from 'pages/settings';
import {ProposeNewSettings} from 'utils/paths';

type EditMsSettingsProps = {
  daoId: string;
  daoDetails: DaoDetails;
};

export const EditMsSettings: React.FC<EditMsSettingsProps> = ({
  daoId,
  daoDetails,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isMobile} = useScreen();

  const {setValue, control} = useFormContext();
  const {fields, replace} = useFieldArray({
    name: 'daoLinks',
    control,
  });
  const {errors, isValid} = useFormState({control});

  const {data, isLoading: settingsAreLoading} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );
  const settings = data as MultisigVotingSettings;

  const {data: members, isLoading: membersAreLoading} = useDaoMembers(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const [
    daoName,
    daoSummary,
    daoLogo,
    resourceLinks,
    multisigMinimumApprovals,
  ] = useWatch({
    name: [
      'daoName',
      'daoSummary',
      'daoLogo',
      'daoLinks',
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

  // metadata setting changes
  const isMetadataChanged =
    daoDetails?.metadata.name &&
    (daoName !== daoDetails.metadata.name ||
      daoSummary !== daoDetails.metadata.description ||
      daoLogo !== daoDetails.metadata.avatar ||
      !resourceLinksAreEqual);

  // TODO: We need to force forms to only use one type, Number or string
  const isGovernanceChanged =
    multisigMinimumApprovals !== settings.minApprovals;

  const setCurrentMetadata = useCallback(() => {
    setValue('daoName', daoDetails?.metadata.name);
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
    daoDetails?.metadata.avatar,
    daoDetails?.metadata.description,
    daoDetails?.metadata.links,
    daoDetails?.metadata.name,
    setValue,
    replace,
  ]);

  const setCurrentGovernance = useCallback(() => {
    const multisigWallets = members.members as MultisigMember[];
    setValue('multisigMinimumApprovals', settings.minApprovals);
    setValue('multisigWallets', multisigWallets);
    setValue(
      'membership',
      daoDetails?.plugins[0].id === 'token-voting.plugin.dao.eth'
        ? 'token'
        : 'multisig'
    );
  }, [daoDetails?.plugins, members.members, settings.minApprovals, setValue]);

  const settingsUnchanged = !isGovernanceChanged && !isMetadataChanged;

  const handleResetChanges = () => {
    setCurrentMetadata();
    setCurrentGovernance();
  };

  useEffect(() => {
    setCurrentMetadata();
    setCurrentGovernance();
  }, [setCurrentGovernance, setCurrentMetadata]);

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

  if (settingsAreLoading || membersAreLoading) {
    return <Loading />;
  }

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
                  <DefineMetadata bgWhite arrayName="daoLinks" isSettingPage />
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
