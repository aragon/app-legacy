import LoginComponent from "../pages/LoginComponent";

describe('Test User Login', () => {
  it('Loads the Explore page', () => {
    cy.visit('/');
    const loginComponent = new LoginComponent();
    loginComponent.connectMetamask();
    loginComponent.shouldBeConnected();
  });
});
