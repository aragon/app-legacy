import {MultisigClient, TokenVotingClient} from '@aragon/sdk-client';
import {
  GaslessVotingClient,
  GaslessVotingContext,
} from '@vocdoni/gasless-voting';
import {useEffect, useState} from 'react';

import {useClient} from './useClient';
import {VocdoniEnv} from './useVocdoniSdk';
import {CENSUS3_URL} from './useCensus3';

export const GaslessPluginName =
  'vocdoni-gasless-voting-poc-vanilla-erc20.plugin.dao.eth';
export type GaslessPluginType = typeof GaslessPluginName;

export type PluginTypes =
  | 'token-voting.plugin.dao.eth'
  | 'multisig.plugin.dao.eth'
  | GaslessPluginType;

type PluginType<T> = T extends 'token-voting.plugin.dao.eth'
  ? TokenVotingClient
  : T extends 'multisig.plugin.dao.eth'
  ? MultisigClient
  : T extends GaslessPluginType
  ? GaslessVotingClient
  : never;

export type PluginClient =
  | TokenVotingClient
  | MultisigClient
  | GaslessVotingClient;

export function isTokenVotingClient(
  client: PluginClient
): client is TokenVotingClient {
  if (!client || Object.keys(client).length === 0) return false;
  return client instanceof TokenVotingClient;
}

export function isMultisigClient(
  client: PluginClient
): client is MultisigClient {
  if (!client || Object.keys(client).length === 0) return false;
  return client instanceof MultisigClient;
}

export function isGaslessVotingClient(
  client: PluginClient
): client is GaslessVotingClient {
  if (!client || Object.keys(client).length === 0) return false;
  return client instanceof GaslessVotingClient;
}

/**
 * This hook can be used to build ERC20 or whitelist clients
 * @param pluginType Type of plugin for which a client is to be built. Note that
 * this is information that must be fetched. I.e., it might be unavailable on
 * first render. Therefore, it is typed as potentially undefined.
 * @returns The corresponding Client
 */
export const usePluginClient = <T extends PluginTypes = PluginTypes>(
  pluginType?: T
): PluginType<T> | undefined => {
  const [pluginClient, setPluginClient] = useState<PluginType<PluginTypes>>();

  const {client, context} = useClient();

  useEffect(() => {
    if (!client || !context) return;

    if (!pluginType) {
      setPluginClient(undefined);
    } else {
      switch (pluginType as PluginTypes) {
        case 'multisig.plugin.dao.eth':
          setPluginClient(new MultisigClient(context));
          break;
        case 'token-voting.plugin.dao.eth':
          setPluginClient(new TokenVotingClient(context));
          break;
        case GaslessPluginName:
          setPluginClient(
            new GaslessVotingClient(
              new GaslessVotingContext(context),
              VocdoniEnv,
              CENSUS3_URL
            )
          );
          break;
        default:
          throw new Error('The requested plugin type is invalid');
      }
    }
  }, [client, context, pluginType]);

  return pluginClient as PluginType<T>;
};
