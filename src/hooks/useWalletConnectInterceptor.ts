import {useNetwork} from 'context/network';
import {useCallback, useState, useEffect, useMemo} from 'react';
import {SessionTypes} from '@walletconnect/types';

import {
  WcClient,
  WcConnectProposalEvent,
  WcDisconnectEvent,
  WcRequestEvent,
  approveSession,
  rejectSession,
  connect,
  makeClient,
  subscribeConnectProposal,
  subscribeDisconnect,
  subscribeRequest,
  unsubscribeConnectProposal,
  unsubscribeDisconnect,
  unsubscribeRequest,
  disconnect,
  changeNetwork,
  WcRequest,
} from 'services/walletConnectInterceptor';
import {CHAIN_METADATA, SUPPORTED_CHAIN_ID} from 'utils/constants';
import usePrevious from 'hooks/usePrevious';
import {useWallet} from './useWallet';

export interface UseWalletConnectInterceptorOptions {
  onActionRequest?: (request: WcRequest) => void;
  onConnectionProposal?: (payload: {
    approve: () => void;
    reject: () => void;
  }) => void;
}

export type WcRecord = Required<Omit<WcConnectOptions, 'onError'>> & {
  topic?: string;
  id?: number;
};

export interface WcConnectOptions {
  uri: string;
  address: string;
  autoApprove?: boolean;
  onError?: (e: Error) => void;
}

export function useWalletConnectInterceptor({
  onActionRequest,
  onConnectionProposal = () => {},
}: UseWalletConnectInterceptorOptions) {
  const {network} = useNetwork();
  const {address} = useWallet();
  const prevNetwork = usePrevious(network);

  const [client, setClient] = useState<WcClient | null>(null);
  // TODO: Determine if currentWcRecord and archivedURIs needs to stay or removed
  const [currentWcRecord, setCurrentWcRecord] = useState<WcRecord | null>(null);

  const [activeSessions, setActiveSessions] =
    useState<Record<string, SessionTypes.Struct>>();

  const activeNetworkData = useMemo(() => CHAIN_METADATA[network], [network]);

  const isWcReady = useMemo(() => !!client, [client]);
  const isWcConnected = useMemo(() => !!currentWcRecord, [currentWcRecord]);

  const canConnect = useCallback(
    (uri: string) => {
      return isWcReady && !isWcConnected && !!uri.length;
    },
    [isWcConnected, isWcReady]
  );

  const canDisconnect = useCallback(() => {
    return isWcReady && isWcConnected;
  }, [isWcConnected, isWcReady]);

  const wcConnect = useCallback(
    async ({onError = () => {}, ...restOptions}: WcConnectOptions) => {
      if (!client) {
        throw new Error('The WalletConnect client must be initialized');
      }

      try {
        const connection = await connect(client, restOptions.uri);

        setCurrentWcRecord({autoApprove: true, ...restOptions});
        return connection;
      } catch (e) {
        onError(e as Error);
      }
    },
    [client]
  );

  const wcDisconnect = useCallback(
    async (topic?: string) => {
      if (!client) {
        throw new Error('The WalletConnect client must be initialized');
      }

      if (!topic && !currentWcRecord?.topic) {
        throw new Error(
          'Topic must be provided either by currently approved session or as argument'
        );
      }

      try {
        await disconnect(client, topic || currentWcRecord?.topic || '');
      } catch (e) {
        console.error(e);
      } finally {
        setCurrentWcRecord(null);
      }
    },
    [client, currentWcRecord]
  );

  const handleApprove = useCallback(
    async (data: WcConnectProposalEvent) => {
      if (!client) {
        throw new Error('The WalletConnect client must be initialized');
      }

      if (!currentWcRecord) {
        throw new Error(
          'To approve the connection, you must initiate it first'
        );
      }

      const response = await approveSession(
        client,
        data,
        currentWcRecord.address,
        SUPPORTED_CHAIN_ID
      );

      setCurrentWcRecord({
        ...currentWcRecord,
        id: data.id,
        topic: response.topic,
      });

      setActiveSessions(client.getActiveSessions());

      return response;
    },
    [client, currentWcRecord]
  );

  const handleReject = useCallback(
    async (data: WcConnectProposalEvent) => {
      if (!client) {
        throw new Error('The WalletConnect client must be initialized');
      }

      await rejectSession(client, data);
      setCurrentWcRecord(null);
    },
    [client]
  );

  const handleConnectProposal = useCallback(
    (event: WcConnectProposalEvent) => {
      if (!currentWcRecord) {
        throw new Error(
          'Unexpected error: Connection proposal established but currentConnectRecord is null'
        );
      }

      if (currentWcRecord.autoApprove) {
        handleApprove(event);
      } else {
        onConnectionProposal({
          approve: () => handleApprove(event),
          reject: () => handleReject(event),
        });
      }
    },
    [currentWcRecord, onConnectionProposal, handleApprove, handleReject]
  );

  const handleRequest = useCallback(
    (event: WcRequestEvent) => {
      if (!client) {
        throw new Error('The WalletConnect client must be initialized');
      }

      if (event.params.chainId === `eip155:${activeNetworkData.id}`) {
        onActionRequest?.(event.params.request);
      }
    },
    [activeNetworkData, client, onActionRequest]
  );

  const handleDisconnect = useCallback(
    (event: WcDisconnectEvent) => {
      if (event.topic !== currentWcRecord?.topic) {
        console.error('Connection is not established');
        return;
      }
    },
    [currentWcRecord?.topic]
  );

  const getActiveSessions = useCallback(() => {
    const activeSessions = client?.getActiveSessions() ?? {};
    return Object.values(activeSessions).filter(session =>
      session.namespaces['eip155'].accounts.every(
        account => address == null || !account.includes(address)
      )
    );
  }, [client, address]);

  useEffect(() => {
    const initClient = async () => {
      console.log('init from: ', name);
      const client = await makeClient();
      console.log(client.getActiveSessions());
      setClient(client);
    };

    initClient();
  }, [name]);

  useEffect(() => {
    if (!client) return;
    subscribeConnectProposal(client, handleConnectProposal);
    return () => unsubscribeConnectProposal(client, handleConnectProposal);
  }, [client, handleConnectProposal]);

  useEffect(() => {
    if (!client) return;
    subscribeRequest(client, handleRequest);
    return () => unsubscribeRequest(client, handleRequest);
  }, [client, handleRequest]);

  useEffect(() => {
    if (!client) return;
    subscribeDisconnect(client, handleDisconnect);
    return () => unsubscribeDisconnect(client, handleDisconnect);
  }, [client, handleDisconnect]);

  useEffect(() => {
    if (!client || !currentWcRecord || !currentWcRecord.topic) return;

    if (prevNetwork !== network) {
      changeNetwork(
        client,
        currentWcRecord.topic,
        currentWcRecord.address,
        activeNetworkData.id
      );
    }
  }, [activeNetworkData, client, currentWcRecord, network, prevNetwork]);

  return {
    isWcReady,
    isWcConnected,
    wcConnect,
    wcDisconnect,
    canConnect,
    canDisconnect,
    activeSessions,
    getActiveSessions,
  };
}
