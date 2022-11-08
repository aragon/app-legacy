import {
  AlertInline,
  ButtonText,
  IconAdd,
  IconLinkExternal,
  StateEmpty,
} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {Action} from 'utils/types';
import {ActionsFilter} from './actionsFilter';

export type ExecutionStatus =
  | 'defeated'
  | 'executed'
  | 'executable'
  | 'executable-failed'
  | 'default';

type ExecutionWidgetProps = {
  txhash?: string;
  actions?: Array<Action | undefined>;
  status?: ExecutionStatus;
  onAddAction?: () => void;
  onExecuteClicked?: () => void;
};

export const ExecutionWidget: React.FC<ExecutionWidgetProps> = ({
  actions = [],
  status,
  txhash,
  onAddAction,
  onExecuteClicked,
}) => {
  const {t} = useTranslation();

  return (
    <Card>
      <Header>
        <Title>{t('governance.executionCard.title')}</Title>
        <Description>{t('governance.executionCard.description')}</Description>
      </Header>
      {actions.length === 0 ? (
        <StateEmpty
          mode="inline"
          type="Object"
          object="smart_contract"
          title="No actions were added"
          secondaryButton={
            onAddAction && {
              label: t('governance.executionCard.addAction'),
              onClick: onAddAction,
              iconLeft: <IconAdd />,
            }
          }
        />
      ) : (
        <>
          <Content>
            {actions.map((action, index: number) => {
              if (action)
                return (
                  <ActionsFilter
                    action={action}
                    key={index}
                    type={action.name}
                  />
                );
            })}
          </Content>
          <WidgetFooter
            status={status}
            txhash={txhash}
            onExecuteClicked={onExecuteClicked}
          />
        </>
      )}
    </Card>
  );
};

type FooterProps = Pick<
  ExecutionWidgetProps,
  'status' | 'txhash' | 'onExecuteClicked'
>;

const WidgetFooter: React.FC<FooterProps> = ({
  status = 'default',
  onExecuteClicked,
}) => {
  const {t} = useTranslation();
  switch (status) {
    // TODO: Commented this piece of code to enable testing. Will be reverted
    // before merging the PR
    // case 'defeated':
    //   return (
    //     <AlertInline
    //       label={t('governance.executionCard.status.defeated')}
    //       mode={'warning'}
    //     />
    //   );
    // case 'executable':
    case 'defeated' as 'executable':
      return (
        <Footer>
          <ButtonText
            label={t('governance.proposals.buttons.execute')}
            size="large"
            onClick={onExecuteClicked}
          />
          <AlertInline label={t('governance.executionCard.status.succeeded')} />
        </Footer>
      );
    case 'executable-failed':
      return (
        <Footer>
          <ButtonText
            label={t('governance.proposals.buttons.execute')}
            size="large"
            onClick={onExecuteClicked}
          />
          <ButtonText
            label={t('governance.executionCard.seeTransaction')}
            mode="secondary"
            iconRight={<IconLinkExternal />}
            size="large"
            bgWhite
          />

          <AlertInline
            label={t('governance.executionCard.status.failed')}
            mode="warning"
          />
        </Footer>
      );
    case 'executed':
      return (
        <Footer>
          <ButtonText
            label={t('governance.executionCard.seeTransaction')}
            mode="secondary"
            iconRight={<IconLinkExternal />}
            size="large"
            bgWhite
          />

          <AlertInline
            label={t('governance.executionCard.status.executed')}
            mode="success"
          />
        </Footer>
      );
    default:
      return null;
  }
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

const Footer = styled.div.attrs({
  className: 'flex gap-x-3',
})``;
