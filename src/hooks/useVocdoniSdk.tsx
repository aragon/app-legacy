import {Signer} from '@ethersproject/abstract-signer';
import React from 'react';
import {useWallet} from './useWallet';
import {ClientProvider} from '@vocdoni/react-providers';

export const UseVocdoniClientProvider: React.FC = ({children}) => {
  const {signer} = useWallet();
  return (
    <ClientProvider env="stg" signer={signer as Signer}>
      {children}
    </ClientProvider>
  );
};

// todo(kon): move this following block somewhere else
export enum OffchainPluginLocalStorageKeys {
  PROPOSAL_TO_ELECTION = 'PROPOSAL_TO_ELECTION',
}

export interface ProposalToElection {
  [key: string]: {
    // The key is the proposal id
    electionId: string;
  };
}
export interface OffchainPluginLocalStorageTypes {
  [OffchainPluginLocalStorageKeys.PROPOSAL_TO_ELECTION]: ProposalToElection;
}
// todo(kon): move this previous block somewehere else
