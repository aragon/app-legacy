/* eslint-disable @typescript-eslint/no-explicit-any */
import {walletConnectProjectID} from 'utils/constants';
import {Core} from '@walletconnect/core';
import {buildApprovedNamespaces, getSdkError} from '@walletconnect/utils';
import {Web3Wallet} from '@walletconnect/web3wallet';

export type WcClient = any;

export interface WcConnectProposalEvent {
  id: number;
  params: {
    id: number;
    expiry: number;
    relays: Array<{
      protocol: string;
      data?: string;
    }>;
    proposer: {
      publicKey: string;
      metadata: {
        name: string;
        description: string;
        url: string;
        icons: string[];
      };
    };
    requiredNamespaces: Record<
      string,
      {
        chains: string[];
        methods: string[];
        events: string[];
      }
    >;
    pairingTopic?: string;
  };
}

export interface WcRequestEvent {
  id: number;
  topic: string;
  params: {
    request: {
      method: string;
      params: any;
    };
    chainId: string;
  };
}

export type WcRequest = WcRequestEvent['params']['request'];

export interface WcDisconnectEvent {
  id: number;
  topic: string;
}

export async function makeClient(): Promise<WcClient> {
  const core = new Core({
    projectId: 'a312303bfee4d9c1cdbc5e638e8aa438' || walletConnectProjectID,
  });

  return Web3Wallet.init({
    core,
    metadata: {
      name: 'Aragon',
      description: 'Aragon WalletConnect',
      url: 'https://aragon.org',
      icons: ['https://walletconnect.org/walletconnect-logo.png'],
    },
  });
}

export function subscribeConnectProposal(
  client: WcClient,
  cb: (event: WcConnectProposalEvent) => void
): void {
  client.on('session_proposal', cb as () => unknown);
}

export function unsubscribeConnectProposal(
  client: WcClient,
  cb: (event: WcConnectProposalEvent) => void
): void {
  client.off('session_proposal', cb as () => unknown);
}

export function subscribeRequest(
  client: WcClient,
  cb: (event: WcRequestEvent) => void
): void {
  client.on('session_request', cb as () => unknown);
}

export function unsubscribeRequest(
  client: WcClient,
  cb: (event: WcRequestEvent) => void
): void {
  client.off('session_request', cb as () => unknown);
}

export function subscribeDisconnect(
  client: WcClient,
  cb: (event: WcDisconnectEvent) => void
): void {
  client.on('session_delete', cb as () => unknown);
}

export function unsubscribeDisconnect(
  client: WcClient,
  cb: (event: WcDisconnectEvent) => void
): void {
  client.off('session_delete', cb as () => unknown);
}

export async function connect(client: WcClient, uri: string) {
  return client.core.pairing.pair({uri});
}

export async function approveSession(
  client: WcClient,
  proposal: WcConnectProposalEvent,
  accountAddress: string,
  supportedChains: number[] | readonly number[] = []
) {
  const approvedNamespaces = buildApprovedNamespaces({
    proposal: proposal.params as any,
    supportedNamespaces: {
      eip155: {
        chains: supportedChains.map(id => `eip155:${id}`),
        methods: ['eth_sendTransaction', 'personal_sign'],
        events: ['accountsChanged', 'chainChanged'],
        accounts: supportedChains.map(id => `eip155:${id}:${accountAddress}`),
      },
    },
  });

  return client.approveSession({
    id: proposal.id,
    namespaces: approvedNamespaces,
  });
}

export async function rejectSession(
  client: WcClient,
  proposal: WcConnectProposalEvent
) {
  return client.rejectSession({
    id: proposal.id,
    reason: getSdkError('USER_REJECTED_METHODS'),
  });
}

export async function disconnect(client: WcClient, topic: string) {
  return client.disconnectSession({
    topic,
    reason: getSdkError('USER_DISCONNECTED'),
  });
}

export async function changeNetwork(
  client: WcClient,
  topic: string,
  address: string,
  chainId: number
) {
  return client.emitSessionEvent({
    topic: topic,
    event: {
      name: 'chainChanged',
      data: [address],
    },
    chainId: `eip155:${chainId}`,
  });
}
