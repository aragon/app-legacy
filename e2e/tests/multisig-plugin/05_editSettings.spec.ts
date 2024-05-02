import {LOCALHOST_URL} from '../../basic.setup';
import {testWithMetaMask as test} from '../../testWithMetaMask';

// // Test is publishing, approving, and executing a proposal to edit a DAO settings
test('Edit DAO settings Proposal', async ({
  context,
  page,
  extensionId,
  metamask,
}) => {
  await page.goto(`${LOCALHOST_URL}/`);
  await page.getByRole('button', {name: 'Accept all'}).click();
  await page.getByRole('button', {name: 'Connect wallet'}).click();
  await page.getByRole('button', {name: 'MetaMask MetaMask'}).nth(0).click();
  await metamask.connectToDapp();
  await page.getByRole('radio', {name: 'Member'}).click();
  await page.locator('[id="radix-\\:r16\\:"]').click();
  await page.getByText('Sort by recently created').click();
  await page
    .getByRole('link', {name: 'MD Multisig DAO DAO generated'})
    .first()
    .click();
  await page
    .getByTestId('navLinks')
    .getByRole('button', {name: 'Settings'})
    .click();

  await page
    .getByTestId('header-page')
    .getByRole('button', {name: 'Edit settings'})
    .click();

  await page.getByRole('button', {name: 'Switch to Ethereum Sepolia'}).click();
  await metamask.approveSwitchNetwork();
  await page.waitForTimeout(1000);
  await page.getByRole('button', {name: 'Add link'}).click();

  await page.getByPlaceholder('Lens').click();
  await page.getByPlaceholder('Lens').fill('Multisig DAO');
  await page.getByPlaceholder('Lens').click();
  await page
    .getByPlaceholder('https://')
    .fill(
      'https://app.aragon.org/#/daos/sepolia/0xba6b77465aa80dcaab3077b9c295e85a377fa6ae/dashboard'
    );
  await page.getByRole('button', {name: 'Review proposal'}).click();

  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByPlaceholder('Give your proposal a title').click();
  await page
    .getByPlaceholder('Give your proposal a title')
    .fill('Edit settings');
  await page.getByPlaceholder('Describe your proposal in 2-3').click();
  await page
    .getByPlaceholder('Describe your proposal in 2-3')
    .fill('Edit settings');
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Next'}).click();

  await page.getByRole('button', {name: 'Publish proposal'}).click();
  await page.getByRole('button', {name: 'Create proposal'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Open your proposal'}).click();
  await page.getByRole('button', {name: 'Approve and execute'}).click();
  await page.getByRole('button', {name: 'Approve and execute'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Continue to proposal'}).click();
});
