import {CardToken, CardTransfer} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {ActionWithdraw} from 'utils/types';
import {NumberFormat, formatterUtils} from '@aragon/ods';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';

export const WithdrawCard: React.FC<{
  action: ActionWithdraw;
  daoAddress: string;
  daoLabel: string;
}> = ({action, daoAddress, daoLabel}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const amount = Number(action.amount) || 0;
  const tokenPrice = Number(action.tokenPrice) || 0;

  const tokenCountDisplay =
    amount > 99999
      ? (formatterUtils.formatNumber(amount, {
          format: NumberFormat.TOKEN_AMOUNT_SHORT,
        }) as string)
      : (formatterUtils.formatNumber(
          amount.toFixed(amount > 100 ? 2 : amount < 10 ? 6 : 3),
          {
            format: NumberFormat.TOKEN_AMOUNT_LONG,
          }
        ) as string);

  const treasuryShareDisplay = tokenPrice
    ? (formatterUtils.formatNumber(tokenPrice * amount, {
        format: NumberFormat.FIAT_TOTAL_SHORT,
      }) as string)
    : t('finance.unknownUSDValue');

  const explorerURL = CHAIN_METADATA[network].explorer;
  const daoExplorerURL = `${explorerURL}address/${daoAddress}`;

  const recipient = (action.to.ensName ?? action.to.address) as string;
  const recipientURL = `${explorerURL}address/${recipient}`;

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
          to={recipient}
          from={daoLabel}
          fromLinkURL={daoExplorerURL}
          toLinkURL={recipientURL}
          toLabel={t('labels.to')}
          fromLabel={t('labels.from')}
        />
        <CardToken
          tokenName={action.tokenName}
          tokenImageUrl={action.tokenImgUrl}
          tokenSymbol={action.tokenSymbol}
          tokenCount={tokenCountDisplay}
          treasuryShare={treasuryShareDisplay}
          type={'transfer'}
        />
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-neutral-50 rounded-b-xl border border-t-0 border-neutral-100 space-y-6 p-6',
})``;
