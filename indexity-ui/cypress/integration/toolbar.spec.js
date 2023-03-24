describe('Toolbar', () => {
  before(() => {
    cy.logAdmin();
    cy.persistSession('accessToken');
  });

  beforeEach(() => {
    cy.restoreSession('accessToken');
    cy.visit('/');
  });

  it('should display app title', () => {
    cy.get('[data-cy=toolbar-title]').should('have.text', 'indexity');
  });

  it('should display video name', () => {
    cy.uploadSample().its('responseBody').then(body => {
      cy.server().route('GET', 'videos/*/annotations').as('getAnnotations');
      cy.get(`[data-cy=show-video-${body[0].id}-btn]`)
        .click();
      cy.wait('@getAnnotations');
      cy.location('pathname').should('eq', `/annotations/videos/${body[0].id}`);
      cy.get('[data-cy=toolbar-title]').should('not.have.text', 'indexity');
      cy.go('back');
      cy.get('[data-cy=toolbar-title]').should('have.text', 'indexity');
      cy.location('pathname').should('eq', '/annotations/videos');
      cy.resetVideos(localStorage.getItem('accessToken'));
    });
  });

  it('should log out', () => {
    cy.get('[data-cy=logout-btn]').click();
    cy.location('pathname').should('not.include', 'annotations');
    cy.get('[data-cy=login-dialog-btn]').should('be.visible');
  });
});
