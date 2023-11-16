export default class ConnectComponent {
  /** Actions to connect Metamask wallet to app */
  connectMetamask() {
    cy.get('nav button:last').click();
    cy.get('w3m-modal')
      .shadow()
      .find('w3m-modal-router')
      .shadow()
      .find('w3m-connect-wallet-view')
      .shadow()
      .find('w3m-desktop-wallet-selection')
      .shadow()
      .find('w3m-wallet-button[name="MetaMask"')
      .shadow()
      .find('button')
      .click();
    cy.wait(1000);
    cy.switchToMetamaskWindow();
    cy.acceptMetamaskAccess().should('be.true');
    cy.switchToCypressWindow();
  }

  /** Asserts the wallet should be connected */
  shouldBeConnected() {
    cy.get('nav button span').should('include.text', '0x');
  }
}
