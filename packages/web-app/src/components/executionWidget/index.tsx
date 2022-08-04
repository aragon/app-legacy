import React, {useCallback} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ButtonText} from '@aragon/ui-components';

import {useActionsContext} from 'context/actions';
import {useDaoMetadata} from 'hooks/useDaoMetadata';
import {useDaoParam} from 'hooks/useDaoParam';
import {
  Action,
  ActionsTypes,
  ActionWithdraw,
  ActionAddAddress,
} from 'utils/types';
import {WithdrawCard} from './withdrawCard';
import {AddAddressCard} from './addAddressCard';
import {RemoveAddressCard} from './removeAddressCard';

type RenderActionsProps = {
  action: Action;
  type: ActionsTypes;
};

export const ReviewExecution: React.FC = () => {
  const {t} = useTranslation();
  const {getValues} = useFormContext();
  const {actions} = getValues();
  const {actions: actionTypes} = useActionsContext();

  const {data: daoId} = useDaoParam();
  const {data: dao} = useDaoMetadata(daoId);

  const RenderActions = useCallback(
    ({action, type}: RenderActionsProps) => {
      switch (type) {
        case 'withdraw_assets':
          return (
            <>
              <WithdrawCard
                action={action as ActionWithdraw}
                daoName={dao?.name || ''}
              />
            </>
          );
        case 'add_address':
          return (
            <>
              <AddAddressCard action={action as ActionAddAddress} />
            </>
          );
        case 'remove_address':
          return (
            <>
              <RemoveAddressCard action={action as ActionAddAddress} />
            </>
          );
        default:
          return <></>;
      }
    },
    [dao?.name]
  );

  return (
    <Card>
      <Header>
        <Title>{t('governance.executionCard.title')}</Title>
        <Description>{t('governance.executionCard.description')}</Description>
      </Header>
      <Content>
        {actions?.map((action: Action, index: number) => (
          <RenderActions
            {...{action}}
            key={index}
            type={actionTypes[index]?.name || 'withdraw_assets'}
          />
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
