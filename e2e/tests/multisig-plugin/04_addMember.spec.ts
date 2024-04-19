import {testWithMetaMask as test} from '../../testWithMetaMask';

// // Test is publishing, approving, and executing a proposal to add a DAO member
test('Add DAO member Proposal', async ({
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
    .getByRole('button', {name: 'Members'})
    .click();
  await page.getByRole('button', {name: 'Manage members'}).click();
  await page.getByRole('button', {name: 'Switch to Ethereum Sepolia'}).click();
  await metamask.approveSwitchNetwork();
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('0x…').click();
  await page
    .getByPlaceholder('0x…')
    .fill('0xe0238Bb3efedf9c2ec581835D54122293740fC01');

  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByPlaceholder('Give your proposal a title').click();
  await page.getByPlaceholder('Give your proposal a title').fill('Add member');
  await page.getByPlaceholder('Describe your proposal in 2-3').click();
  await page
    .getByPlaceholder('Describe your proposal in 2-3')
    .fill('Add member');
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Publish proposal'}).click();
  await page.getByRole('button', {name: 'Create proposal now'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Open your proposal'}).click();
  await page.getByRole('button', {name: 'Approve and execute'}).click();
  await page.getByRole('button', {name: 'Approve and execute'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Continue to proposal'}).click();
});
