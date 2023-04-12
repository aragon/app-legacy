import {IconChevronRight, ListItemAction} from '@aragon/ui-components';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useDaoVerifiedContractsQuery} from 'hooks/useVerifiedContracts';
import {Loading} from 'components/temporary';

const SmartContractListGroup: React.FC = () => {
  const {t} = useTranslation();
  const {setValue} = useFormContext();

  const {data: contracts, isLoading} = useDaoVerifiedContractsQuery();

  return (
    <ListGroup>
      <ContractNumberIndicator>
        {contracts?.length === 1
          ? t('scc.labels.singleContractConnected')
          : t('scc.labels.nContractsConnected', {
              numConnected: contracts?.length ?? 0,
            })}
      </ContractNumberIndicator>
      {isLoading ? (
        <div className="h-full">
          <Loading />
        </div>
      ) : (
        contracts?.map(c => (
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
        ))
      )}
    </ListGroup>
  );
};

export default SmartContractListGroup;

const ListGroup = styled.div.attrs({className: 'pb-2 space-y-1'})``;

const ContractNumberIndicator = styled.div.attrs({
  className: 'ft-text-sm font-bold text-ui-400',
})``;
