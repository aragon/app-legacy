import {
  ButtonText,
  IconChevronRight,
  IconFinance,
  ListItemHeader,
  StateEmpty,
  TransferListItem,
} from '@aragon/ui-components';
import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useNavigate, generatePath} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {AllTransfers} from 'utils/paths';
import {useGlobalModalContext} from 'context/globalModals';
import {useTransactionDetailContext} from 'context/transactionDetail';
import {Transfer} from 'utils/types';
import {abbreviateTokenAmount} from 'utils/tokens';

type Props = {
  dao: string;
  transfers: Transfer[];
  totalAssetValue: number;
};

const TreasurySnapshot: React.FC<Props> = ({
  dao,
  transfers,
  totalAssetValue,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {handleTransferClicked} = useTransactionDetailContext();

  if (transfers.length === 0) {
    return (
      <StateEmpty
        type="Human"
        mode="card"
        body={'correct'}
        expression={'surprised'}
        hair={'cool'}
        sunglass={'thuglife'}
        title={t('dashboard.emptyTransfers.title')}
        description={t('dashboard.emptyTransfers.description')}
        primaryButton={{
          label: t('dashboard.emptyTransfers.buttonLabel'),
          onClick: () => open(),
        }}
        renderHtml
      />
    );
  }

  return (
    <Container>
      <ListItemHeader
        icon={<IconFinance />}
        value={new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(totalAssetValue)}
        label={t('labels.treasuryValue')}
        buttonText={t('allTransfer.newTransfer')}
        orientation="vertical"
        onClick={() => open()}
      />
      {transfers.slice(0, 3).map(({tokenAmount, ...rest}) => (
        <TransferListItem
          key={rest.id}
          tokenAmount={abbreviateTokenAmount(tokenAmount)}
          {...rest}
          onClick={() => handleTransferClicked({tokenAmount, ...rest})}
        />
      ))}
      <ButtonText
        mode="secondary"
        size="large"
        iconRight={<IconChevronRight />}
        label={t('labels.seeAll')}
        onClick={() => navigate(generatePath(AllTransfers, {network, dao}))}
      />
    </Container>
  );
};

export default TreasurySnapshot;

const Container = styled.div.attrs({
  className: 'space-y-1.5 desktop:space-y-2',
})``;
