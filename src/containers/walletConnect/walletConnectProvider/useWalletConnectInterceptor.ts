import {useNetwork} from 'context/network';
import {useCallback, useState, useEffect} from 'react';
import {PairingTypes, SessionTypes} from '@walletconnect/types';

import {walletConnectInterceptor} from 'services/walletConnectInterceptor';
import {CHAIN_METADATA, SUPPORTED_CHAIN_ID} from 'utils/constants';
import {Web3WalletTypes} from '@walletconnect/web3wallet';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';

export type WcSession = SessionTypes.Struct;
export type WcActionRequest =
  Web3WalletTypes.SessionRequest['params']['request'];

export type WcConnectOptions = {
  uri: string;
  onError?: (e: Error) => void;
};

export type WcInterceptorValues = {
  wcConnect: (
    options: WcConnectOptions
  ) => Promise<PairingTypes.Struct | undefined>;
  wcDisconnect: (topic: string) => Promise<void>;
  sessions: WcSession[];
  activeSessions: WcSession[];
  actions: WcActionRequest[];
};

export function useWalletConnectInterceptor(): WcInterceptorValues {
  const {network} = useNetwork();

  const {data: daoDetails} = useDaoDetailsQuery();
  const [sessions, setSessions] = useState<WcSession[]>(
    walletConnectInterceptor.getActiveSessions(daoDetails?.address)
  );
  const activeSessions = sessions.filter(session => session.acknowledged);

  const [actions, setActions] = useState<WcActionRequest[]>([]);

  const updateActiveSessions = useCallback(() => {
    const newSessions = walletConnectInterceptor.getActiveSessions(
      daoDetails?.address
    );

    setSessions(newSessions);
  }, [daoDetails?.address]);

  const wcConnect = useCallback(async ({onError, uri}: WcConnectOptions) => {
    try {
      const connection = await walletConnectInterceptor.connect(uri);

      return connection;
    } catch (e) {
      onError?.(e as Error);
    }
  }, []);

  const wcDisconnect = useCallback(
    async (topic: string) => {
      try {
        await walletConnectInterceptor.disconnect(topic);
        updateActiveSessions();
      } catch (e) {
        console.error('Error disconnecting the dApp: ', e);
      }
    },
    [updateActiveSessions]
  );

  const handleApprove = useCallback(
    async (data: Web3WalletTypes.SessionProposal) => {
      await walletConnectInterceptor.approveSession(
        data,
        daoDetails?.address as string,
        SUPPORTED_CHAIN_ID
      );

      updateActiveSessions();
    },
    [daoDetails?.address, updateActiveSessions]
  );

  const handleRequest = useCallback(
    (event: Web3WalletTypes.SessionRequest) => {
      if (event.params.chainId === `eip155:${CHAIN_METADATA[network].id}`) {
        setActions(current => current.concat(event.params.request));
      }
    },
    [network]
  );

  // Listen for active-session changes and subscribe / unsubscribe to client changes
  useEffect(() => {
    walletConnectInterceptor.subscribeConnectProposal(handleApprove);
    walletConnectInterceptor.subscribeDisconnect(updateActiveSessions);

    return () => {
      walletConnectInterceptor.unsubscribeConnectProposal(handleApprove);
      walletConnectInterceptor.unsubscribeDisconnect(updateActiveSessions);
    };
  }, [handleApprove, updateActiveSessions]);

  // Always subscribe to the request event as the onActionRequest property might differ
  // between hook instances
  useEffect(() => {
    walletConnectInterceptor.subscribeRequest(handleRequest);

    return () => {
      walletConnectInterceptor.unsubscribeRequest(handleRequest);
    };
  }, [handleRequest]);

  return {wcConnect, wcDisconnect, sessions, activeSessions, actions};
}
