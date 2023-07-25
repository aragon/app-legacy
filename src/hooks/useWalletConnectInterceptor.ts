import {useNetwork} from 'context/network';
import {useCallback, useState, useEffect} from 'react';
import {SessionTypes} from '@walletconnect/types';

import {walletConnectInterceptor} from 'services/walletConnectInterceptor';
import {CHAIN_METADATA, SUPPORTED_CHAIN_ID} from 'utils/constants';
import usePrevious from 'hooks/usePrevious';
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
  const prevNetwork = usePrevious(network);

  const {data: daoDetails} = useDaoDetailsQuery();

  const [sessions, setSessions] = useState<WcSession[]>([]);
  const activeSessions = sessions.filter(session => session.acknowledged);

  const updateActiveSessions = useCallback(() => {
    const newSessions = walletConnectInterceptor.getActiveSessions(
      daoDetails?.address
    );

    // Update active-sessions for all hook instances
    activeSessionsListeners.forEach(listener => listener(newSessions));
  }, [daoDetails]);

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
    [daoDetails, updateActiveSessions]
  );

  const handleConnectProposal = useCallback(
    async (event: Web3WalletTypes.SessionProposal) => handleApprove(event),
    [handleApprove]
  );

  const handleRequest = useCallback(
    (event: Web3WalletTypes.SessionRequest) => {
      if (event.params.chainId === `eip155:${CHAIN_METADATA[network].id}`) {
        onActionRequest?.(event.params.request);
      }
    },
    [network, onActionRequest]
  );

  const handleDisconnect = useCallback(
    (event: Web3WalletTypes.SessionDelete) => wcDisconnect(event.topic),
    [wcDisconnect]
  );

  useEffect(() => {
    activeSessionsListeners.add(setSessions);

    return () => {
      activeSessionsListeners.delete(setSessions);
    };
  }, []);

  // Initialize active sessions
  useEffect(() => {
    updateActiveSessions();
  }, [updateActiveSessions]);

  useEffect(() => {
    walletConnectInterceptor.subscribeConnectProposal(handleConnectProposal);

    return () =>
      walletConnectInterceptor.unsubscribeConnectProposal(
        handleConnectProposal
      );
  }, [handleConnectProposal]);

  useEffect(() => {
    walletConnectInterceptor.subscribeRequest(handleRequest);

    return () => walletConnectInterceptor.unsubscribeRequest(handleRequest);
  }, [handleRequest]);

  useEffect(() => {
    walletConnectInterceptor.subscribeDisconnect(handleDisconnect);

    return () =>
      walletConnectInterceptor.unsubscribeDisconnect(handleDisconnect);
  }, [handleDisconnect]);

  useEffect(() => {
    if (prevNetwork === network) {
      return;
    }

    activeSessions.forEach(session => {
      walletConnectInterceptor.changeNetwork(
        session.topic,
        session.namespaces['eip155'].accounts,
        CHAIN_METADATA[network].id
      );
    });
  }, [network, prevNetwork, activeSessions]);

  return {wcConnect, wcDisconnect, sessions, activeSessions};
}
