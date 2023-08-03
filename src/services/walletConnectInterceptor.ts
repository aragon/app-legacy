import {Core} from '@walletconnect/core';
import {buildApprovedNamespaces, getSdkError} from '@walletconnect/utils';
import Web3WalletClient, {Web3Wallet} from '@walletconnect/web3wallet';
import {AuthClientTypes} from '@walletconnect/auth-client';
import {JsonRpcResponse} from '@walletconnect/jsonrpc-utils';
import {Web3WalletTypes} from '@walletconnect/web3wallet';
import {SessionTypes} from '@walletconnect/types';

class WalletConnectInterceptor {
  clientMetadata: AuthClientTypes.Metadata = {
    name: 'Aragon DAO',
    description: 'Aragon DAO',
    url: 'https://aragon.org',
    icons: ['https://walletconnect.org/walletconnect-logo.png'],
  };

  signRequests = [
    'personal_sign',
    'eth_signTypedData',
    'eth_signTypedData_v4',
    'eth_sign',
  ];

  client: Web3WalletClient | undefined;

  constructor() {
    this.initClient();
  }

  subscribeConnectProposal(
    cb: (event: Web3WalletTypes.SessionProposal) => void
  ) {
    this.client?.on('session_proposal', cb);
  }

  unsubscribeConnectProposal(
    cb: (event: Web3WalletTypes.SessionProposal) => void
  ): void {
    this.client?.off('session_proposal', cb);
  }

  subscribeRequest(cb: (event: Web3WalletTypes.SessionRequest) => void): void {
    this.client?.on('session_request', cb);
  }

  unsubscribeRequest(
    cb: (event: Web3WalletTypes.SessionRequest) => void
  ): void {
    this.client?.off('session_request', cb);
  }

  subscribeDisconnect(
    cb: (event: Web3WalletTypes.SessionDelete) => void
  ): void {
    this.client?.on('session_delete', cb);
  }

  unsubscribeDisconnect(
    cb: (event: Web3WalletTypes.SessionDelete) => void
  ): void {
    this.client?.off('session_delete', cb);
  }

  connect(uri: string) {
    return this.client?.core.pairing.pair({uri});
  }

  approveSession(
    proposal: Web3WalletTypes.SessionProposal,
    accountAddress: string,
    supportedChains: number[] | readonly number[] = []
  ): Promise<SessionTypes.Struct> | undefined {
    const approvedNamespaces = buildApprovedNamespaces({
      proposal: proposal.params,
      supportedNamespaces: {
        eip155: {
          chains: supportedChains.map(id => `eip155:${id}`),
          methods: ['eth_sendTransaction', ...this.signRequests],
          events: ['accountsChanged', 'chainChanged'],
          accounts: supportedChains.map(id => `eip155:${id}:${accountAddress}`),
        },
      },
    });

    console.log('approve session', {proposal, approvedNamespaces});

    return this.client?.approveSession({
      id: proposal.id,
      namespaces: approvedNamespaces,
    });
  }

  respondRequest(topic: string, response: JsonRpcResponse) {
    this.client?.respondSessionRequest({topic, response});
  }

  rejectSession(
    proposal: Web3WalletTypes.SessionProposal
  ): Promise<void> | undefined {
    return this.client?.rejectSession({
      id: proposal.id,
      reason: getSdkError('USER_REJECTED_METHODS'),
    });
  }

  disconnect(topic: string) {
    return this.client?.disconnectSession({
      topic,
      reason: getSdkError('USER_DISCONNECTED'),
    });
  }

  getActiveSessions = (address?: string) => {
    const sessions = this.client?.getActiveSessions() ?? {};
    const filteredSessions = Object.values(sessions).filter(
      ({self, namespaces}) => {
        // Only sessions for Aragon DAO client
        const clientNameMatch = self.metadata.name === this.clientMetadata.name;
        // Only sessions matching the given address if given
        const addressMatch =
          address == null ||
          namespaces['eip155']?.accounts.some(eipAccount =>
            eipAccount.includes(address)
          );

        return clientNameMatch && addressMatch;
      }
    );

    return filteredSessions;
  };

  private initClient = async () => {
    const walletClient = await Web3Wallet.init({
      core: new Core({projectId: 'a312303bfee4d9c1cdbc5e638e8aa438'}),
      metadata: this.clientMetadata,
    });

    this.client = walletClient;
  };
}

export const walletConnectInterceptor = new WalletConnectInterceptor();
