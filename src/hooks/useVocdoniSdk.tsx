import {Signer} from '@ethersproject/abstract-signer';
import React, {PropsWithChildren} from 'react';
import {useWallet} from './useWallet';
import {ClientProvider} from '@vocdoni/react-providers';
import {EnvOptions} from '@vocdoni/sdk';

// todo(kon): move this to be set by .env file
export const VocdoniEnv: EnvOptions = EnvOptions.STG;

export const VocdoniClientProvider = ({children}: PropsWithChildren) => {
  const {signer} = useWallet();
  return (
    <ClientProvider env={VocdoniEnv} signer={signer as Signer}>
      {children}
    </ClientProvider>
  );
};
