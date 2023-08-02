import {useNetwork} from 'context/network';
import {useCallback, useState, useEffect} from 'react';
import {SessionTypes} from '@walletconnect/types';

import {walletConnectInterceptor} from 'services/walletConnectInterceptor';
import {CHAIN_METADATA, SUPPORTED_CHAIN_ID} from 'utils/constants';
import {Web3WalletTypes} from '@walletconnect/web3wallet';
import {useDaoDetailsQuery} from './useDaoDetails';

export type WcSession = SessionTypes.Struct;
export type WcActionRequest =
  Web3WalletTypes.SessionRequest['params']['request'];

export interface UseWalletConnectInterceptorOptions {
  onActionRequest?: (request: WcActionRequest) => void;
}

export interface WcConnectOptions {
  uri: string;
  onError?: (e: Error) => void;
}

const activeSessionsListeners = new Set<(sessions: WcSession[]) => void>();

export function useWalletConnectInterceptor({
  onActionRequest,
}: UseWalletConnectInterceptorOptions) {
  const {network} = useNetwork();

  const {data: daoDetails} = useDaoDetailsQuery();
  const [sessions, setSessions] = useState<WcSession[]>(
    walletConnectInterceptor.getActiveSessions(daoDetails?.address)
  );
  const activeSessions = sessions.filter(session => session.acknowledged);

  const updateActiveSessions = useCallback(() => {
    const newSessions = walletConnectInterceptor.getActiveSessions(
      daoDetails?.address
    );

    // Update active-sessions for all hook instances
    activeSessionsListeners.forEach(listener => listener(newSessions));
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
        onActionRequest?.(event.params.request);
      }
    },
    [network, onActionRequest]
  );

  const addListeners = useCallback(() => {
    if (activeSessionsListeners.size > 0) {
      return;
    }

    walletConnectInterceptor.subscribeConnectProposal(handleApprove);
    walletConnectInterceptor.subscribeDisconnect(updateActiveSessions);
  }, [handleApprove, updateActiveSessions]);

  const removeListeners = useCallback(() => {
    if (activeSessionsListeners.size > 0) {
      return;
    }

    walletConnectInterceptor.unsubscribeConnectProposal(handleApprove);
    walletConnectInterceptor.unsubscribeDisconnect(updateActiveSessions);
  }, [handleApprove, updateActiveSessions]);

  // Listen for active-session changes and subscribe / unsubscribe to client changes
  useEffect(() => {
    addListeners();
    activeSessionsListeners.add(setSessions);

    return () => {
      activeSessionsListeners.delete(setSessions);
      removeListeners();
    };
  }, [addListeners, removeListeners]);

  // Always subscribe to the request event as the onActionRequest property might differ
  // between hook instances
  useEffect(() => {
    walletConnectInterceptor.subscribeRequest(handleRequest);

    return () => {
      walletConnectInterceptor.unsubscribeRequest(handleRequest);
    };
  }, [handleRequest]);

  return {wcConnect, wcDisconnect, sessions, activeSessions};
}
