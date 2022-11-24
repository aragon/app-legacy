import {ListItemAction, IconChevronRight} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

// TODO: Fill out as we go
export type SmartContractAction = {};

export type SmartContract = {
  actions: Array<SmartContractAction>;
  address: string;
  logo?: string;
  name: string;
};

// NOTE: may come from form, not set in stone
type SCCListGroupProps = {
  contracts: Array<SmartContract>;
};

const SmartContractListGroup: React.FC<SCCListGroupProps> = ({contracts}) => {
  const {t} = useTranslation();

  return (
    <ListGroup>
      <ContractNumberIndicator>
        {contracts.length === 1
          ? t('scc.labels.singleContractConnected')
          : t('scc.labels.nContractsConnected', {
              numConnected: contracts.length,
            })}
      </ContractNumberIndicator>
      {contracts.map(c => (
        <ListItemAction
          key={c.address}
          title={c.name}
          subtitle={`${c.actions.length} Actions`}
          bgWhite
          iconRight={<IconChevronRight />}
        />
      ))}
    </ListGroup>
  );
};

export default SmartContractListGroup;

const ListGroup = styled.div.attrs({className: 'pb-2 space-y-1'})``;

const ContractNumberIndicator = styled.div.attrs({
  className: 'ft-text-sm font-bold text-ui-400',
})``;
