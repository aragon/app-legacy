export default class ConnectComponent {
    /** Actions to connect Metamask wallet to app */
    connectMetamask() {
        cy.get('nav button').click();
        cy.get('.web3modal-provider-container').first().click();
        cy.switchToMetamaskWindow();
        cy.acceptMetamaskAccess().should('be.true');
        cy.switchToCypressWindow();
    }

    /** Asserts the wallet should be connected */
    shouldBeConnected() {
        cy.get('nav button span').should('include.text', '0x');
    }
}