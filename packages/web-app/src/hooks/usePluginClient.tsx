import {useClient} from './useClient';
import {
  ContextPlugin,
  Context,
  ClientErc20,
  ClientAddressList,
} from '@aragon/sdk-client';
import {Address} from '@aragon/ui-components/dist/utils/addresses';

type ClientTypes = 'ERC20' | 'Whitelist';

/**
 * This hook can be used to build ERC20 or whitelist clients
 * @method createErc20 By passing instance plugin address will create an ERC20Client
 * @method createWhitelist By passing instance plugin address will create an WhitelistClient
 * @returns The corresponding Client
 */

export const usePluginClient = (
  type: ClientTypes,
  pluginAddress: Address
): ClientErc20 | ClientAddressList | Error => {
  const {client, context} = useClient();

  if (!client || !context) {
    return new Error('SDK client is not initialized correctly');
  }

  if (type === 'ERC20') {
    const contextPlugin: ContextPlugin = ContextPlugin.fromContext(
      context as Context,
      pluginAddress
    );
    const clientERC20: ClientErc20 = new ClientErc20(contextPlugin);

    return clientERC20;
  } else if (type === 'Whitelist') {
    const contextPlugin: ContextPlugin = ContextPlugin.fromContext(
      context as Context,
      pluginAddress
    );

    const createWhitelist: ClientAddressList = new ClientAddressList(
      contextPlugin
    );

    return createWhitelist;
  } else {
    return new Error('The requested sdk type is invalid');
  }
};
