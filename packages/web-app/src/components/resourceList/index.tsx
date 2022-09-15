import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {IconAdd, ListItemLink, StateEmpty} from '@aragon/ui-components';

import {ProposalResource} from 'utils/types';

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
      <Container data-testid="resourceList">
        <Title>{t('labels.resources')}</Title>
        <ListItemContainer>
          {links.map((link, index) => (
            <ListItemLink label={link.name} href={link.url} key={index} />
          ))}
        </ListItemContainer>
      </Container>
    );
  }

  return (
    <StateEmpty
      type="Object"
      mode="inline"
      object="archive"
      title={t('labels.noResources')}
      secondaryButton={
        emptyStateButtonClick
          ? {
              label: t('labels.addResource'),
              onClick: emptyStateButtonClick,
              iconLeft: <IconAdd />,
            }
          : undefined
      }
    />
  );
};

export default ResourceList;

const Container = styled.div.attrs({className: 'p-3 bg-ui-0 rounded-xl'})``;

const Title = styled.p.attrs({className: 'ft-text-xl font-bold text-ui-800'})``;

const ListItemContainer = styled.div.attrs({className: 'mt-3 space-y-2'})``;
