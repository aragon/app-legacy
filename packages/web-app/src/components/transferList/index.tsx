import {TransferListItem} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {trackEvent} from 'services/analytics';
import {abbreviateTokenAmount} from 'utils/tokens';
import {Transfer} from 'utils/types';

type TransferListProps = {
  transfers: Array<Transfer>;
  onTransferClick: (transfer: Transfer) => void;
};

const TransferList: React.FC<TransferListProps> = ({
  transfers,
  onTransferClick,
}) => {
  const {t} = useTranslation();
  const {dao} = useParams();

  if (transfers.length === 0)
    return <p data-testid="transferList">{t('allTransfer.noTransfers')}</p>;

  return (
    <div className="space-y-2" data-testid="transferList">
      {transfers.map(({tokenAmount, ...rest}, index) => (
        <TransferListItem
          // TODO: This is not a stable key and will be slow when sort/filtering.
          // The SDK should return a unique id
          key={`${rest.id}-${index}`}
          tokenAmount={abbreviateTokenAmount(tokenAmount)}
          {...rest}
          onClick={() => {
            trackEvent('finance_transactionDetails_clicked', {
              transaction_hash: rest.id,
              dao_address: dao,
            });
            onTransferClick({tokenAmount, ...rest});
          }}
        />
      ))}
    </div>
  );
};

export default TransferList;
