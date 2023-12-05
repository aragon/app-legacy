import CreateDAO from '../pages/CreateDAO';
import CreateProposal from '../pages/CreateProposal';
import LoginComponent from '../pages/LoginComponent';

describe('Test User Login', () => {
  it('Loads the Explore page', function () {
    cy.visit('/');
    cy.log('rc', this.runId, this.testData);
    const loginComponent = new LoginComponent();
    loginComponent.connectMetamask();
    loginComponent.shouldBeConnected();

    const createDAO = new CreateDAO();
    createDAO.goToCreateDAOPage();
    cy.wrap({...this.testData, x: 1}).as('testData');

    const createProposal = new CreateProposal();
    createProposal.goToCreateProposalPage();
    cy.wrap({...this.testData, x: 1}).as('testData');
  });
});
