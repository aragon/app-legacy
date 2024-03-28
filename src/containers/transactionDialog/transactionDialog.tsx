import React from 'react';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {ModalProps} from '@aragon/ods-old';
import {AlertInline, Button, IllustrationObject} from '@aragon/ods';
import {IUseSendTransactionResult} from 'hooks/useSendTransaction';

export interface ITransactionDialogProps extends ModalProps {
  /**
   * Result of the send-transaction hook.
   */
  sendTransactionResult: IUseSendTransactionResult;
  /**
   * Displays the transaction status button and alerts when set to true.
   */
  displayTransactionStatus?: boolean;
  /**
   * Button displayed on transaction success
   */
  successButton: {label: string; onClick: () => void};
}

export const TransactionDialog: React.FC<ITransactionDialogProps> = props => {
  const {
    children,
    sendTransactionResult,
    displayTransactionStatus,
    successButton,
    ...otherProps
  } = props;

  const {
    isEstimateGasError,
    isEstimateGasLoading,
    isSendTransactionError,
    isSendTransactionLoading,
    isWaitTransactionLoading,
    isWaitTransactionError,
    isSuccess,
    sendTransaction,
  } = sendTransactionResult;

  const isLoading =
    isEstimateGasLoading ||
    isSendTransactionLoading ||
    isWaitTransactionLoading;

  const isError = isSendTransactionError || isWaitTransactionError;

  const loadingButtonLabel = isEstimateGasLoading
    ? 'Preparing transaction'
    : isSendTransactionLoading
    ? 'Awaiting approval'
    : 'Awaiting confirmations';

  const errorButtonLabel = isSendTransactionError
    ? 'Resend to wallet'
    : 'Retry';

  const idleButtonLabel =
    isEstimateGasError && !isLoading ? 'Proceed anyway' : 'Approve transaction';

  const buttonLabel = isLoading
    ? loadingButtonLabel
    : isError
    ? errorButtonLabel
    : isSuccess
    ? successButton.label
    : idleButtonLabel;

  const buttonAction = isSuccess ? successButton.onClick : sendTransaction;

  return (
    <ModalBottomSheetSwitcher {...otherProps}>
      <IllustrationObject object="WALLET" />
      <p className="text-xl font-semibold text-neutral-800">
        Transaction required
      </p>
      <p className="text-sm font-normal text-neutral-600">
        You will need to sign a transaction in your connected wallet.
      </p>
      <div className="px-4 py-6">
        {!displayTransactionStatus && children}
        {displayTransactionStatus && (
          <>
            <Button isLoading={isLoading} onClick={buttonAction}>
              {buttonLabel}
            </Button>
            {isEstimateGasError && !isLoading && (
              <AlertInline
                message="Unable to estimate gas. This transaction may fail"
                variant="warning"
              />
            )}
          </>
        )}
      </div>
    </ModalBottomSheetSwitcher>
  );
};
