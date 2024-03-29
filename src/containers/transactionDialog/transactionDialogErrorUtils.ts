import {SendTransactionErrorType} from '@wagmi/core';

class TransactionDialogErrorUtils {
  private defaultMessage = 'Transaction failed';

  private errors = [
    {
      pattern: /User rejected the request/,
      message: 'Transaction rejected by the user.',
    },
  ];

  parseError = (
    error?: SendTransactionErrorType | null
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
