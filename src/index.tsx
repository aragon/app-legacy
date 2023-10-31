import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {EthereumClient, w3mConnectors, w3mProvider} from '@web3modal/ethereum';
import {Web3Modal} from '@web3modal/react';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter as Router} from 'react-router-dom';
import '@aragon/ods/index.css';
import isPropValid from '@emotion/is-prop-valid';
import {StyleSheetManager} from 'styled-components';
import {WagmiConfig, configureChains, createConfig} from 'wagmi';
import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
} from 'wagmi/chains';
import {infuraProvider} from 'wagmi/providers/infura';
import {LedgerConnector} from 'wagmi/connectors/ledger';
import {AlertProvider} from 'context/alert';
import {GlobalModalsProvider} from 'context/globalModals';
import {NetworkProvider} from 'context/network';
import {PrivacyContextProvider} from 'context/privacyContext';
import {ProvidersContextProvider} from 'context/providers';
import {TransactionDetailProvider} from 'context/transactionDetail';
import {WalletMenuProvider} from 'context/walletMenu';
import {UseCacheProvider} from 'hooks/useCache';
import {UseClientProvider} from 'hooks/useClient';
import {infuraApiKey, walletConnectProjectID} from 'utils/constants';
import {App} from './app';

const chains = [
  base,
  baseGoerli,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
  arbitrum,
  arbitrumGoerli,
];
const ledgerChains = [
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
  arbitrum,
  arbitrumGoerli,
];

const {publicClient} = configureChains(chains, [
  w3mProvider({projectId: walletConnectProjectID}),
  infuraProvider({apiKey: infuraApiKey}),
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    ...w3mConnectors({
      projectId: walletConnectProjectID,
      version: 2,
      chains,
    }),
    new LedgerConnector({
      chains: ledgerChains,
      options: {
        walletConnectVersion: 2,
        enableDebugLogs: false,
        projectId: walletConnectProjectID,
      },
    }),
  ],

  publicClient,
});

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// React-Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5, // 5min
      staleTime: 1000 * 60 * 2, // 2min
      retry: 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

const CACHE_VERSION = 2;
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

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <StyleSheetManager
      shouldForwardProp={(propName, elementToBeRendered) =>
        typeof elementToBeRendered === 'string' ? isPropValid(propName) : true
      }
    >
      <QueryClientProvider client={queryClient}>
        <PrivacyContextProvider>
          <Router>
            <AlertProvider>
              <WagmiConfig config={wagmiConfig}>
                <NetworkProvider>
                  <UseClientProvider>
                    <UseCacheProvider>
                      <ProvidersContextProvider>
                        <TransactionDetailProvider>
                          <WalletMenuProvider>
                            <GlobalModalsProvider>
                              <App />
                              <ReactQueryDevtools initialIsOpen={false} />
                            </GlobalModalsProvider>
                          </WalletMenuProvider>
                        </TransactionDetailProvider>
                      </ProvidersContextProvider>
                    </UseCacheProvider>
                  </UseClientProvider>
                </NetworkProvider>
              </WagmiConfig>
            </AlertProvider>
          </Router>
        </PrivacyContextProvider>
      </QueryClientProvider>
      <Web3Modal
        projectId={walletConnectProjectID}
        ethereumClient={ethereumClient}
        themeMode="light"
      />
    </StyleSheetManager>
  </React.StrictMode>
);
