import {
  ClientAddressList,
  TokenVotingClient,
  ContextPlugin,
} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {useClient} from './useClient';

export type PluginTypes = 'erc20voting.dao.eth' | 'addresslistvoting.dao.eth';

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
): TokenVotingClient | ClientAddressList | undefined => {
  const [pluginClient, setPluginClient] = useState<
    TokenVotingClient | ClientAddressList | undefined
  >(undefined);
  const {client, context} = useClient();

  useEffect(() => {
    if (!client || !context) {
      // throw new Error('SDK client is not initialized correctly');
      return;
    }

    if (!pluginType) setPluginClient(undefined);
    else {
      switch (pluginType) {
        case 'erc20voting.dao.eth':
          setPluginClient(
            new TokenVotingClient(ContextPlugin.fromContext(context))
          );
          break;
        case 'addresslistvoting.dao.eth':
          setPluginClient(
            new ClientAddressList(ContextPlugin.fromContext(context))
          );
          break;
        default:
          throw new Error('The requested sdk type is invalid');
      }
    }
  }, [client, context, pluginType]);

  return pluginClient;
};
