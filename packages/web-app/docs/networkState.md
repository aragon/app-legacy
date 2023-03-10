# Network State

What the current network is needs to be known by every page in the application. This is determined by the following rule:

- If the url contains a segment which specifies the network, use this
- Otherwise if there is a wallet connected, use the network set in the wallet
- Otherwise default to Ethereum mainnet

## Current Implementation

Network state is held in a React Context, provided by `NetworkProvider` in `context/network.tsx`.

`useNetwork` supplies the global network state and determines it by default to be the url-network, but it supplies a setter `setNetwork` to allow other factors to change the current network.

Logic: `setNetwork` only works if `isNetworkFlexible === true`. `isNetworkFlexible` is initialised to false and then permanently set to true whenever the url changes to a page with no network segment in the url.

in `explore.tsx` the current wallet network is got via `useNetwork` into `chainId`. When this changes, the global network state is set.

In `createDAO.tsx`, the current wallet network is similarly pushed into the global network state whenever the wallet network changes.
