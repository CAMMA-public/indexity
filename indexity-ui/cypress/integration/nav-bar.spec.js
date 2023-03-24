describe('Nav bar', () => {
  before(() => {
    cy.logAdmin();
    cy.persistSession('accessToken');
  });

  beforeEach(() => {
    cy.restoreSession('accessToken');
    cy.visit('/');
    cy.get('[data-cy=menu-btn]').click();
  });

  it('should display user name', () => {
    cy.get('[data-cy=nav-bar]').contains(Cypress.env('adminName'));
  });

  describe('Help', () => {
    beforeEach(() => {
      cy.get('[data-cy=nav-help-btn]').click();
    });

    it('should open help dialog', () => {
      cy.contains('HELP');
      cy.get('app-help').should('exist');
    });

    it('should close help dialog', () => {
      cy.get('app-help').should('exist');
      cy.get('.cdk-overlay-backdrop').click('topRight', {force: true});
      cy.get('app-help').should('not.exist');
    });
  });

  describe('Settings', () => {
    beforeEach(() => {
      cy.get('[data-cy=nav-settings-btn]').click();
    });

    it('should open settings', () => {
      cy.contains('SETTINGS');
      cy.get('app-settings').should('exist');
    });

    it('should close settings', () => {
      cy.get('app-settings').should('exist');
      cy.get('.cdk-overlay-backdrop').click('topRight', {force: true});
      cy.get('app-settings').should('not.exist');
    });

    it('should close settings (submit)', () => {
      cy.get('app-settings').should('exist');
      cy.get('[data-cy=submit-settings]').click();
      cy.get('app-settings').should('not.exist');
    });

    it('should close settings (cancel)', () => {
      cy.get('app-settings').should('exist');
      cy.get('app-settings button').first().click();
      cy.get('app-settings').should('not.exist');
    });
  });
});
