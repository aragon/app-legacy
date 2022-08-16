import {useCache} from './useCache';
import {useClient} from './useClient';
import {
  ContextPlugin,
  Context,
  ClientErc20,
  ClientAddressList,
} from '@aragon/sdk-client';
import {Dao} from 'utils/types';
import {Address} from '@aragon/ui-components/dist/utils/addresses';

interface IUseDaoResponse {
  createErc20: (pluginAddress: Address) => ClientErc20 | Error;
  createWhitelist: (pluginAddress: Address) => ClientAddressList | Error;
}

export const useDao = (): IUseDaoResponse => {
  const {set: setCache} = useCache();
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
