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
      {/* {actions.map(c => (
        // TODO: replace with new listitem that takes image
        // or custom component
        <ListItemAction
          key={c.address}
          title={c.name}
          subtitle={`${c.actions.length} Actions`}
          bgWhite
          iconRight={<IconChevronRight />}
          onClick={() => setValue('selectedSC', c)}
        />
      ))} */}
    </ListGroup>
  );
};

export default ActionListGroup;

const ListGroup = styled.div.attrs({
  className: 'flex-1 pt-4 pb-2 space-y-1',
})``;

const ContractNumberIndicator = styled.div.attrs({
  className: 'ft-text-sm font-bold text-ui-400',
})``;
