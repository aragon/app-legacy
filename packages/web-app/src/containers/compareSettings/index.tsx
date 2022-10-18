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
import {useNetwork} from 'context/network';
import {useDaoParam} from 'hooks/useDaoParam';
import {EditSettings} from 'utils/paths';

const CompareSettings: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {data: daoId} = useDaoParam();
  const {network} = useNetwork();
  const {getValues} = useFormContext();

  const [selectedButton, setSelectedButton] = useState<'new' | 'old'>('new');

  const onButtonGroupChangeHandler = () => {
    setSelectedButton(prev => (prev === 'new' ? 'old' : 'new'));
  };

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
            <AvatarDao daoName="Aragon" />
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.daoName')}</Dt>
          <Dd>{getValues('daoName')}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.summary')}</Dt>
          <Dd>{getValues('daoSummary')}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.links')}</Dt>
          <Dd>
            <div className="space-y-1.5">
              {getValues('daoLinks').map(
                (link: {name: string; url: string}) => (
                  <ListItemLink
                    key={link.name + link.url}
                    label={link.name}
                    href={link.url}
                  />
                )
              )}
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
          <Dd> {getValues('minimumApproval')}%</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumSupport')}</Dt>
          <Dd>{getValues('minimumParticipation')}%</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumDuration')}</Dt>
          <Dd>
            {t('governance.settings.preview', {
              days: getValues('durationDays'),
              hours: getValues('durationHours'),
              minutes: getValues('durationMinutes'),
            })}
          </Dd>
        </Dl>
      </DescriptionListContainer>
    </div>
  );
};

export default CompareSettings;
