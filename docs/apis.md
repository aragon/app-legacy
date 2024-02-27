# Third party API use

We are using APISIX as API Gateway to:

1. Mediate traffic.
2. Build a Data-Plane.
3. Introduce Architecture Design Patterns to make flexible, scalable and secure Web3 software.

For more technical information about Aragon Gateway, please check the [Gateway Documentation](https://github.com/aragon/gw-mediation-logic)

## Aragon Gateway

RPC Providers

VITE_GATEWAY_RPC_API_KEY -> infuraApiKey -> jsonRpcProvider, CHAIN_METADATA[network].rpc -> getJsonRpcProvider, useClient, useSwitchNetwork, useWallet

## Alchemy

RPC Providers, ERC20 Transfers

VITE_ALCHEMY_KEY_MAINNET, \_GOERLI etc -> AlchemyApiKeys -> getAlchemyProvider, fetchAlchemyErc20Deposits -> fetchErc20Deposits -> useErc20Deposits -> useDaoTransfers -> useDaoVault, useCategorizedTransfers

## Wallet Connect

RPC Provider

VITE_WALLET_CONNECT_PROJECT_ID -> walletConnectProjectId -> publicClient -> wagmiConfig -> ethereumClient -> web3Modal

## Wallet Connect (as wallet)

WalletConnectInterceptor -> walletConnectInterceptor -> useWalletConnectInterceptor

## Etherscan

Contract info

VITE_ETHERSCAN_API_KEY -> etherscanApiKey -> CHAIN_METADATA[network].etherscanApi, .etherscanApiKey -> useValidateContractEtherscan

## Sourcify

Contract info

useValidateContractSourcify

## Covalent

Tokens and transfers

VITE_COVALENT_API_KEY -> COVALENT_API_KEY -> getTokenHoldersPaged, fetchCovalentToken (-> fetchToken), fetchTokenBalances, fetchCovalentErc20Deposits -> fetchErc20Deposits

## Coingecko

Tokens

CHAIN_METADATA[network].coingecko -> fetchCoingeckoToken -> fetchToken

## IPFS

Metadata

VITE_GATEWAY_IPFS_API_KEY -> via SDK Client
