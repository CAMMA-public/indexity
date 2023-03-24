describe('Navigation', () => {
  describe('Routes', () => {
    context('No user logged', () => {
      beforeEach(() => {
        cy.visit('/');
      });

      it('should access home page', () => {
        cy.location('pathname').should('eq', '/');
        cy.contains('indexity');
      });

      it('should access videos index (log in)', () => {
        cy.get('[data-cy=login-dialog-btn]').click();
        cy.get('input[name=email]').type(Cypress.env('adminEmail'));
        cy.get('input[name=password]').type(`${Cypress.env('adminPassword')}{enter}`);
        cy.get('app-login-form').should('not.exist');
        cy.location('pathname').should('eq', '/annotations/videos');
      });

      it('should not leave videos index (back)', () => {
        cy.get('[data-cy=login-dialog-btn]').click();
        cy.get('input[name=email]').type(Cypress.env('adminEmail'));
        cy.get('input[name=password]').type(`${Cypress.env('adminPassword')}{enter}`);
        cy.location('pathname').should('eq', '/annotations/videos');
        cy.go('back');
        cy.location('pathname').should('eq', '/annotations/videos');
      });
    });


    context('User logged', () => {
      beforeEach(() => {
        cy.server().route('GET', 'videos**').as('getVideos');
        cy.logAdmin();
        cy.visit('/');
        cy.wait('@getVideos');
      });

      it('should access videos page', () => {
        cy.location('pathname').should('eq', '/annotations/videos');
      });

      it('should access home page (log out)', () => {
        cy.get('[data-cy=logout-btn]').click();
        cy.location('pathname').should('not.include', 'annotations');
        cy.get('[data-cy=login-dialog-btn]').should('be.visible');
        cy.location('pathname').should('eq', '/');
        cy.contains('Indexity');
      });

      context('Video uploaded', () => {
        let videoId = null;
        beforeEach(() => {
          cy.uploadSample()
            .its('responseBody')
            .then(body => {
              if (body && body.length && body[0].id) {
                videoId = body[0].id;
              }
            });
        });

        afterEach(() => {
          cy.resetVideos(localStorage.getItem('accessToken'));
        });

        // it('should navigate to the video (thumbnail click)', () => {
        //   // TODO: wait for the thumbnail to be generated
        //   cy.get(`[data-cy=video-${videoId}-thumbnail]`).click({force: true});
        //   cy.location('pathname').should('eq', `/annotations/videos/${videoId}`);
        // });

        it('should navigate to the video (button click)', () => {
          cy.get(`[data-cy=show-video-${videoId}-btn]`).click();
          cy.location('pathname').should('eq', `/annotations/videos/${videoId}`);
        });

        it('should go back to videos index (home button click)', () => {
          cy.get(`[data-cy=show-video-${videoId}-btn]`).click();
          cy.location('pathname').should('eq', `/annotations/videos/${videoId}`);
          cy.get('[data-cy=menu-btn]').click();
          cy.get('[data-cy=nav-videos-btn]').click();
          cy.location('pathname').should('eq', '/annotations/videos');
        });

        it('should go back to videos index (back)', () => {
          cy.get(`[data-cy=show-video-${videoId}-btn]`).click();
          cy.location('pathname').should('eq', `/annotations/videos/${videoId}`);
          cy.go('back');
          cy.location('pathname').should('eq', '/annotations/videos');
        });
      });
    });

  });

  describe('Query params', () => {
    let videoId = null;
    before(() => {
      cy.logAdmin();
      cy.persistSession('accessToken');
    });

    beforeEach(() => {
      cy.server().route('GET', 'videos**').as('getVideos');
      cy.restoreSession('accessToken');
      cy.visit('/');
      cy.wait('@getVideos');
      cy.uploadSample()
        .its('responseBody')
        .then(body => {
          if (body && body.length && body[0].id) {
            videoId = body[0].id;
          }
        });
    });

    afterEach(() => {
      cy.resetVideos(localStorage.getItem('accessToken'));
    });

    describe('tab', () => {
      context('Cards view', () => {
        it('should set tab to bookmarks', () => {
          cy.get('[data-cy=bookmarks-tab]').click();
          cy.location('pathname').should('eq', '/annotations/videos');
          cy.location('search').should('include', 'tab=bookmarks');
        });

        it('should remove tab = bookmarks', () => {
          cy.get('[data-cy=bookmarks-tab]').click();
          cy.location('pathname').should('eq', '/annotations/videos');
          cy.location('search').should('include', 'tab=bookmarks');
          cy.get('[data-cy=all-videos-tab]').click();
          cy.location('pathname').should('eq', '/annotations/videos');
          cy.location('search').should('not.include', 'tab');
        });

        it('should keep tab in query params when navigating to a video (back)', () => {
          cy.get(`[data-cy=bookmark-video-${videoId}-btn]`).click();
          cy.get('[data-cy=bookmarks-count]').contains('1');
          cy.get('[data-cy=bookmarks-tab]').click();
          cy.location('pathname').should('eq', '/annotations/videos');
          cy.location('search').should('include', 'tab=bookmarks');
          cy.get(`[data-cy=show-video-${videoId}-btn]`).last().click();
          cy.location('pathname').should('eq', `/annotations/videos/${videoId}`);
          cy.location('search').should('include', 'tab=bookmarks');
          cy.go('back');
          cy.location('pathname').should('eq', '/annotations/videos');
          cy.location('search').should('include', 'tab=bookmarks');
        });

        it('should keep tab in query params when navigating to a video (home button)', () => {
          cy.get(`[data-cy=bookmark-video-${videoId}-btn]`).click();
          cy.get('[data-cy=bookmarks-count]').contains('1');
          cy.get('[data-cy=bookmarks-tab]').click();
          cy.location('pathname').should('eq', '/annotations/videos');
          cy.location('search').should('include', 'tab=bookmarks');
          cy.get(`[data-cy=show-video-${videoId}-btn]`).last().click();
          cy.location('pathname').should('eq', `/annotations/videos/${videoId}`);
          cy.location('search').should('include', 'tab=bookmarks');
          cy.get('[data-cy=menu-btn]').click();
          cy.get('[data-cy=nav-videos-btn]').click();
          cy.location('pathname').should('eq', '/annotations/videos');
          cy.location('search').should('include', 'tab=bookmarks');
        });
      });
    });
  });
});
