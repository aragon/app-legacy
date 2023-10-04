import {useQueries} from '@tanstack/react-query';

/**
 *  This method is a Mock validation function until the real SDK functions are ready
 * @param address dao address
 * @returns an arrea of queries the indicates the status of verifications
 */
export function useUpdateVerification(address: string) {
  // FIXME: remove this function and use the real SDK function
  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  const verificationQueries = [
    {
      queryKey: ['pluginRegistry', address],
      queryFn: () =>
        new Promise(resolve => {
          setTimeout(() => resolve(Boolean(getRandomInt(2))), 5000); // added delay to simulate loading
        }),
      enabled: Boolean(address),
      retry: false,
    },
    {
      queryKey: ['pluginSetupProcessor', address],
      queryFn: () =>
        new Promise(resolve => {
          setTimeout(() => resolve(Boolean(getRandomInt(2))), 5000); // added delay to simulate loading
        }),
      enabled: Boolean(address),
      retry: false,
    },
  ];

  return useQueries({
    queries: verificationQueries.map(config => {
      return {
        ...config,
      };
    }),
  });
}
