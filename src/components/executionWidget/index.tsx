import React from 'react';
import {AlertCard, AlertInline, ButtonText} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';
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
              iconLeft: <Icon icon={IconType.ADD} />,
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
          mode="info"
          title={t('governance.executionCard.statusMultisig.expiredTitle')}
          helpText={t('governance.executionCard.statusMultisig.expiredDesc')}
        />
      ) : (
        <AlertInline
          label={t('governance.executionCard.status.defeated')}
          mode={'warning'}
        />
      );
    }

    case 'executable':
      return (
        <Footer>
          <StyledButtonText
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
          <StyledButtonText
            label={t('governance.proposals.buttons.execute')}
            size="large"
            onClick={onExecuteClicked}
          />
          {txhash && (
            <StyledButtonText
              label={t('governance.executionCard.seeTransaction')}
              mode="secondary"
              iconRight={<Icon icon={IconType.LINK_EXTERNAL} />}
              size="large"
              bgWhite
              onClick={handleTxViewButtonClick}
            />
          )}
          <AlertInline
            label={t('governance.executionCard.status.failed')}
            mode="warning"
          />
        </Footer>
      );
    case 'executed':
      return (
        <Footer>
          {txhash && (
            <StyledButtonText
              label={t('governance.executionCard.seeTransaction')}
              mode="secondary"
              iconRight={<Icon icon={IconType.LINK_EXTERNAL} />}
              size="large"
              bgWhite
              onClick={handleTxViewButtonClick}
            />
          )}

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

const StyledButtonText = styled(ButtonText).attrs({
  className: 'w-full md:w-max',
})``;
