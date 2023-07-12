import React, {createContext, useCallback, useState} from 'react';

import {Transfer} from 'utils/types';

const TransactionDetailContext =
  createContext<TransactionDetailContextType | null>(null);

type TransactionDetailContextType = {
  handleTransferClicked: (transfer: Transfer) => void;
  isOpen: boolean;
  onClose: () => void;
  transfer: Transfer;
};

const TransactionDetailProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer>(
    {} as Transfer
  );
  const [showTransactionDetail, setShowTransactionDetail] =
    useState<boolean>(false);

  const handleTransferClicked = useCallback((transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setShowTransactionDetail(true);
  }, []);

  return (
    <TransactionDetailContext.Provider
      value={{
        handleTransferClicked,
        isOpen: showTransactionDetail,
        transfer: selectedTransfer,
        onClose: () => setShowTransactionDetail(false),
      }}
    >
      {children}
    </TransactionDetailContext.Provider>
  );
};

function useTransactionDetailContext(): TransactionDetailContextType {
  const context = React.useContext(TransactionDetailContext);
  if (context === undefined) {
    throw new Error(
      'useTransactionDetailContext must be used within a TransactionDetailProvider'
    );
  }
  return context as TransactionDetailContextType;
}

export {useTransactionDetailContext, TransactionDetailProvider};
