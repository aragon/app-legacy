describe('Test User Login', () => {
  it('Loads the Explore page', () => {
    cy.visit('/');
    cy.get('nav button').click();
    cy.get('.web3modal-provider-container').first().click();
    cy.switchToMetamaskWindow();
    cy.acceptMetamaskAccess().should('be.true');
    cy.switchToCypressWindow();
    cy.get('nav button span').should('include.text', '0x0');
  });
});
