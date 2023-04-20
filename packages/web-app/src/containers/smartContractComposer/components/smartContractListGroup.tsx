import {IconChevronRight} from '@aragon/ui-components';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {SccFormData} from 'pages/demoScc';
import {ListItemContract} from './listItemContract';

const SmartContractListGroup: React.FC = () => {
  const {t} = useTranslation();
  const {setValue, getValues} = useFormContext<SccFormData>();

  const contracts = getValues('contracts');

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
        <ListItemContract
          key={c.address}
          title={c.name}
          subtitle={`${c.actions.length} Actions`}
          logo={c.logo}
          bgWhite
          iconRight={<IconChevronRight />}
          onClick={() => setValue('selectedSC', c)}
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
