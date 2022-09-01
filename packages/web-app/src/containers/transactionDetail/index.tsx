import {
  ButtonIcon,
  CardText,
  CardToken,
  CardTransfer,
  IconClose,
  IconLinkExternal,
  ListItemAction,
} from '@aragon/ui-components';
import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {useNetwork} from 'context/network';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {CHAIN_METADATA, TransferTypes} from 'utils/constants';
import {abbreviateTokenAmount} from 'utils/tokens';
import {useTransactionDetailContext} from 'context/transactionDetail';

type TransactionDetailProps = {
  daoName: string;
};

const TransactionDetail: React.FC<TransactionDetailProps> = ({daoName}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const {isOpen, transfer, onClose} = useTransactionDetailContext();

  const transactionUrl = `
    ${CHAIN_METADATA[network].explorer}tx/${transfer.transaction}`;

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <Title>{t('transactionDetail.title')}</Title>
        <ButtonIcon
          mode="secondary"
          size="small"
          bgWhite
          icon={<IconClose />}
          onClick={onClose}
        />
      </ModalHeader>

      <Content>
        <CardTransfer
          {...(transfer.transferType === TransferTypes.Deposit
            ? {to: daoName, from: transfer.sender}
            : {to: transfer.to, from: daoName})}
          toLabel={t('labels.to')}
          fromLabel={t('labels.from')}
        />
        <CardToken
          type="transfer"
          tokenName={transfer.tokenName}
          tokenCount={`${
            transfer.transferType === TransferTypes.Deposit ? '+' : '-'
          } ${abbreviateTokenAmount(transfer.tokenAmount)}`}
          tokenSymbol={transfer.tokenSymbol}
          tokenImageUrl={transfer.tokenImgUrl}
          treasuryShare={transfer.usdValue}
        />
        {transfer.reference && (
          <CardText
            type="label"
            title={t('labels.reference')}
            content={transfer.reference}
          />
        )}

        <div>
          <a href={transactionUrl} target="_blank" rel="noreferrer">
            <ListItemAction
              title={t('transactionDetail.viewTransaction')}
              iconRight={<IconLinkExternal />}
            />
          </a>
        </div>
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default TransactionDetail;

const ModalHeader = styled.div.attrs({
  className:
    'flex items-center space-between h-10 gap-x-3 p-2 bg-ui-0 rounded-xl sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Content = styled.div.attrs({className: 'p-3 space-y-1.5'})`
  max-width: 448px;
`;

const Title = styled.p.attrs({
  className: 'flex-1 text-ui-800 font-bold',
})``;
