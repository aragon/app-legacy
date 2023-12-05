export default class Createproposal {
  goToCreateProposalPage() {
    // Clicks Create proposal on DAO Dashboard
    cy.get('button').contains('Create proposal').click();

    // Fills out Proposal Details and clicks Next
    cy.get('input[name="proposalTitle"]').type(
      'Lets go to the beach this afternoon'
    );
    cy.get('textarea[name="proposalSummary"]').type(
      'The weather is cracking good, so feeling like a dive'
    );
    cy.get('div[class="ProseMirror"]').type(
      'The weather is cracking good, so feeling like a dive. Would be great if you guys join as well'
    );
    cy.get('input[name="links.0.name"]').type('ThaBeach');
    cy.get('input[name="links.0.url"]').type(
      'https://blog.akbartravels.com/wp-content/uploads/2017/11/100-38.png'
    );
    cy.get('button').contains('Next').click();

    // Does not edit default proposal voting settings and clicks Next
    cy.get('button').contains('Next').click();

    // Does not include proposal action and click Next
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Publish proposal').click();

    // Approves the tx from the modal
    cy.get('button[mode="primary"]')
      .contains('Create proposal now')
      .parent()
      .should('not.be.disabled')
      .click();

    // Brings up the MetaMask tx window and clicks confirm
    cy.confirmMetamaskTransaction();
    cy.switchToCypressWindow();

    // Waits till the tx completes by checking the state of the primary button the tx modal and continues to Proposal page
    cy.get('button').contains('Open your proposal').click();
    cy.wait(5000);
  }
}
