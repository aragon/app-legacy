export default class CreateDAO {
  goToCreateDAOPage() {
    cy.visit('/#/create');

    // Accept all cookies
    cy.get('button').contains('Accept all').click();

    // Clicks Build your DAO on DAO Overview page
    cy.get('button').contains('Build your DAO').click();

    // Fills out the Select Chain form and proceeds to the next page
    cy.get('button').contains('Testnet').click();
    cy.get('p')
      .contains(/^Ethereum Sepolia$/)
      .click();
    cy.get('button').contains('Next').click();

    // Fills out mandatory fields on the Define DAO metadata page and proceeds to the next page
    cy.get('input[name="daoName"]').type('Tunesia Offsite DAO');
    // cy.get('input[name="daoEnsName"]').type(Date.now().toString());
    cy.get('textarea[name="daoSummary"]').type(
      'DAO to come to democratic group decisions during our offsite'
    );
    cy.get('button')
      .contains('Next')
      .parent()
      .should('not.be.disabled')
      .click();

    // Selects multisig DAO type(with current user automatically added as a member) and clicks Next
    cy.get('p')
      .contains(/^Multisig members$/)
      .click();
    cy.get('button')
      .contains('Next')
      .parent()
      .should('not.be.disabled')
      .click();

    // Proceeds to next step with minimum approval automatically set as 1
    cy.get('button')
      .contains('Next')
      .parent()
      .should('not.be.disabled')
      .click();

    // Select all checkboxes on review page and clicks the primary button
    cy.get('p')
      .should('contain', 'These values are correct')
      .each(el => el.trigger('click'));
    cy.get('button')
      .contains('Deploy your DAO')
      .parent()
      .should('not.be.disabled')
      .click();

    // Approve the tx from the modal
    cy.get('button')
      .contains('Approve transaction')
      .parent()
      .should('not.be.disabled')
      .click();

    // Brings up the MetaMask tx window and clicks confirm
    cy.confirmMetamaskTransaction();
    cy.switchToCypressWindow();

    // Waits till the tx completes by checking the state of the primary button the tx modal and continues to DAO Dashboard
    cy.get('button').contains('Launch DAO Dashboard').click();
    cy.wait(5000);
  }
}
