import React, {useState, useEffect, useCallback} from 'react';
import {withTransaction} from '@elastic/apm-rum-react';
import {useTranslation} from 'react-i18next';
import {
  AlertInline,
  Breadcrumb,
  ButtonText,
  IconGovernance,
  Wizard,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {
  generatePath,
  useParams,
  useNavigate,
  Link as RouterLink,
} from 'react-router-dom';

import DefineMetadata from 'containers/defineMetadata';
import ConfigureCommunity from 'containers/configureCommunity';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import useScreen from 'hooks/useScreen';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {Loading} from 'components/temporary';
import {ProposeNewSettings} from 'utils/paths';
import {useNetwork} from 'context/network';
import {PluginTypes} from 'hooks/usePluginClient';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {getDHMFromSeconds} from 'utils/date';

type linksArray = {
  name: string;
  url: string;
}[];

const EditSettings: React.FC = () => {
  const [currentMenu, setCurrentMenu] = useState<'metadata' | 'governance'>(
    'metadata'
  );
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {isMobile} = useScreen();
  const {network} = useNetwork();
  const {dao} = useParams();
  const {control, setValue} = useFormContext();
  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();
  const {data: daoId, loading: paramAreLoading} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId!
  );
  const {data: daoSettings, isLoading: settingsAreLoading} = usePluginSettings(
    daoDetails?.plugins[1].instanceAddress as string,
    daoDetails?.plugins[1].id as PluginTypes
  );
  const [isMetadataChanged, setIsMetadataChanged] = useState(false);
  const [isGovernanceChanged, setIsGovernanceChanged] = useState(false);

  const {days, hours, minutes} = getDHMFromSeconds(daoSettings.minDuration);

  const [
    daoName,
    daoSummary,
    daoLogo,
    minimumApproval,
    minimumParticipation,
    support,
    durationDays,
    durationHours,
    durationMinutes,
    membership,
  ] = useWatch({
    name: [
      'daoName',
      'daoSummary',
      'daoLogo',
      'minimumApproval',
      'minimumParticipation',
      'support',
      'durationDays',
      'durationHours',
      'durationMinutes',
      'membership',
    ],
  });

  const {fields} = useFieldArray({name: 'links', control});

  const setCurrentMetadata = useCallback(() => {
    setValue('daoName', daoDetails?.ensDomain);
    setValue('daoSummary', daoDetails?.metadata.description);
    setValue('daoLogo', daoDetails?.metadata.avatar);
    setValue('links', daoDetails?.metadata.links);
  }, [
    daoDetails?.ensDomain,
    daoDetails?.metadata.avatar,
    daoDetails?.metadata.description,
    daoDetails?.metadata.links,
    setValue,
  ]);

  const setCurrentGovernance = useCallback(() => {
    if (membership === 'token')
      setValue('minimumApproval', Math.round(daoSettings.minTurnout * 100));
    else
      setValue(
        'minimumParticipation',
        Math.round(daoSettings.minTurnout * 100)
      );
    setValue('support', Math.round(daoSettings.minSupport * 100));
    setValue('durationDays', days);
    setValue('durationHours', hours);
    setValue('durationMinutes', minutes);
    // TODO: Need to add community settings later, Also the Alerts share will be added later
    setValue(
      'membership',
      daoDetails?.plugins[0].id === 'erc20voting.dao.eth' ? 'token' : 'wallet'
    );
  }, [
    daoDetails?.plugins,
    daoSettings.minSupport,
    daoSettings.minTurnout,
    days,
    hours,
    membership,
    minutes,
    setValue,
  ]);

  useEffect(() => {
    setCurrentMetadata();
    setCurrentGovernance();
  }, [setCurrentGovernance, setCurrentMetadata]);

  useEffect(() => {
    console.log('checkcheck', fields);
  }, [fields]);

  // if (daoDetails?.metadata?.links) {
  //   const storageLinks = daoDetails?.metadata?.links || [];
  //   for (let index = 0; index < storageLinks.length; index++) {
  //     if (
  //       (fields as unknown as linksArray)?.[index]?.name !==
  //         storageLinks?.[index].name ||
  //       (fields as unknown as linksArray)?.[index]?.url !==
  //         storageLinks?.[index].url
  //     ) {
  //       console.log('View', fields?.[index], storageLinks?.[index]);
  //       setIsMetadataChanged(true);
  //       break;
  //     }
  //   }
  // }

  useEffect(() => {
    if (
      daoName !== daoDetails?.ensDomain ||
      daoSummary !== daoDetails?.metadata.description ||
      daoLogo !== daoDetails?.metadata.avatar
    )
      setIsMetadataChanged(true);
    else setIsMetadataChanged(false);

    // if (daoDetails?.metadata?.links) {
    //   const storageLinks = daoDetails?.metadata?.links || [];
    //   for (let index = 0; index < storageLinks.length; index++) {
    //     if (
    //       (fields as unknown as linksArray)?.[index]?.name !==
    //         storageLinks?.[index].name ||
    //       (fields as unknown as linksArray)?.[index]?.url !==
    //         storageLinks?.[index].url
    //     ) {
    //       console.log('View', fields?.[index], storageLinks?.[index]);
    //       setIsMetadataChanged(true);
    //       break;
    //     }
    //   }
    // }

    // console.log('->', links, daoDetails?.metadata?.links);

    // TODO: We need to force forms to only use one type, Number or string
    if (
      Number(
        membership === 'token' ? minimumApproval : minimumParticipation
      ) !== Math.round(daoSettings.minTurnout * 100) ||
      Number(support) !== Math.round(daoSettings.minSupport * 100) ||
      Number(durationDays) !== days ||
      Number(durationHours) !== hours ||
      Number(durationMinutes) !== minutes
    )
      setIsGovernanceChanged(true);
    else setIsGovernanceChanged(false);
  }, [
    daoDetails?.ensDomain,
    daoDetails?.metadata.avatar,
    daoDetails?.metadata.description,
    daoDetails?.metadata.links,
    daoLogo,
    daoName,
    daoSettings.minSupport,
    daoSettings.minTurnout,
    daoSummary,
    days,
    durationDays,
    durationHours,
    durationMinutes,
    fields,
    hours,
    membership,
    minimumApproval,
    minimumParticipation,
    minutes,
    support,
  ]);

  if (paramAreLoading || detailsAreLoading || settingsAreLoading) {
    return <Loading />;
  }

  return (
    <Container>
      <div className="-mx-2 desktop:mx-0">
        <Wizard
          includeStepper={false}
          title={t('settings.editDaoSettings')}
          description={t('settings.editSubtitle')}
          nav={
            <Breadcrumb
              icon={icon}
              crumbs={breadcrumbs}
              onClick={navigate}
              tag={tag}
            />
          }
        />

        {isMobile && (
          <div className="px-2 pb-3 -mt-1 bg-white">
            <ButtonText
              className="w-full tablet:w-max"
              label={t('settings.resetChanges')}
              mode="secondary"
              size={isMobile ? 'large' : 'medium'}
              disabled
            />
          </div>
        )}
      </div>

      <div>
        <Accordion>
          <Heading>{t('labels.review.daoMetadata')}</Heading>

          <HStack>
            {isMetadataChanged && (
              <AlertInline label={t('settings.newSettings')} mode="neutral" />
            )}
            <ButtonText
              label={
                currentMenu === 'metadata'
                  ? t('settings.resetChanges')
                  : t('settings.edit')
              }
              disabled={currentMenu === 'metadata' && !isMetadataChanged}
              mode="secondary"
              onClick={() =>
                currentMenu === 'metadata'
                  ? setCurrentMetadata()
                  : setCurrentMenu('metadata')
              }
              bgWhite
            />
          </HStack>
        </Accordion>
        {currentMenu === 'metadata' && (
          <AccordionContent>
            <DefineMetadata />
          </AccordionContent>
        )}
      </div>

      <div>
        <Accordion>
          <Heading>{t('labels.review.governance')}</Heading>

          <HStack>
            {isGovernanceChanged && (
              <AlertInline label={t('settings.newSettings')} mode="neutral" />
            )}
            <ButtonText
              label={
                currentMenu === 'governance'
                  ? t('settings.resetChanges')
                  : t('settings.edit')
              }
              disabled={currentMenu === 'governance' && !isGovernanceChanged}
              mode="secondary"
              onClick={() =>
                currentMenu === 'governance'
                  ? setCurrentGovernance()
                  : setCurrentMenu('governance')
              }
              bgWhite
            />
          </HStack>
        </Accordion>
        {currentMenu === 'governance' && (
          <AccordionContent>
            <ConfigureCommunity />
          </AccordionContent>
        )}
      </div>

      <ButtonContainer>
        <HStack>
          <RouterLink to={generatePath(ProposeNewSettings, {network, dao})}>
            <ButtonText
              className="w-full tablet:w-max"
              label={t('settings.proposeSettings')}
              iconLeft={<IconGovernance />}
              size={isMobile ? 'large' : 'medium'}
            />
          </RouterLink>
          <ButtonText
            className="w-full tablet:w-max"
            label={t('settings.resetChanges')}
            mode="secondary"
            size={isMobile ? 'large' : 'medium'}
          />
        </HStack>

        <AlertInline label={t('settings.proposeSettingsInfo')} mode="neutral" />
      </ButtonContainer>
    </Container>
  );
};

export default withTransaction('EditSettings', 'component')(EditSettings);

const Container = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 desktop:mt-5 space-y-5 desktop:space-y-8',
})``;

const Accordion = styled.div.attrs({
  className:
    'desktop:flex justify-between items-center p-3 bg-white rounded-xl space-y-2 desktop:space-y-0',
})``;

const AccordionContent = styled.div.attrs({
  className: 'mx-auto mt-3 desktop:mt-5 space-y-3 desktop:w-3/5',
})``;

const Heading = styled.div.attrs({
  className: 'text-lg text-ui-800',
})``;

const HStack = styled.div.attrs({
  className:
    'desktop:flex space-x-0 desktop:space-x-3 space-y-2 desktop:space-y-0',
})``;

const ButtonContainer = styled.div.attrs({
  className: 'mx-auto mt-5 desktop:mt-8 space-y-2 desktop:w-3/5',
})``;
