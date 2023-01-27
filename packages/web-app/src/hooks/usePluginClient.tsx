import {
  ContextPlugin,
  MultisigClient,
  TokenVotingClient,
} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {useClient} from './useClient';

export type PluginTypes =
  | 'token-voting.plugin.dao.eth'
  | 'multisig.plugin.dao.eth';

type PluginType<T> = T extends 'token-voting.plugin.dao.eth'
  ? TokenVotingClient
  : T extends 'multisig.plugin.dao.eth'
  ? MultisigClient
  : never;

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
          setPluginClient(
            new MultisigClient(ContextPlugin.fromContext(context))
          );
          break;
        case 'token-voting.plugin.dao.eth':
          setPluginClient(
            new TokenVotingClient(ContextPlugin.fromContext(context))
          );
          break;
        default:
          throw new Error('The requested plugin type is invalid');
      }
    }
  }, [client, context, pluginType]);

  return pluginClient as PluginType<T>;
};
