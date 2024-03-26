import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter as Router} from 'react-router-dom';
import '@aragon/ods/index.css';
import './index.css';
import isPropValid from '@emotion/is-prop-valid';
import {StyleSheetManager} from 'styled-components';
import {createWeb3Modal} from '@web3modal/wagmi/react';
import {http, createConfig, WagmiProvider} from 'wagmi';
import {walletConnect, injected, coinbaseWallet} from 'wagmi/connectors';

import {arbitrum, base, mainnet, polygon, sepolia} from 'wagmi/chains';
import {AlertProvider} from 'context/alert';
import {GlobalModalsProvider} from 'context/globalModals';
import {NetworkProvider} from 'context/network';
import {PrivacyContextProvider} from 'context/privacyContext';
import {ProvidersContextProvider} from 'context/providers';
import {TransactionDetailProvider} from 'context/transactionDetail';
import {WalletMenuProvider} from 'context/walletMenu';
import {UseCacheProvider} from 'hooks/useCache';
import {UseClientProvider} from 'hooks/useClient';
import {walletConnectProjectID} from 'utils/constants';
import {VocdoniClientProvider} from './hooks/useVocdoniSdk';

import {App} from './app';
import {aragonGateway} from 'utils/aragonGateway';

// const chains = [
//   base,
//   baseGoerli,
//   goerli,
//   mainnet,
//   polygon,
//   polygonMumbai,
//   arbitrum,
//   arbitrumGoerli,
//   sepolia,
// ];

const metadata = {
  name: 'Aragon DAO',
  description: 'Aragon DAO',
  url: 'https://aragon.org',
  icons: [
    'https://assets.website-files.com/5e997428d0f2eb13a90aec8c/635283b535e03c60d5aafe64_logo_aragon_isotype.png',
  ],
};

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, base, polygon, arbitrum],
  transports: {
    [mainnet.id]: http(aragonGateway.buildRpcUrl(mainnet.id) ?? ''),
    [sepolia.id]: http(aragonGateway.buildRpcUrl(sepolia.id) ?? ''),
    [base.id]: http(aragonGateway.buildRpcUrl(base.id) ?? ''),
    [polygon.id]: http(aragonGateway.buildRpcUrl(polygon.id) ?? ''),
    [arbitrum.id]: http(aragonGateway.buildRpcUrl(arbitrum.id) ?? ''),
  },
  connectors: [
    walletConnect({
      projectId: walletConnectProjectID,
      metadata,
      showQrModal: false,
    }),
    injected({shimDisconnect: true}),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId: walletConnectProjectID,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
});

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
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <PrivacyContextProvider>
            <Router>
              <AlertProvider>
                <NetworkProvider>
                  <UseClientProvider>
                    <UseCacheProvider>
                      <ProvidersContextProvider>
                        <TransactionDetailProvider>
                          <WalletMenuProvider>
                            <GlobalModalsProvider>
                              <VocdoniClientProvider>
                                <App />
                                <ReactQueryDevtools initialIsOpen={false} />
                              </VocdoniClientProvider>
                            </GlobalModalsProvider>
                          </WalletMenuProvider>
                        </TransactionDetailProvider>
                      </ProvidersContextProvider>
                    </UseCacheProvider>
                  </UseClientProvider>
                </NetworkProvider>
              </AlertProvider>
            </Router>
          </PrivacyContextProvider>
        </QueryClientProvider>
      </WagmiProvider>
      {/* <Web3Modal
        projectId={walletConnectProjectID}
        ethereumClient={ethereumClient}
        themeMode="light"
      /> */}
    </StyleSheetManager>
  </React.StrictMode>
);
