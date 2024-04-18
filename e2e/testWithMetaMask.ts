import {
  testWithSynpress,
  MetaMask,
  unlockForFixture,
} from '@synthetixio/synpress';

import basicSetup from './basic.setup';

export const testWithMetaMask = testWithSynpress(
  basicSetup,
  unlockForFixture
).extend<{
  metamask: MetaMask;
}>({
  metamask: async ({context, metamaskPage, extensionId}, use) => {
    const metamask = new MetaMask(
      context,
      metamaskPage,
      basicSetup.walletPassword,
      extensionId
    );

    await use(metamask);
  },
});
