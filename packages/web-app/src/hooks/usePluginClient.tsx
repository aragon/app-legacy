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

type PluginClientTypes = MultisigClient | TokenVotingClient | undefined;
/**
 * This hook can be used to build ERC20 or whitelist clients
 * @param pluginType Type of plugin for which a client is to be built. Note that
 * this is information that must be fetched. I.e., it might be unavailable on
 * first render. Therefore, it is typed as potentially undefined.
 * @method createErc20 By passing instance plugin address will create an
 * ERC20Client
 * @method createWhitelist By passing instance plugin address will create an
 * WhitelistClient
 * @returns The corresponding Client
 */
export const usePluginClient = (
  pluginType?: PluginTypes
): PluginClientTypes => {
  const [pluginClient, setPluginClient] =
    useState<PluginClientTypes>(undefined);
  const {client, context} = useClient();

  useEffect(() => {
    if (!client || !context) {
      // throw new Error('SDK client is not initialized correctly');
      return;
    }

    if (!pluginType) setPluginClient(undefined);
    else {
      switch (pluginType) {
        case 'token-voting.plugin.dao.eth':
          setPluginClient(
            new TokenVotingClient(ContextPlugin.fromContext(context))
          );
          break;
        case 'multisig.plugin.dao.eth':
          setPluginClient(
            new MultisigClient(ContextPlugin.fromContext(context))
          );
          break;
        default:
          throw new Error('The requested sdk type is invalid');
      }
    }
  }, [client, context, pluginType]);

  return pluginClient;
};
