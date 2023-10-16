import {useNetwork} from 'context/network';
import {useCallback, useState, useEffect} from 'react';
import {PairingTypes, SessionTypes} from '@walletconnect/types';

import {walletConnectInterceptor} from 'services/walletConnectInterceptor';
import {CHAIN_METADATA, SUPPORTED_CHAIN_ID} from 'utils/constants';
import {Web3WalletTypes} from '@walletconnect/web3wallet';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';

export type WcSession = SessionTypes.Struct;
export type WcConnection = PairingTypes.Struct;

export type WcActionRequest =
  Web3WalletTypes.SessionRequest['params']['request'];

export type WcConnectOptions = {
  uri: string;
  metadataName?: string;
};

export type VerifyConnectionOptions = {
  connection: WcConnection;
  metadataName?: string;
};

export type WcInterceptorValues = {
  wcConnect: (options: WcConnectOptions) => Promise<WcSession | undefined>;
  wcDisconnect: (topic: string) => Promise<void>;
  sessions: WcSession[];
  actions: WcActionRequest[];
};

export const CONNECTION_TIMEOUT = 60_000; // 60 seconds before connection timeout
export const METADATA_NAME_ERROR = new Error(
  'walletConnectInterceptor: peer name does not match'
);

export function useWalletConnectInterceptor(): WcInterceptorValues {
  const {network} = useNetwork();

  const {data: daoDetails} = useDaoDetailsQuery();
  const [sessions, setSessions] = useState<WcSession[]>(
    walletConnectInterceptor.getActiveSessions(daoDetails?.address)
  );

  const [actions, setActions] = useState<WcActionRequest[]>([]);

  const updateActiveSessions = useCallback(() => {
    const newSessions = walletConnectInterceptor.getActiveSessions(
      daoDetails?.address
    );

    setSessions(newSessions);
  }, [daoDetails?.address]);

  /**
   * The function checks if the connection is still valid and returns the relative
   * active session when found or undefined when the connection is still active but
   * there are no matching session.
   * The function throws error when the connection is not valid anymore.
   */
  const verifyConnection = useCallback(
    async ({
      connection,
      metadataName,
    }: VerifyConnectionOptions): Promise<WcSession | undefined> => {
      const matchingSession = await walletConnectInterceptor.verifyConnection(
        connection
      );

      const metadataNameMatch =
        metadataName == null ||
        matchingSession?.peer.metadata.name.toLowerCase() ===
          connection.peerMetadata?.name.toLowerCase();

      if (matchingSession && !metadataNameMatch) {
        throw METADATA_NAME_ERROR;
      }

      return matchingSession;
    },
    []
  );

  /**
   * The function tries to establish a connection to a dApp through the specified uri and verifies
   * that the connection is valid. When the connection times out or the topic is not valid anymore,
   * the function throws an error.
   */
  const wcConnect = useCallback(
    async ({uri, metadataName}: WcConnectOptions): Promise<WcSession> => {
      const connection = await walletConnectInterceptor.connect(uri);

      if (connection == null) {
        throw new Error('walletConnectInterceptor: connection not defined');
      }

      const connectionTimeoutStart = Date.now();
      let activeSession: WcSession | undefined;

      return new Promise<WcSession>((resolve, reject) => {
        const verifyInterval = setInterval(async () => {
          // Throw error when connection times out
          if (Date.now() > connectionTimeoutStart + CONNECTION_TIMEOUT) {
            clearInterval(verifyInterval);
            reject(new Error('walletConnectInterceptor: connection timeout'));
          }

          // Check status of connection and throw error when connection is expired or topic
          // is not valid
          try {
            activeSession = await verifyConnection({connection, metadataName});
          } catch (error) {
            clearInterval(verifyInterval);
            reject(error);
          }

          // Return active session and stop verification interval when session is valid
          if (activeSession != null) {
            clearInterval(verifyInterval);
            resolve(activeSession);
          }
        }, 1000);
      });
    },
    [verifyConnection]
  );

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

  return {wcConnect, wcDisconnect, sessions, actions};
}
