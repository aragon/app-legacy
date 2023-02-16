import {CardTransfer, CardToken} from '@aragon/ui-components';
import {AccordionMethod} from 'components/accordionMethod';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ActionWithdraw} from 'utils/types';

export const WithdrawCard: React.FC<{
  action: ActionWithdraw;
  daoName: string;
}> = ({action, daoName}) => {
  const {t} = useTranslation();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('TransferModal.item2Title')}
      smartContractName={t('labels.aragonOSx')}
      verified
      methodDescription={t('AddActionModal.withdrawAssetsActionSubtitle')}
    >
      <Container>
        <CardTransfer
          to={action.to}
          from={daoName}
          toLabel={t('labels.to')}
          fromLabel={t('labels.from')}
        />
        <CardToken
          tokenName={action.tokenName}
          tokenImageUrl={action.tokenImgUrl}
          tokenSymbol={action.tokenSymbol}
          tokenCount={action.amount}
          treasuryShare={
            action.tokenPrice
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(action.tokenPrice * action.amount)
              : t('finance.unknownUSDValue')
          }
          type={'transfer'}
        />
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 rounded-b-xl border border-t-0 border-ui-100 space-y-3 p-3',
})``;
