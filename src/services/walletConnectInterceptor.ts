import {AuthClientTypes} from '@walletconnect/auth-client';
import {Core} from '@walletconnect/core';
import {PairingTypes, SessionTypes} from '@walletconnect/types';
import {buildApprovedNamespaces, getSdkError} from '@walletconnect/utils';
import Web3WalletClient, {
  Web3Wallet,
  Web3WalletTypes,
} from '@walletconnect/web3wallet';
import {AppMetadata, WC_URI_PATTERN} from 'utils/constants';
import {i18n} from '../../i18n.config';

const URI_REGEX = new RegExp(WC_URI_PATTERN);
class WalletConnectInterceptor {
  clientMetadata: AuthClientTypes.Metadata = AppMetadata;

  client: Web3WalletClient | undefined;

  constructor() {
    this.initClient();
  }

  validateURI(uri: string) {
    // TODO: Get crowdin key for this
    return URI_REGEX.test(uri)
      ? undefined
      : i18n.t('modal.dappConnect.validation.alertInvalid');
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

  pingTopic(topic: string) {
    return this.client?.core.pairing.ping({topic});
  }

  async verifyConnection(
    connection: PairingTypes.Struct
  ): Promise<SessionTypes.Struct | undefined> {
    const matchingSession = this.getActiveSessions().find(
      ({pairingTopic}) => pairingTopic === connection.topic
    );

    if (matchingSession) {
      return matchingSession;
    }

    // Connection is expired as there's still no matching session
    if (Date.now() / 1000 > connection.expiry) {
      throw new Error('walletConnectInterceptor: connection is expired');
    }

    // The pingTopic function throws error when the topic is not
    // valid anymore
    try {
      await this.pingTopic(connection.topic);
    } catch (error) {
      throw new Error('walletConnectInterceptor: topic not valid');
    }
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
          methods: proposal.params.requiredNamespaces['eip155'].methods,
          events: ['accountsChanged', 'chainChanged'],
          accounts: supportedChains.map(id => `eip155:${id}:${accountAddress}`),
        },
      },
    });

    return this.client?.approveSession({
      id: proposal.id,
      namespaces: approvedNamespaces,
    });
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
