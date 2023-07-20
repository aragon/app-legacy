import {useNetwork} from 'context/network';
import {useCallback, useState, useEffect, useMemo} from 'react';
import {SessionTypes} from '@walletconnect/types';

import {walletConnectInterceptor} from 'services/walletConnectInterceptor';
import {CHAIN_METADATA, SUPPORTED_CHAIN_ID} from 'utils/constants';
import usePrevious from 'hooks/usePrevious';
import {Web3WalletTypes} from '@walletconnect/web3wallet';
import {useDaoDetailsQuery} from './useDaoDetails';

export type WcActionRequest =
  Web3WalletTypes.SessionRequest['params']['request'];

export interface UseWalletConnectInterceptorOptions {
  onActionRequest?: (request: WcActionRequest) => void;
  onConnectionProposal?: (payload: {
    approve: () => void;
    reject: () => void;
  }) => void;
  autoApprove?: boolean;
}

export interface WcConnectOptions {
  uri: string;
  onError?: (e: Error) => void;
}

type WcSession = SessionTypes.Struct;
type ActiveSessionListener = (sessions: WcSession[]) => void;
const activeSessionsListeners = new Set<ActiveSessionListener>();

export function useWalletConnectInterceptor({
  onActionRequest,
  onConnectionProposal,
  autoApprove = true,
}: UseWalletConnectInterceptorOptions) {
  const {network} = useNetwork();
  const prevNetwork = usePrevious(network);

  const {data: daoDetails} = useDaoDetailsQuery();

  const [activeSessions, setActiveSessions] = useState<WcSession[]>([]);

  const activeNetworkData = useMemo(() => CHAIN_METADATA[network], [network]);

  const updateActiveSessions = useCallback(() => {
    const newSessions = walletConnectInterceptor.getActiveSessions(
      daoDetails?.address
    );

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
      const response = await walletConnectInterceptor.approveSession(
        data,
        daoDetails?.address as string,
        SUPPORTED_CHAIN_ID
      );

      updateActiveSessions();

      return response;
    },
    [daoDetails, updateActiveSessions]
  );

  const handleReject = useCallback(
    async (data: Web3WalletTypes.SessionProposal) => {
      await walletConnectInterceptor.rejectSession(data);
    },
    []
  );

  const handleConnectProposal = useCallback(
    async (event: Web3WalletTypes.SessionProposal) => {
      if (autoApprove) {
        handleApprove(event);
      } else {
        onConnectionProposal?.({
          approve: () => handleApprove(event),
          reject: () => handleReject(event),
        });
      }
    },
    [autoApprove, onConnectionProposal, handleApprove, handleReject]
  );

  const handleRequest = useCallback(
    (event: Web3WalletTypes.SessionRequest) => {
      if (event.params.chainId === `eip155:${activeNetworkData.id}`) {
        onActionRequest?.(event.params.request);
      }
    },
    [activeNetworkData, onActionRequest]
  );

  const handleDisconnect = useCallback(
    (event: Web3WalletTypes.SessionDelete) => wcDisconnect(event.topic),
    [wcDisconnect]
  );

  useEffect(() => {
    activeSessionsListeners.add(setActiveSessions);

    return () => {
      activeSessionsListeners.delete(setActiveSessions);
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
        activeNetworkData.id
      );
    });
  }, [activeNetworkData, network, prevNetwork, activeSessions]);

  return {wcConnect, wcDisconnect, activeSessions};
}
