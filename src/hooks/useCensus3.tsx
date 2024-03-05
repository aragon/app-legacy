import {useClient} from '@vocdoni/react-providers';
import {useCallback, useEffect, useState} from 'react';
import {
  GaslessPluginName,
  PluginTypes,
  isGaslessVotingClient,
  usePluginClient,
} from './usePluginClient';
import {ErrTokenAlreadyExists} from '@vocdoni/sdk';
import {useParams} from 'react-router-dom';
import {useProposal} from '../services/aragon-sdk/queries/use-proposal';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';

const CENSUS3_URL = 'https://census3-stg.vocdoni.net/api';

interface IUseCensus3CreateToken {
  chainId: number;
  pluginType?: PluginTypes;
}

export const useCensus3Client = () => {
  const {census3} = useClient();
  census3.url = CENSUS3_URL;
  return census3;
};

/**
 * Hook to know if the actual wallet chain id is supported by the census3 vocdoni service
 */
export const useCensus3SupportedChains = (chainId: number) => {
  const census3 = useCensus3Client();
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    (async () => {
      if (chainId && census3) {
        const supported = (await census3.getSupportedChains())
          .map(chain => chain.chainID)
          .includes(chainId);
        setIsSupported(supported);
      }
    })();
  }, [census3, chainId]);

  return isSupported;
};

export const useCensus3CreateToken = ({
  chainId,
  pluginType,
}: IUseCensus3CreateToken) => {
  const client = usePluginClient(pluginType);
  const census3 = useCensus3Client();
  const isSupported = useCensus3SupportedChains(chainId);

  const createToken = useCallback(
    async (pluginAddress: string, tokenAddress?: string) => {
      if (
        !pluginType ||
        pluginType !== GaslessPluginName ||
        !client ||
        !isGaslessVotingClient(client)
      ) {
        return;
      }

      if (!isSupported) throw Error('ChainId is not supported');
      // Check if the census is already sync
      try {
        if (!tokenAddress) {
          const token = await client?.methods.getToken(pluginAddress);
          if (!token) throw Error('Cannot retrieve the token');
          tokenAddress = token.address;
        }

        await census3.createToken(tokenAddress, 'erc20', chainId, undefined, [
          'aragon',
          'dao',
        ]);
      } catch (e) {
        if (!(e instanceof ErrTokenAlreadyExists)) {
          throw e;
        }
      }
    },
    [census3, chainId, client, isSupported, pluginType]
  );

  return {createToken};
};

// Hook that return census3 census id if is gasless plugin
export const useGaslessCensusId = ({
  pluginType,
  enable = true,
}: {
  pluginType: PluginTypes;
  enable?: boolean;
}) => {
  const {dao, id: proposalId} = useParams();

  const isGasless = pluginType === GaslessPluginName;
  const _enable: boolean = enable && !!dao && !!proposalId && isGasless;

  const {
    data: proposalData,
    isLoading,
    isError,
  } = useProposal(
    {
      pluginType: pluginType,
      id: proposalId ?? '',
    },
    {
      enabled: _enable,
    }
  );

  let censusId: string | null = null;
  let censusSize: number | null = null;
  if (
    _enable &&
    proposalData &&
    (proposalData as GaslessVotingProposal).vochain
  ) {
    const census = (proposalData as GaslessVotingProposal).vochain.metadata
      .census;
    censusId = census.censusId;
    censusSize = census.size;
  }

  return {censusId, censusSize, isLoading, isError};
};
