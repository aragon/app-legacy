import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {ActionAddAddress} from 'utils/types';
import {AccordionMethod} from 'components/accordionMethod';
import {ListItemAddress} from '@aragon/ui-components';
import AccordionSummary from 'containers/actionBuilder/addAddresses/accordionSummary';

export const AddAddressCard: React.FC<{
  action: ActionAddAddress;
}> = ({action}) => {
  const {t} = useTranslation();
  const filteredMemberWallets = action.inputs.memberWallets.filter(
    wallet => wallet.address
  );

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.addWallets')}
      smartContractName={t('labels.aragonCore')}
      verified
      methodDescription={t('labels.addWalletsDescription')}
    >
      <Container>
        {filteredMemberWallets.map(({address}) => (
          <ListItemAddress label={address} src={address} key={address} />
        ))}
      </Container>
      <AccordionSummary
        type="execution-widget"
        total={filteredMemberWallets.length}
      />
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className: 'bg-ui-50 border border-t-0 border-ui-100 space-y-1 p-2',
})``;
