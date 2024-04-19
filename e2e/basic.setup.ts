import {
  MetaMask,
  defineWalletSetup,
  getExtensionId,
} from '@synthetixio/synpress';
import 'dotenv/config';

const LOCALHOST_URL = process.env.LOCALHOST_URL;
const SEED_PHRASE = process.env.METAMASK_SEED_PHRASE!;
const PASSWORD = process.env.METAMASK_PASSWORD!;

export {LOCALHOST_URL};

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // This is a workaround for the fact that the MetaMask extension ID changes, and this ID is required to detect the pop-ups.
  // It won't be needed in the near future! 😇
  const extensionId = await getExtensionId(context, 'MetaMask');

  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId);

  await metamask.importWallet(SEED_PHRASE);
});
