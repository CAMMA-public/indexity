
describe('Videos (Admin)', () => {
  before(() => {
    cy.logAdmin();
    cy.persistSession('accessToken');
  });

  beforeEach(() => {
    cy.server().route('GET', 'videos**').as('getVideos');
    cy.restoreSession('accessToken');
    cy.visit('/');
    cy.wait('@getVideos');
  });

  it('should show videos page', () => {
    cy.location('pathname').should('eq', '/annotations/videos');
  });

  it('should navigate to bookmarks', () => {
    cy.get('[data-cy=bookmarks-tab]').click();
    cy.location('pathname').should('eq', '/annotations/videos');
    cy.location('search').should('include', 'tab=bookmarks');
  });
});
