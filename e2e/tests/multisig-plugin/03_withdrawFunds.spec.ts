import {testWithMetaMask as test} from '../../testWithMetaMask';

// Test is publishing, approving, and executing a withdrawal of DAO funds
test('Withdraw DAO funds proposal', async ({
  context,
  page,
  extensionId,
  metamask,
}) => {
  await page.goto(
    'http://localhost:5173/#/daos/sepolia/0xc477632e39f44e19612611a0113d476f15ef0e84/dashboard'
  );
  await page.getByRole('button', {name: 'Accept all'}).click();
  await page.getByRole('button', {name: 'Connect wallet'}).click();
  await page.getByRole('button', {name: 'Connect wallet now'}).click();
  await page.getByRole('button', {name: 'MetaMask MetaMask'}).nth(0).click();
  await metamask.connectToDapp();
  await page.getByRole('button', {name: 'New transfer'}).click();
  await page.getByRole('button', {name: 'Withdraw assets Create a'}).click();
  await page.getByRole('button', {name: 'Switch to Ethereum Sepolia'}).click();
  await metamask.approveSwitchNetwork();
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('0x…').click();
  await page
    .getByPlaceholder('0x…')
    .fill('0xe3852100ff1a69c2cfdb7848cdd5953a63f86a6f');
  await page.getByTestId('dropdown-input').click();
  await page.getByText('Wrapped Ether').click();
  await page.getByTestId('input-value').getByPlaceholder('0').click();
  await page
    .getByTestId('input-value')
    .getByPlaceholder('0')
    .fill('0.00163632');
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByPlaceholder('Give your proposal a title').click();
  await page
    .getByPlaceholder('Give your proposal a title')
    .fill('Withdraw funds');
  await page.getByPlaceholder('Describe your proposal in 2-3').click();
  await page
    .getByPlaceholder('Describe your proposal in 2-3')
    .fill('Withdraw funds');
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
