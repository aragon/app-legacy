import {useClient} from './useClient';
import {
  ContextPlugin,
  Context,
  ClientErc20,
  ClientAddressList,
} from '@aragon/sdk-client';
import {Address} from '@aragon/ui-components/dist/utils/addresses';

interface IUseDaoResponse {
  createErc20: (pluginAddress: Address) => ClientErc20 | Error;
  createWhitelist: (pluginAddress: Address) => ClientAddressList | Error;
}

/**
 * This hook can use to build ERC20 or whitelist clients
 * @method createErc20 By passing instance plugin address will create an ERC20Client
 * @method createWhitelist By passing instance plugin address will create an ERC20Client
 * @returns The corresponding Client
 */

export const useDao = (): IUseDaoResponse => {
  const {client, context} = useClient();

  const createErc20 = (pluginAddress: Address): ClientErc20 | Error => {
    if (!client || !context) {
      return new Error('ERC20 SDK client is not initialized correctly');
    }
    const contextPlugin: ContextPlugin = ContextPlugin.fromContext(
      context as Context,
      pluginAddress
    );

    const clientERC20: ClientErc20 = new ClientErc20(contextPlugin);

    return clientERC20;
  };

  const createWhitelist = (
    pluginAddress: Address
  ): ClientAddressList | Error => {
    if (!client || !context) {
      return new Error('ERC20 SDK client is not initialized correctly');
    }
    const contextPlugin: ContextPlugin = ContextPlugin.fromContext(
      context as Context,
      pluginAddress
    );

    const createWhitelist: ClientAddressList = new ClientAddressList(
      contextPlugin
    );

    return createWhitelist;
  };
  return {
    createWhitelist,
    createErc20,
  };
};
