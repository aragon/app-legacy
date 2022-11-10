import {ApolloProvider} from '@apollo/client';
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import {UseSignerProvider} from 'use-signer';
import {IProviderOptions} from 'web3modal';

import {client, goerliClient} from 'context/apolloClient';
import {WalletProvider} from 'context/augmentedWallet';
import {APMProvider} from 'context/elasticAPM';
import {GlobalModalsProvider} from 'context/globalModals';
import {NetworkProvider} from 'context/network';
import {PrivacyContextProvider} from 'context/privacyContext';
import {ProvidersProvider} from 'context/providers';
import {TransactionDetailProvider} from 'context/transactionDetail';
import {WalletMenuProvider} from 'context/walletMenu';
import {UseCacheProvider} from 'hooks/useCache';
import {UseClientProvider} from 'hooks/useClient';
import {AlertProvider} from 'context/alert';
import App from './app';

const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId:
        import.meta.env.VITE_REACT_APP_RPC || 'mainnet.eth.aragon.network',
    },
  },
};

ReactDOM.render(
  <React.StrictMode>
    <PrivacyContextProvider>
      <APMProvider>
        <Router>
          <NetworkProvider>
            <WalletProvider>
              <UseSignerProvider providerOptions={providerOptions}>
                <UseClientProvider>
                  <UseCacheProvider>
                    <ProvidersProvider>
                      <TransactionDetailProvider>
                        <WalletMenuProvider>
                          <GlobalModalsProvider>
                            <AlertProvider>
                              {/* By default, goerli client is chosen, each useQuery needs to pass the network client it needs as argument
                      For REST queries using apollo, there's no need to pass a different client to useQuery  */}
                              <ApolloProvider
                                client={client['goerli'] || goerliClient} //TODO remove fallback when all clients are defined
                              >
                                <App />
                              </ApolloProvider>
                            </AlertProvider>
                          </GlobalModalsProvider>
                        </WalletMenuProvider>
                      </TransactionDetailProvider>
                    </ProvidersProvider>
                  </UseCacheProvider>
                </UseClientProvider>
              </UseSignerProvider>
            </WalletProvider>
          </NetworkProvider>
        </Router>
      </APMProvider>
    </PrivacyContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
