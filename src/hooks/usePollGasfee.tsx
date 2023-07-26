import {constants} from 'ethers';
import {useCallback, useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {GasFeeEstimation} from '@aragon/sdk-client-common';
import {useTokenPrice} from 'services/token/queries/use-token-price';

/**
 * This hook returns the gas estimation for a particular transaction and
 * the price of the native token in USD
 *
 * NOTE: Due to what is assumed to be temporary design changes, this hook
 * does not yet poll for the gas fees on interval
 *
 * @param estimationFunction function that estimates gas fee
 * @returns the average and maximum gas fee estimations, native token price
 * in USD, an error object if an error occurred while estimating,
 * and a function to stop the interval polling
 */
export const usePollGasFee = (
  estimationFunction: () => Promise<GasFeeEstimation | undefined>,
  shouldPoll = true
) => {
  const {network} = useNetwork();
  const [error, setError] = useState<Error | undefined>();
  const [maxFee, setMaxFee] = useState<BigInt | undefined>(BigInt(0));
  const [averageFee, setAverageFee] = useState<BigInt | undefined>(BigInt(0));

  const {data: tokenPrice = 0} = useTokenPrice(
    {
      address: constants.AddressZero,
      network,
    },
    {enabled: shouldPoll}
  );

  // estimate gas for DAO creation
  useEffect(() => {
    async function getFeesAndPrice() {
      try {
        const estimation = await estimationFunction();
        setMaxFee(estimation?.max);
        setAverageFee(estimation?.average);
        setError(undefined);
      } catch (err) {
        setError(err as Error);
        setMaxFee(undefined);
        setAverageFee(undefined);
        console.log('Error fetching gas fees and price', err);
      }
    }

    if (shouldPoll) getFeesAndPrice();
  }, [estimationFunction, network, shouldPoll]);

  // stop polling in anticipation for polling at interval
  const stopPolling = useCallback(() => {
    setMaxFee(BigInt(0));
    setAverageFee(BigInt(0));
  }, []);
  return {error, tokenPrice, maxFee, averageFee, stopPolling};
};
