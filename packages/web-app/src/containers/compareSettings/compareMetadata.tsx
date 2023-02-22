import {DaoDetails} from '@aragon/sdk-client';
import {AvatarDao, ListItemLink} from '@aragon/ui-components';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useNetwork} from 'context/network';
import {EditSettings} from 'utils/paths';
import {ProposalResource} from 'utils/types';
import {Views} from '.';

type CompareMetadataProps = {
  daoId: string;
  daoDetails?: DaoDetails;
  view: Views;
};

export const CompareMetadata: React.FC<CompareMetadataProps> = ({
  daoId,
  daoDetails,
  view,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {getValues} = useFormContext();

  const [daoName, daoSummary, daoLogo, daoLinks] = getValues([
    'daoName',
    'daoSummary',
    'daoLogo',
    'daoLinks',
  ]);

  let displayedInfo;
  if (view === 'new') {
    displayedInfo = {
      name: daoName,
      summary: daoSummary,
      avatar: daoLogo,
      links: daoLinks.filter((l: ProposalResource) => l.name && l.url),
    };
  } else {
    displayedInfo = {
      name: daoDetails?.metadata.name,
      summary: daoDetails?.metadata.description,
      avatar: daoDetails?.metadata.avatar,
      links: daoDetails?.metadata.links.filter(l => l.name && l.url),
    };
  }

  return (
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
          <AvatarDao
            daoName={displayedInfo.name}
            {...(displayedInfo.avatar && {
              src: URL.createObjectURL(displayedInfo.avatar),
            })}
          />
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
      {displayedInfo.links && displayedInfo.links.length > 0 && (
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
      )}
    </DescriptionListContainer>
  );
};
