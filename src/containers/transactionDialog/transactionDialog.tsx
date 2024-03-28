import React from 'react';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {ModalProps} from '@aragon/ods-old';
import {IllustrationObject} from '@aragon/ods';

export interface ITransactionDialogProps extends ModalProps {}

export const TransactionDialog: React.FC<ITransactionDialogProps> = props => {
  const {children, ...otherProps} = props;

  return (
    <ModalBottomSheetSwitcher {...otherProps}>
      <IllustrationObject object="WALLET" />
      <p className="text-xl font-semibold text-neutral-800">
        Transaction required
      </p>
      <p className="text-sm font-normal text-neutral-600">
        You will need to sign a transaction in your connected wallet.
      </p>
      <div className="px-4 py-6">{children}</div>
    </ModalBottomSheetSwitcher>
  );
};
