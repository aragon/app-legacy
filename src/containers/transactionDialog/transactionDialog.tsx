import React from 'react';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {ModalProps} from '@aragon/ods-old';
import {AlertInline, Button, IconType, IllustrationObject} from '@aragon/ods';
import {IUseSendTransactionResult} from 'hooks/useSendTransaction';
import {transactionDialogErrorUtils} from './transactionDialogErrorUtils';
import {useAccount, useChains} from 'wagmi';

export interface ITransactionDialogProps extends ModalProps {
  /**
   * Result of the send-transaction hook.
   */
  sendTransactionResult: IUseSendTransactionResult;
  /**
   * Label of the button when the transaction is ready to be sent.
   * @default "Approve transaction"
   */
  sendTransactionLabel?: string;
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
    sendTransactionLabel = 'Approve transaction',
    onClose,
    ...otherProps
  } = props;

  const chains = useChains();
  const {chain} = useAccount();

  const {
    isEstimateGasError,
    isEstimateGasLoading,
    isSendTransactionError,
    isSendTransactionLoading,
    isWaitTransactionLoading,
    isWaitTransactionError,
    isSuccess,
    sendTransactionError,
    sendTransaction,
    txHash,
    longWaitingTime,
  } = sendTransactionResult;

  const isLoading =
    isEstimateGasLoading ||
    isSendTransactionLoading ||
    isWaitTransactionLoading;

  const isError = isSendTransactionError || isWaitTransactionError;
  const errorMessage =
    transactionDialogErrorUtils.parseError(sendTransactionError);

  const loadingButtonLabel = isEstimateGasLoading
    ? 'Preparing transaction'
    : isSendTransactionLoading
    ? 'Awaiting approval'
    : 'Awaiting confirmations';

  const errorButtonLabel = isSendTransactionError
    ? 'Resend to wallet'
    : 'Retry';

  const idleButtonLabel =
    isEstimateGasError && !isLoading ? 'Proceed anyway' : sendTransactionLabel;

  const buttonLabel = isLoading
    ? loadingButtonLabel
    : isError
    ? errorButtonLabel
    : isSuccess
    ? successButton.label
    : idleButtonLabel;

  const buttonAction = isSuccess ? successButton.onClick : sendTransaction;

  const blockExplorer = chains.find(({id}) => id === chain?.id)?.blockExplorers
    ?.default.url;
  const transactionLink = `${blockExplorer}/tx/${txHash}`;

  // Hide the close button by setting the onClose callback to undefined when
  // waiting for the transaction to be confirmed
  const onCloseDialog = isWaitTransactionLoading ? undefined : onClose;

  return (
    <ModalBottomSheetSwitcher onClose={onCloseDialog} {...otherProps}>
      <div className="flex flex-col items-center gap-2 text-center">
        <IllustrationObject object="WALLET" className="w-40" />
        <div className="flex flex-col gap-3">
          <p className="text-xl font-semibold text-neutral-800">
            Transaction required
          </p>
          <p className="text-sm font-normal text-neutral-600">
            You will need to sign a transaction in your connected wallet.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 px-4 py-6">
        {!displayTransactionStatus && children}
        {displayTransactionStatus && (
          <>
            <Button
              isLoading={isLoading}
              onClick={buttonAction}
              className="self-stretch"
            >
              {buttonLabel}
            </Button>
            {longWaitingTime && isLoading && (
              <AlertInline
                message="Transaction is taking longer than expected"
                variant="warning"
              />
            )}
            {isEstimateGasError && !isLoading && (
              <AlertInline
                message="Unable to estimate gas. This transaction may fail"
                variant="warning"
              />
            )}
            {isSendTransactionError && errorMessage && !isLoading && (
              <AlertInline message={errorMessage} variant="critical" />
            )}
            {isSuccess && (
              <Button
                href={transactionLink}
                target="_blank"
                variant="tertiary"
                className="self-stretch"
                iconRight={IconType.LINK_EXTERNAL}
              >
                See transaction
              </Button>
            )}
          </>
        )}
      </div>
    </ModalBottomSheetSwitcher>
  );
};
