import React, {ReactNode} from 'react';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {ModalProps} from '@aragon/ods-old';
import {AlertInline, Button, IconType, IllustrationObject} from '@aragon/ods';
import {IUseSendTransactionResult} from 'hooks/useSendTransaction';
import {transactionDialogErrorUtils} from './transactionDialogErrorUtils';
import {useAccount, useChains} from 'wagmi';
import {useTranslation} from 'react-i18next';

export interface ITransactionDialogProps extends ModalProps {
  /**
   * Result of the send-transaction hook.
   */
  sendTransactionResult: IUseSendTransactionResult;
  /**
   * Label of the button when the transaction is ready to be sent.
   * @default "transactionDialog.button.approve"
   */
  sendTransactionLabel?: string;
  /**
   * Displays the transaction status button and alerts when set to true.
   */
  displayTransactionStatus?: boolean;
  /**
   * Only render the transaction status component when set to true.
   * @default true
   */
  onlyTransactionStatus?: boolean;
  /**
   * Button displayed on transaction success
   */
  successButton: {label: string; onClick: () => void};
  /**
   * Children of the component, only displayed when displayTransactionStatus is not set or set to false.
   */
  children?: ReactNode;
}

export const TransactionDialog: React.FC<ITransactionDialogProps> = props => {
  const {
    children,
    sendTransactionResult,
    displayTransactionStatus,
    onlyTransactionStatus = true,
    successButton,
    sendTransactionLabel = 'transactionDialog.button.approve',
    onClose,
    ...otherProps
  } = props;

  const chains = useChains();
  const {chain} = useAccount();
  const {t} = useTranslation();

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
    ? 'transactionDialog.button.preparing'
    : isSendTransactionLoading
    ? 'transactionDialog.button.waitingApproval'
    : 'transactionDialog.button.waitingConfirmations';

  const errorButtonLabel = isSendTransactionError
    ? 'transactionDialog.button.resend'
    : 'transactionDialog.button.retry';

  const idleButtonLabel =
    isEstimateGasError && !isLoading
      ? 'transactionDialog.button.proceed'
      : sendTransactionLabel;

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

  const hideChildren = onlyTransactionStatus && displayTransactionStatus;

  return (
    <ModalBottomSheetSwitcher onClose={onCloseDialog} {...otherProps}>
      <div className="flex flex-col items-center gap-2 text-center">
        <IllustrationObject object="WALLET" className="w-40" />
        <div className="flex flex-col gap-3">
          <p className="text-xl font-semibold text-neutral-800">
            {t('transactionDialog.title')}
          </p>
          <p className="text-sm font-normal text-neutral-600">
            {t('transactionDialog.description')}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 px-4 py-6">
        {!hideChildren && children}
        {displayTransactionStatus && (
          <>
            <Button
              isLoading={isLoading}
              onClick={buttonAction}
              className="self-stretch"
            >
              {t(buttonLabel)}
            </Button>
            {longWaitingTime && isLoading && (
              <AlertInline
                message={t('transactionDialog.warning.slowTransaction')}
                variant="warning"
              />
            )}
            {isEstimateGasError && !isLoading && (
              <AlertInline
                message={t('transactionDialog.warning.gasEstimation')}
                variant="warning"
              />
            )}
            {isSendTransactionError && errorMessage && !isLoading && (
              <AlertInline message={t(errorMessage)} variant="critical" />
            )}
            {isSuccess && (
              <Button
                href={transactionLink}
                target="_blank"
                variant="tertiary"
                className="self-stretch"
                iconRight={IconType.LINK_EXTERNAL}
              >
                {t('transactionDialog.link.transaction')}
              </Button>
            )}
          </>
        )}
      </div>
    </ModalBottomSheetSwitcher>
  );
};
