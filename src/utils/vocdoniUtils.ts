/**
 * Theoretically, all errors from the SDK should be returned as strings, but this is not true
 * for any error coming from the signer (which is, in part, coming from the SDK). That's why
 * we need to properly cast them to strings. Note we're not using error instanceof Error because
 * it just not works for many signer errors.
 *
 * @param {Error|string} error The error to be casted
 * @returns {string}
 */
export const errorToString = (error: Error | string): string => {
  if (typeof error !== 'string' && 'message' in error) {
    return error.message;
  }

  return error;
};
