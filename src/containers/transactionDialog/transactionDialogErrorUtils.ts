import {
  SendTransactionErrorType,
  WaitForTransactionReceiptErrorType,
} from '@wagmi/core';

class TransactionDialogErrorUtils {
  private defaultMessage = 'transactionDialog.error.default';

  private errors = [
    {
      pattern: /User rejected the request/,
      message: 'transactionDialog.error.rejected',
    },
  ];

  parseError = (
    error?: SendTransactionErrorType | WaitForTransactionReceiptErrorType | null
  ): string | undefined => {
    if (!error) {
      return undefined;
    }

    const parsedError = this.errors.find(handledError =>
      handledError.pattern.test(error.message)
    );

    return parsedError?.message ?? this.defaultMessage;
  };
}

export const transactionDialogErrorUtils = new TransactionDialogErrorUtils();
