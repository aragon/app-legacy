import {JsonRpcProvider} from '@ethersproject/providers';
import React, {ReactNode, createContext, useContext, useMemo} from 'react';
import {useNetwork} from './network';
import {aragonGateway} from 'utils/aragonGateway';

export interface IProvidersContext {
  api: JsonRpcProvider;
}

const ProvidersContext = createContext<IProvidersContext | null>(null);

export const ProvidersContextProvider = (props: {children: ReactNode}) => {
  const {network} = useNetwork();
  const apiProvider = aragonGateway.getRpcProvider(network);

  if (apiProvider == null) {
    throw new Error('ProvidersContextProvider: unsupported chain');
  }

  const contextValue = useMemo(() => ({api: apiProvider}), [apiProvider]);

  return (
    <ProvidersContext.Provider value={contextValue}>
      {props.children}
    </ProvidersContext.Provider>
  );
};

export const useProviders = (): IProvidersContext => {
  const context = useContext(ProvidersContext);

  if (context == null) {
    throw new Error(
      'useProviders: hook must be used within a ProvidersContextProvider'
    );
  }

  return context;
};
