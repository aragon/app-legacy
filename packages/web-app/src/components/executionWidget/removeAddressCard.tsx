import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {ActionAddAddress} from 'utils/types';
import {AccordionMethod} from 'components/accordionMethod';
import {ListItemAddress} from '@aragon/ui-components';
import AccordionSummary from 'containers/actionBuilder/addAddresses/accordionSummary';

export const RemoveAddressCard: React.FC<{
  action: ActionAddAddress;
}> = ({action}) => {
  const {t} = useTranslation();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.removeWallets')}
      smartContractName={t('labels.aragonCore')}
      verified
      methodDescription={t('labels.removeWalletsDescription')}
    >
      <Container>
        {action.inputs.memberWallets.map(({address}, index: number) => (
          <ListItemAddress label={address} src={address} key={index} />
        ))}
      </Container>
      <AccordionSummary
        type="execution-widget"
        total={action.inputs.memberWallets.length}
        IsRemove
      />
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className: 'bg-ui-50 border border-t-0 border-ui-100 space-y-1 p-2',
})``;
