import React from 'react';
import styled from 'styled-components';

import {AvatarDao, ListItemLink} from '@aragon/ui-components';
import {AccordionMethod} from 'components/accordionMethod';
import {useTranslation} from 'react-i18next';
import {resolveDaoAvatarIpfsCid} from 'utils/library';
import {ActionUpdateMetadata} from 'utils/types';

export const ModifyMetadataCard: React.FC<{action: ActionUpdateMetadata}> = ({
  action: {inputs},
}) => {
  const {t} = useTranslation();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.updateMetadataAction')}
      smartContractName={t('labels.aragonCore')}
      methodDescription={t('labels.updateMetadataActionDescription')}
      verified
    >
      <Container>
        <div>
          <Title>{t('labels.logo')}</Title>
          <AvatarDao
            daoName={inputs.name}
            src={resolveDaoAvatarIpfsCid(inputs.avatar)}
            size="medium"
          />
        </div>
        <div>
          <Title>{t('labels.description')}</Title>
          <Value>{inputs.description}</Value>
        </div>
        <div>
          <Title>{t('labels.links')}</Title>
          <Value>
            {inputs.links.map(link => (
              <ListItemLink key={link.url} label={link.name} href={link.url} />
            ))}
          </Value>
        </div>
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 rounded-b-xl border border-t-0 border-ui-100 space-y-3 p-3',
})``;

const Title = styled.p.attrs({
  className: 'font-bold text-ui-800 mb-1',
})``;

const Value = styled.span.attrs({
  className: 'text-ui-600' as string,
})``;
