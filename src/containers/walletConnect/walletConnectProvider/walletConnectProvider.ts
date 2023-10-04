import {createContext, useContext} from 'react';
import {WcInterceptorValues} from './useWalletConnectInterceptor';

export type WalletConnectContextValues = WcInterceptorValues;

const WalletConnectContext = createContext<WalletConnectContextValues | null>(
  null
);

export const WalletConnectContextProvider = WalletConnectContext.Provider;

export const useWalletConnectContext = (): WalletConnectContextValues => {
  const values = useContext(WalletConnectContext);

  if (values == null) {
    throw new Error(
      'useWalletConnectContext: hook must be used inside a WalletConnectContextProvider to work properly'
    );
  }

  return values;
};
