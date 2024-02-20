import React from 'react';

import {Button, AlertCard, AlertInline, IconType} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
import {PluginTypes} from 'hooks/usePluginClient';
import {CHAIN_METADATA} from 'utils/constants';
import {Action, ExecutionStatus} from 'utils/types';
import {ActionsFilter} from './actionsFilter';

export type ExecutionWidgetProps = {
  pluginType?: PluginTypes;
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
  pluginType,
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
              iconLeft: IconType.PLUS,
            }
          }
        />
      ) : (
        <>
          <Content>
            {actions.map((action, index) => {
              if (action) {
                return (
                  <ActionsFilter action={action} key={index} status={status} />
                );
              }
            })}
          </Content>
          <WidgetFooter
            pluginType={pluginType}
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
  'status' | 'txhash' | 'onExecuteClicked' | 'pluginType'
>;

const WidgetFooter: React.FC<FooterProps> = ({
  status = 'default',
  onExecuteClicked,
  txhash,
  pluginType,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const handleTxViewButtonClick = () => {
    window.open(CHAIN_METADATA[network].explorer + 'tx/' + txhash, '_blank');
  };

  switch (status) {
    case 'defeated': {
      return pluginType === 'multisig.plugin.dao.eth' ? (
        <AlertCard
          variant="info"
          message={t('governance.executionCard.statusMultisig.expiredTitle')}
          description={t('governance.executionCard.statusMultisig.expiredDesc')}
        />
      ) : (
        <AlertInline
          message={t('governance.executionCard.status.defeated')}
          variant="warning"
        />
      );
    }

    case 'executable':
      return (
        <Footer>
          <StyledButtonText
            variant="primary"
            size="lg"
            onClick={onExecuteClicked}
          >
            {t('governance.proposals.buttons.execute')}
          </StyledButtonText>
          <AlertInline
            message={t('governance.executionCard.status.succeeded')}
            variant="info"
          />
        </Footer>
      );
    case 'executable-failed':
      return (
        <Footer>
          <StyledButtonText
            variant="primary"
            size="lg"
            onClick={onExecuteClicked}
          >
            {t('governance.proposals.buttons.execute')}
          </StyledButtonText>
          {txhash && (
            <StyledButtonText
              variant="tertiary"
              iconRight={IconType.LINK_EXTERNAL}
              size="lg"
              onClick={handleTxViewButtonClick}
            >
              {t('governance.executionCard.seeTransaction')}
            </StyledButtonText>
          )}
          <AlertInline
            message={t('governance.executionCard.status.failed')}
            variant="warning"
          />
        </Footer>
      );
    case 'executed':
      return (
        <Footer>
          {txhash && (
            <StyledButtonText
              variant="tertiary"
              iconRight={IconType.LINK_EXTERNAL}
              size="lg"
              onClick={handleTxViewButtonClick}
            >
              {t('governance.executionCard.seeTransaction')}
            </StyledButtonText>
          )}

          <AlertInline
            message={t('governance.executionCard.status.executed')}
            variant="success"
          />
        </Footer>
      );
    default:
      return null;
  }
};

const Card = styled.div.attrs({
  className: 'w-84 flex-col bg-neutral-0 rounded-xl py-6 px-4 xl:p-6 space-y-6',
})``;

const Header = styled.div.attrs({
  className: 'flex flex-col space-y-2',
})``;

const Title = styled.h2.attrs({
  className: 'text-neutral-800 font-semibold ft-text-xl',
})``;

const Description = styled.p.attrs({
  className: 'text-neutral-600 font-normal ft-text-sm',
})``;

const Content = styled.div.attrs({
  className: 'flex flex-col space-y-6',
})``;

const Footer = styled.div.attrs({
  className:
    'flex flex-col md:flex-row items-center gap-y-4 md:gap-y-0 md:gap-x-6',
})``;

const StyledButtonText = styled(Button).attrs({
  className: 'w-full md:w-max',
})``;
