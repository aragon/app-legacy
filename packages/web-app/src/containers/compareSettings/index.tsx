import {
  AvatarDao,
  ButtonGroup,
  ListItemLink,
  Option,
} from '@aragon/ui-components';
import React, {useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {Loading} from 'components/temporary';
import {useNetwork} from 'context/network';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {getDHMFromSeconds} from 'utils/date';
import {EditSettings} from 'utils/paths';

const CompareSettings: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {data: daoId} = useDaoParam();
  const {getValues} = useFormContext();

  const {data: daoDetails, isLoading: areDetailsLoading} = useDaoDetails(
    daoId!
  );

  const {data: daoSettings, isLoading: areSettingsLoading} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const [selectedButton, setSelectedButton] = useState<'new' | 'old'>('new');

  const onButtonGroupChangeHandler = () => {
    setSelectedButton(prev => (prev === 'new' ? 'old' : 'new'));
  };

  if (areDetailsLoading || areDetailsLoading || areSettingsLoading) {
    return <Loading />;
  }

  let displayedInfo;
  if (selectedButton === 'new') {
    displayedInfo = {
      name: getValues('daoName'),
      summary: getValues('daoSummary'),
      links: getValues('daoLinks'),
      minParticipation: getValues('minimumParticipation'),
      approvalThreshold: getValues('minimumApproval'),
      days: getValues('durationDays'),
      hours: getValues('durationHours'),
      minutes: getValues('durationMinutes'),
    };
  } else {
    const duration = getDHMFromSeconds(daoSettings.minDuration);
    displayedInfo = {
      name: daoDetails?.metadata.name,
      summary: daoDetails?.metadata.description,
      links: daoDetails?.metadata.links,
      minParticipation: daoSettings,
      approvalThreshold: daoSettings,
      days: duration.days,
      hours: duration.hours,
      minutes: duration.minutes,
    };
  }

  return (
    <div className="space-y-2">
      <div className="flex">
        <ButtonGroup
          bgWhite={false}
          defaultValue={selectedButton}
          onChange={onButtonGroupChangeHandler}
        >
          <Option value="new" label={t('settings.newSettings')} />
          <Option value="old" label={t('settings.oldSettings')} />
        </ButtonGroup>
      </div>

      <DescriptionListContainer
        title={t('labels.review.daoMetadata')}
        onEditClick={() =>
          navigate(generatePath(EditSettings, {network, dao: daoId}))
        }
        editLabel={t('settings.edit')}
      >
        <Dl>
          <Dt>{t('labels.logo')}</Dt>
          <Dd>
            <AvatarDao daoName={displayedInfo.name} />
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.daoName')}</Dt>
          <Dd>{displayedInfo.name}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.summary')}</Dt>
          <Dd>{displayedInfo.summary}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.links')}</Dt>
          <Dd>
            <div className="space-y-1.5">
              {displayedInfo.links.map((link: {name: string; url: string}) => (
                <ListItemLink
                  key={link.name + link.url}
                  label={link.name}
                  href={link.url}
                />
              ))}
            </div>
          </Dd>
        </Dl>
      </DescriptionListContainer>

      <DescriptionListContainer
        title={t('labels.review.governance')}
        onEditClick={() =>
          navigate(generatePath(EditSettings, {network, dao: daoId}))
        }
        editLabel={t('settings.edit')}
      >
        <Dl>
          <Dt>{t('labels.minimumApproval')}</Dt>
          <Dd> {displayedInfo.minParticipation}%</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumSupport')}</Dt>
          <Dd>{'displayedInfo.approvalThreshold'}%</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumDuration')}</Dt>
          <Dd>
            {t('governance.settings.preview', {
              days: displayedInfo.days,
              hours: displayedInfo.hours,
              minutes: displayedInfo.minutes,
            })}
          </Dd>
        </Dl>
      </DescriptionListContainer>
    </div>
  );
};

export default CompareSettings;
