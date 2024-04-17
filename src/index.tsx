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
import {walletConnect, coinbaseWallet} from 'wagmi/connectors';

import {
  Chain,
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
  sepolia,
} from 'wagmi/chains';
import {AlertProvider} from 'context/alert';
import {GlobalModalsProvider} from 'context/globalModals';
import {NetworkProvider} from 'context/network';
import {PrivacyContextProvider} from 'context/privacyContext';
import {ProvidersContextProvider} from 'context/providers';
import {TransactionDetailProvider} from 'context/transactionDetail';
import {WalletMenuProvider} from 'context/walletMenu';
import {UseCacheProvider} from 'hooks/useCache';
import {UseClientProvider} from 'hooks/useClient';
import {
  AppMetadata,
  SupportedChainID,
  walletConnectProjectID,
} from 'utils/constants';
import {VocdoniClientProvider} from './hooks/useVocdoniSdk';

import {App} from './app';
import {aragonGateway} from 'utils/aragonGateway';
import {HttpTransport} from 'viem';

const chains = [
  base,
  baseGoerli,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
  arbitrum,
  arbitrumGoerli,
  sepolia,
] as [Chain, ...Chain[]];

const transports = chains.reduce(
  (RPCs, value) => {
    RPCs[value.id as SupportedChainID] = http(
      aragonGateway.buildRpcUrl(value.id) ?? ''
    );
    return RPCs;
  },
  {} as Record<SupportedChainID, HttpTransport>
);

export const wagmiConfig = createConfig({
  chains,
  transports: transports,
  connectors: [
    walletConnect({
      projectId: walletConnectProjectID,
      metadata: AppMetadata,
      showQrModal: false,
    }),
    coinbaseWallet({
      appName: AppMetadata.name,
      appLogoUrl: AppMetadata.icons[0],
    }),
  ],
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId: walletConnectProjectID,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional
  themeMode: 'light',
  allWallets: 'SHOW',
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
    '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1',
  ],
});

// Add toJSON method to BigInt interface to properly serialize bigint types
// on react-query query keys
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// React-Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5, // 5min
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
    </StyleSheetManager>
  </React.StrictMode>
);
