export default class CreateDAO {
  goToCreateDAOPage() {
    cy.visit('/#/create');

    // Clicks Build your DAO on DAO Overview page
    cy.get('button').contains('Build your DAO').click();

    // Fills out the Select Chain form and proceeds to the next page
    cy.get('button').contains('Testnet').click();
    cy.get('p')
      .contains(/^Goerli$/)
      .click();
    cy.get('button').contains('Next').click();

    // Fills out mandatory fields on the Define DAO metadata page and proceeds to the next page
    cy.get('input[name="daoName"]').type('Cypress test');
    cy.get('input[name="daoEnsName"]').type(Date.now().toString());
    cy.get('textarea[name="daoSummary"]').type(
      'Cypress test to test Multisig DAO Creation'
    );
    cy.get('button[mode="primary"]')
      .contains('Next')
      .parent()
      .should('not.be.disabled')
      .click();

    // Selects multisig DAO type(with current user automatically added as a member) and clicks Next
    cy.get('p')
      .contains(/^Multisig members$/)
      .click();
    cy.get('button[mode="primary"]')
      .contains('Next')
      .parent()
      .should('not.be.disabled')
      .click();

    // Proceeds to next step with minimum approval automatically set as 1
    cy.get('button[mode="primary"]')
      .contains('Next')
      .parent()
      .should('not.be.disabled')
      .click();

    // Select all checkboxes on review page and clicks the primary button
    cy.get('p')
      .should('contain', 'These values are correct')
      .each(el => el.trigger('click'));
    cy.get('button[mode="primary"]')
      .contains('Deploy your DAO')
      .parent()
      .should('not.be.disabled')
      .click();

    // Approve the tx from the modal
    cy.get('button[mode="primary"]')
      .contains('Approve transaction')
      .parent()
      .should('not.be.disabled')
      .click();

    // Brings up the MetaMask tx window and clicks confirm
    cy.confirmMetamaskTransaction();
    cy.switchToCypressWindow();

    // Waits till the tx completes by checking the state of the primary button the tx modal
    cy.get('button[mode="primary"]').contains('Launch DAO Dashboard');

    cy.wait(5000);
  }
}
