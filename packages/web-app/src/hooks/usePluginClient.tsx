import {
  ClientAddressList,
  ClientErc20,
  ContextPlugin,
} from '@aragon/sdk-client';
import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {useMemo} from 'react';

import {useClient} from './useClient';

export type PluginTypes = 'erc20voting.dao.eth' | 'addresslistvoting.dao.eth';

/**
 * This hook can be used to build ERC20 or whitelist clients
 * @method createErc20 By passing instance plugin address will create an ERC20Client
 * @method createWhitelist By passing instance plugin address will create an WhitelistClient
 * @returns The corresponding Client
 */

export const usePluginClient = (
  type: PluginTypes,
  pluginAddress: Address
): ClientErc20 | ClientAddressList | undefined => {
  const {client, context} = useClient();

  if (!client || !context) {
    throw new Error('SDK client is not initialized correctly');
  }

  const pluginClient = useMemo(() => {
    if (!pluginAddress) return;

    switch (type) {
      case 'erc20voting.dao.eth':
        return new ClientErc20(
          ContextPlugin.fromContext(context, pluginAddress)
        );
      case 'addresslistvoting.dao.eth':
        return new ClientAddressList(
          ContextPlugin.fromContext(context, pluginAddress)
        );

      default:
        throw new Error('The requested sdk type is invalid');
    }
  }, [context, pluginAddress, type]);

  return pluginClient;
};
