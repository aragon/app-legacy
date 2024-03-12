// import { test, expect } from '@playwright/test';

// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });

// import {
//   MetaMask,
//   testWithSynpress,
//   unlockForFixture,
// } from '@synthetixio/synpress';
// import BasicSetup from '../test/wallet-setup/basic.setup.ts';

// const test = testWithSynpress(BasicSetup, unlockForFixture);

// const {expect} = test;

// test('should connect wallet to the MetaMask Test Dapp', async ({
//   context,
//   page,
//   extensionId,
// }) => {
//   const metamask = new MetaMask(
//     context,
//     page,
//     BasicSetup.walletPassword,
//     extensionId
//   );

//   await page.goto('http://localhost:3000/');
//   await page.getByRole('button', {name: 'Accept all'}).click();
//   await page.getByRole('button', {name: 'Connect wallet'}).click();

//   await page.goto('/');
//   await page.locator('#connectButton').click();
//   await metamask.connectToDapp();
//   await expect(page.locator('#accounts')).toHaveText(
//     '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
//   );

//   await page.locator('#getAccounts').click();
//   await expect(page.locator('#getAccountsResult')).toHaveText(
//     '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
//   );
// });

import {testWithMetaMask as test} from './testWithMetaMask';

const {expect} = test;

// The `MetaMask` instance is now available in the test context.
test('should connect multiple wallets to dapp', async ({
  context,
  page,
  extensionId,
  metamask,
}) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', {name: 'Accept all'}).click();
  await page.getByRole('button', {name: 'Connect wallet'}).click();
  await page.goto('/');

  await page.locator('#connectButton').click();

  await metamask.connectToDapp(['0xdeadbeef1', '0xdeadbeef2']);

  await expect(page.locator('#accounts')).toHaveText('0xdeadbeef1,0xdeadbeef2');
});
