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

export const retry = async <TReturn>(
  request: () => TReturn,
  options?: IRetryOptions
) => {
  const {times = 3, timeout = 1_000} = options ?? {};

  let attempts = 0;
  let lastError: unknown;

  const wait = (millis: number) =>
    new Promise(resolve => {
      setTimeout(() => resolve(true), millis);
    });

  while (attempts < times) {
    await wait(attempts * timeout);

    try {
      const result = await request();

      return result;
    } catch (error: unknown) {
      lastError = error;
      attempts = attempts + 1;
    }
  }

  throw lastError;
};
