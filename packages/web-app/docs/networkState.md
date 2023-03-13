# Network State

What the current network is needs to be known by every page in the application. This is determined by the following rule:

- If the url contains a segment which specifies the network, use this
- Otherwise if there is a wallet connected, use the network set in the wallet
- Otherwise default to Ethereum mainnet

## Old Implementation

Network state is held in a React Context, provided by `NetworkProvider` in `context/network.tsx`.

`useNetwork` supplies the global network state and determines it by default to be the url-network, but it supplies a setter `setNetwork` to allow other factors to change the current network.

Logic: `setNetwork` only works if `isNetworkFlexible === true`. `isNetworkFlexible` is initialised to false and then permanently set to true whenever the url changes to a page with no network segment in the url.

in `explore.tsx` the current wallet network is got via `useNetwork` into `chainId`. When this changes, the global network state is set.

In `createDAO.tsx`, the current wallet network is similarly pushed into the global network state whenever the wallet network changes.

## New Implementation

As above, however now `useNetwork` considers the current wallet network when deciding which is the current network so `explore.tsx` doesn't have to set the network.

Also there is now a network state `unsupported` which indicates that a network has been determined but it is not a network the app supports. In this case there is an immediate navigation to the 404 page, but there will be one render where the network is in an unusable state in which case the app is rendered as a loading page.

Code has also been amended to consider and handle the possibility that the network returned from `useNetwork` is out of sync from the current SDK client's network.
