import * as rudderAnalytics from 'rudder-sdk-js';

/**
 * Sends analytics information about the events logged.
 *
 * @param eventName The event name tied to actions like button clicks.
 * @returns void
 */
export function trackEvent(eventName: string, properties?: Object) {
  rudderAnalytics.track(eventName, properties as rudderAnalytics.apiObject);
}

/**
 * Sends analytics information about the pages visited.
 *
 * @param pathName (Dynamic) Path name as given by the react router.
 * @returns void
 */
export function trackPage(pathName: string) {
  rudderAnalytics.page({
    path: pathName,
  });
}

/**
 * Sends analytics information about the connected wallets.
 *
 * @param {String} account Wallet address
 * @param {String} networkType The network the wallet is connected to
 * @param {String} connector Wallet connector used by use-wallet library
 * @returns {void}
 */
export function identifyUser(
  account: string,
  networkType: string,
  connector: string
) {
  const walletData = {
    wallet_address: account,
    wallet_provider: connector,
    network: networkType,
  };
  rudderAnalytics.identify(walletData);
}

export function disableAnalytics() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).rudderanalytics = null;
}

export function enableAnalytics() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analyticsKey = import.meta.env.VITE_REACT_APP_ANALYTICS_KEY;

  if (analyticsKey) {
    rudderAnalytics.load(
      analyticsKey as string,
      'https://rudderstack.aragon.org',
      {
        secureCookie: true,
        sendAdblockPage: true,
        sendAdblockPageOptions: {
          integrations: {
            All: false,
          },
        },
      }
    );
  }
}
