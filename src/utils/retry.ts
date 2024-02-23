export interface IRetryOptions {
  /**
   * Number of times to retry the given request.
   * @default 3
   */
  times?: number;
  /**
   * Incremental timeout in milliseconds to wait after each requests calculated as (attempts * timeout);
   * @default 1000
   */
  timeout: number;
}

/**
 * Note: functionality introduced as a quick fix to retry the IPFS actions, to be removed with APP-2919
 */
export const retry = async <TReturn>(
  request: () => TReturn,
  options?: IRetryOptions
) => {
  const {times = 3, timeout = 1_000} = options ?? {};

  let attempts = 0;
  let lastError: unknown;

  const wait = (millis: number) =>
    new Promise(resolve => {
      setTimeout(resolve, millis);
    });

  while (attempts < times) {
    await wait(attempts * timeout);

    try {
      const result = await Promise.race([
        request(),
        new Promise((_resolve, reject) =>
          setTimeout(() => reject(new Error('request timeout')), 6_000)
        ),
      ]);

      return result as TReturn;
    } catch (error) {
      lastError = error;
      attempts++;
    }
  }

  throw lastError;
};
