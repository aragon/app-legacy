import {ApolloProvider} from '@apollo/client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';
import 'tailwindcss/tailwind.css';

import {AlertProvider} from 'context/alert';
import {client, goerliClient} from 'context/apolloClient';
import {APMProvider} from 'context/elasticAPM';
import {GlobalModalsProvider} from 'context/globalModals';
import {NetworkProvider} from 'context/network';
import {PrivacyContextProvider} from 'context/privacyContext';
import {ProvidersProvider} from 'context/providers';
import {TransactionDetailProvider} from 'context/transactionDetail';
import {WalletMenuProvider} from 'context/walletMenu';
import {UseCacheProvider} from 'hooks/useCache';
import {UseClientProvider} from 'hooks/useClient';
import {infuraApiKey, walletConnectProjectID} from 'utils/constants';
import App from './app';

import {EthereumClient, w3mConnectors, w3mProvider} from '@web3modal/ethereum';
import {Web3Modal} from '@web3modal/react';
import {configureChains, createConfig, WagmiConfig} from 'wagmi';
import {mainnet, goerli, polygon, polygonMumbai} from 'wagmi/chains';
import {infuraProvider} from 'wagmi/providers/infura';

const chains = [mainnet, goerli, polygon, polygonMumbai];

const {publicClient} = configureChains(chains, [
  w3mProvider({projectId: walletConnectProjectID}),
  infuraProvider({apiKey: infuraApiKey}),
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({
    projectId: walletConnectProjectID,
    version: 2,
    chains,
  }),

  publicClient,
});

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// React-Query client
export const queryClient = new QueryClient();

const CACHE_VERSION = 1;
const onLoad = () => {
  // Wipe local storage cache if its structure is out of date and clashes
  // with this version of the app.
  const cacheVersion = localStorage.getItem('AragonCacheVersion');
  const retainKeys = ['privacy-policy-preferences', 'favoriteDaos'];
  if (!cacheVersion || parseInt(cacheVersion) < CACHE_VERSION) {
    for (let i = 0; i < localStorage.length; i++) {
      if (!retainKeys.includes(localStorage.key(i)!)) {
        localStorage.removeItem(localStorage.key(i)!);
      }
    }
    localStorage.setItem('AragonCacheVersion', CACHE_VERSION.toString());
  }
};
onLoad();

ReactDOM.render(
  <>
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <PrivacyContextProvider>
          <APMProvider>
            <Router>
              <AlertProvider>
                <WagmiConfig config={wagmiConfig}>
                  <NetworkProvider>
                    <UseClientProvider>
                      <UseCacheProvider>
                        <ProvidersProvider>
                          <TransactionDetailProvider>
                            <WalletMenuProvider>
                              <GlobalModalsProvider>
                                {/* By default, goerli client is chosen, each useQuery needs to pass the network client it needs as argument
                      For REST queries using apollo, there's no need to pass a different client to useQuery  */}
                                <ApolloProvider
                                  client={client['goerli'] || goerliClient} //TODO remove fallback when all clients are defined
                                >
                                  <App />
                                  <ReactQueryDevtools initialIsOpen={false} />
                                </ApolloProvider>
                              </GlobalModalsProvider>
                            </WalletMenuProvider>
                          </TransactionDetailProvider>
                        </ProvidersProvider>
                      </UseCacheProvider>
                    </UseClientProvider>
                  </NetworkProvider>
                </WagmiConfig>
              </AlertProvider>
            </Router>
          </APMProvider>
        </PrivacyContextProvider>
      </QueryClientProvider>
    </React.StrictMode>
    <Web3Modal
      projectId={walletConnectProjectID}
      ethereumClient={ethereumClient}
      themeMode="light"
    />
  </>,
  document.getElementById('root')
);
