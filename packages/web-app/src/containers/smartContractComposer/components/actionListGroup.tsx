import {IconChevronRight, ListItemAction} from '@aragon/ui-components';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {SmartContract} from 'utils/types';

type ActionListGroupProps = Pick<SmartContract, 'actions'>;

const ActionListGroup: React.FC<ActionListGroupProps> = ({actions}) => {
  const {t} = useTranslation();
  const {setValue} = useFormContext();

  return (
    <ListGroup>
      <ContractNumberIndicator>
        {actions.length === 1
          ? t('scc.labels.singleActionAvailable')
          : t('scc.labels.nActionsAvailable', {
              numConnected: actions.length,
            })}
      </ContractNumberIndicator>
      {actions.map(a => (
        // TODO: replace with new listitem that takes image
        // or custom component
        <ListItemAction
          key={a.name}
          title={a.name}
          subtitle={a.name}
          bgWhite
          iconRight={<IconChevronRight />}
          onClick={() => setValue('selectedAction', a)}
        />
      ))}
    </ListGroup>
  );
};

export default ActionListGroup;

const ListGroup = styled.div.attrs({
  className: 'flex-1 pt-3 desktop:pt-4 pb-2 space-y-1',
})``;

const ContractNumberIndicator = styled.div.attrs({
  className: 'ft-text-sm font-bold text-ui-400 hidden desktop:block',
})``;
