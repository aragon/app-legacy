import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ButtonText} from '@aragon/ui-components';

import {Action} from 'utils/types';
import {ActionsFilter} from './actionsFilter';

export const ExecutionWidget: React.FC = () => {
  const {t} = useTranslation();
  const {getValues} = useFormContext();
  const {actions} = getValues();

  return (
    <Card>
      <Header>
        <Title>{t('governance.executionCard.title')}</Title>
        <Description>{t('governance.executionCard.description')}</Description>
      </Header>
      <Content>
        {actions?.map((action: Action, index: number) => (
          <ActionsFilter {...{action}} key={index} type={action.name} />
        ))}
      </Content>
      <Action>
        <ButtonText
          label={t('governance.proposals.buttons.execute')}
          {...{disabled: true}}
        />
      </Action>
    </Card>
  );
};

const Card = styled.div.attrs({
  className: 'w-84 flex-col bg-white rounded-xl p-3 space-y-3',
})``;

const Header = styled.div.attrs({
  className: 'flex flex-col space-y-1',
})``;

const Title = styled.h2.attrs({
  className: 'text-ui-800 font-bold ft-text-xl',
})``;

const Description = styled.p.attrs({
  className: 'text-ui-600 font-normal ft-text-sm',
})``;

const Content = styled.div.attrs({
  className: 'flex flex-col space-y-3',
})``;

const Action = styled.div.attrs({
  className: 'flex',
})``;
