import {
  MetaMask,
  defineWalletSetup,
  getExtensionId,
} from '@synthetixio/synpress';
// import 'dotenv/config';

// const SEED_PHRASE = import.meta.env.SEED_PHRASE;
// const PASSWORD = import.meta.env.PASSWORD;

const SEED_PHRASE =
  'clay risk pepper raccoon card erode desert index short glide junk fox';
const PASSWORD = 'testitesti';

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // This is a workaround for the fact that the MetaMask extension ID changes, and this ID is required to detect the pop-ups.
  // It won't be needed in the near future! 😇
  const extensionId = await getExtensionId(context, 'MetaMask');

  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId);

  await metamask.importWallet(SEED_PHRASE);
});
