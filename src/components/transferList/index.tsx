import {TransferListItem} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {abbreviateTokenAmount, shortenLongTokenSymbol} from 'utils/tokens';
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

  if (transfers.length === 0)
    return <p data-testid="transferList">{t('allTransfer.noTransfers')}</p>;

  return (
    <div className="space-y-4" data-testid="transferList">
      {transfers.map(({tokenAmount, tokenSymbol, ...rest}, index) => (
        <TransferListItem
          // TODO: This is not a stable key and will be slow when sort/filtering.
          // The SDK should return a unique id
          key={`${rest.id}-${index}`}
          tokenAmount={abbreviateTokenAmount(tokenAmount)}
          tokenSymbol={shortenLongTokenSymbol(tokenSymbol)}
          {...rest}
          onClick={() => {
            onTransferClick({tokenAmount, tokenSymbol, ...rest});
          }}
        />
      ))}
    </div>
  );
};

export default TransferList;
