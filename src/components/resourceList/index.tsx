import {ListItemLink} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ProposalResource} from 'utils/types';
import {Card, CardEmptyState, IconType} from '@aragon/ods';

type ResourceListProps = {
  links?: Array<ProposalResource>;
  emptyStateButtonClick?: () => void;
};

const ResourceList: React.FC<ResourceListProps> = ({
  links = [],
  emptyStateButtonClick,
}) => {
  const {t} = useTranslation();

  if (links.length > 0) {
    return (
      <Card data-testid="resourceList" className="p-6">
        <Title>{t('labels.resources')}</Title>
        <ListItemContainer>
          {links.map((link, index) => (
            <ListItemLink label={link.name} href={link.url} key={index} />
          ))}
        </ListItemContainer>
      </Card>
    );
  }

  return (
    <CardEmptyState
      objectIllustration={{object: 'ARCHIVE'}}
      heading={t('labels.noResources')}
      secondaryButton={
        emptyStateButtonClick
          ? {
              label: t('labels.addResource'),
              onClick: emptyStateButtonClick,
              iconLeft: IconType.PLUS,
            }
          : undefined
      }
    />
  );
};

export default ResourceList;

const Title = styled.p.attrs({
  className: 'ft-text-xl font-semibold text-neutral-800',
})``;

const ListItemContainer = styled.div.attrs({className: 'mt-6 space-y-4'})``;
