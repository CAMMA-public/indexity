
describe('Cards view', () => {
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
    cy.get('app-video-list').find('.video-item-row').as('videoItems');
  });

  afterEach(() => {
    cy.resetVideos(localStorage.getItem('accessToken'));
  });

  describe('Manage Videos', () => {
    beforeEach(() => {
      cy.resetVideos(localStorage.getItem('accessToken'));
      cy.route('POST', 'videos/upload').as('uploadVideo');
      cy.get('@videoItems').should('have.length', 0);
      cy.uploadVideo(Cypress.env('sampleName'), 'input[type=file]');
      cy.wait('@uploadVideo');
    });

    it('should add a video', () => {
      cy.get('@videoItems').should('have.length', 1);
    });

    it('should load video after reconnection', () => {
      cy.get('@videoItems').should('have.length', 1);
      cy.get('[data-cy=logout-btn]').click();
      cy.location('pathname').should('not.include', 'annotations');
      cy.get('[data-cy=login-dialog-btn]').click();
      cy.get('input[name=email]').type(Cypress.env('adminEmail'));
      cy.get('input[name=password]').type(Cypress.env('adminPassword'));
      cy.get('[data-cy=login-btn]').click();
      cy.location('pathname').should('eq', '/annotations/videos');
      cy.contains(Cypress.env('sampleName'));
      cy.get('@videoItems').should('have.length', 1);
    });

    it('should remove a video', () => {
      cy.route('DELETE', 'videos/*').as('deleteVideo');
      cy.get('@videoItems').should('have.length', 1);
      cy.get('[data-cy=video-menu-btn]')
        .click();
      cy.get('[data-cy=delete-video-btn]')
        .click();
      cy.on('window:alert', str => {
        expect(str).to.equal(`Are you sure ?`);
      });
      cy.wait('@deleteVideo');
      cy.get('@videoItems').should('have.length', 0);
    });
  });

  it('should display the video name', () => {
    cy.contains(Cypress.env('sampleName'));
  });

  describe('Annotation progress', () => {
    it('should set the annotation progress to To annotate', () => {
      cy.route('POST', '/videos/*/setAnnotationPending').as('setAnnotationPending');
      cy.get('[data-cy="status-label"]').should('not.exist');
      cy.get('[data-cy="to-annotate-btn"]')
        .last().contains('TO ANNOTATE').click();
      cy.wait('@setAnnotationPending');
      cy.get('[data-cy="status-label"]').contains('TO ANNOTATE');
      cy.get('[data-cy="status-label"]').should('have.class', 'orange');
    });

    it('should set the annotation progress to Annotated', () => {
      cy.route('POST', '/videos/*/setAnnotationPending').as('setAnnotationPending');
      cy.route('POST', '/videos/*/setAnnotationFinished').as('setAnnotationFinished');
      cy.get('[data-cy="status-label"]').should('not.exist');
      cy.get('[data-cy="to-annotate-btn"]')
        .last().contains('TO ANNOTATE').click();
      cy.wait('@setAnnotationPending');
      cy.get('[data-cy="finish-annotating-btn"]')
        .last().contains('FINISH ANNOTATING').click();
      cy.wait('@setAnnotationFinished');
      cy.get('[data-cy="status-label"]').contains('ANNOTATED');
      cy.get('[data-cy="status-label"]').should('have.class', 'green');
    });

    describe('Annotating status', () => {
      context('Annotation status is not set', () => {
        it('should not set status', () => {
          const annotation = {
            videoId,
            shape: {
              positions: {
                '0': {
                  x: 2,
                  y: 9,
                  width: 32,
                  height: 26
                }
              }
            },
            category: 'svg',
            label: {
              name: 'test',
              color: '#b31111'
            },
            duration: 1000,
            timestamp: 0,
            isOneShot: false
          };
          cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
          cy.get('[data-cy="status-label"]').should('not.exist');
        });

        it('should set annotating status', () => {
          const annotation = {
            videoId,
            shape: {
              positions: {
                '0': {
                  x: 2,
                  y: 9,
                  width: 32,
                  height: 26
                }
              }
            },
            category: 'svg',
            label: {
              name: 'test',
              color: '#b31111'
            },
            duration: 1000,
            timestamp: 0,
            isOneShot: false
          };
          cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
          cy.get('[data-cy="status-label"]').should('not.exist');
          cy.route('POST', '/videos/*/setAnnotationPending').as('setAnnotationPending');
          cy.get('[data-cy="to-annotate-btn"]')
            .last().contains('TO ANNOTATE').click();
          cy.wait('@setAnnotationPending');
          cy.get('[data-cy="status-label"]').contains('ANNOTATING...');
          cy.get('[data-cy="status-label"]').should('have.class', 'blue');
        });
      });

      context('Annotation status is To annotate', () => {
        it('should set annotating status', () => {
          const annotation = {
            videoId,
            shape: {
              positions: {
                '0': {
                  x: 2,
                  y: 9,
                  width: 32,
                  height: 26
                }
              }
            },
            category: 'svg',
            label: {
              name: 'test',
              color: '#b31111'
            },
            duration: 1000,
            timestamp: 0,
            isOneShot: false
          };
          cy.route('POST', '/videos/*/setAnnotationPending').as('setAnnotationPending');
          cy.get('[data-cy="status-label"]').should('not.exist');
          cy.get('[data-cy="to-annotate-btn"]')
            .last().contains('TO ANNOTATE').click();
          cy.wait('@setAnnotationPending');
          cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
          cy.get('[data-cy="status-label"]').contains('ANNOTATING...');
          cy.get('[data-cy="status-label"]').should('have.class', 'blue');
        });
      });

      context('Annotation status is Annotated', () => {
        it('should set annotating status', () => {
          const annotation = {
            videoId,
            shape: {
              positions: {
                '0': {
                  x: 2,
                  y: 9,
                  width: 32,
                  height: 26
                }
              }
            },
            category: 'svg',
            label: {
              name: 'test',
              color: '#b31111'
            },
            duration: 1000,
            timestamp: 0,
            isOneShot: false
          };
          cy.route('POST', '/videos/*/setAnnotationPending').as('setAnnotationPending');
          cy.route('POST', '/videos/*/setAnnotationFinished').as('setAnnotationFinished');
          cy.get('[data-cy="status-label"]').should('not.exist');
          cy.get('[data-cy="to-annotate-btn"]')
            .last().contains('TO ANNOTATE').click();
          cy.wait('@setAnnotationPending');
          cy.get('[data-cy="finish-annotating-btn"]')
            .last().contains('FINISH ANNOTATING').click();
          cy.wait('@setAnnotationFinished');
          cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
          cy.get('[data-cy="status-label"]').contains('ANNOTATING...');
          cy.get('[data-cy="status-label"]').should('have.class', 'blue');
        });
      });
    });
  });

  describe('Bookmarks', () => {
    it('should bookmark the video', () => {
      cy.get(`[data-cy=bookmark-video-${videoId}-btn]`).click();
      cy.get('[data-cy=bookmarks-count]').contains('1');
      cy.get('[data-cy=bookmarks-tab]').click();
      cy.contains(Cypress.env('sampleName'));
    });

    it('should unbookmark the video', () => {
      cy.route('POST', 'videos/*/bookmark').as('addBookmark');
      cy.get(`[data-cy=bookmark-video-${videoId}-btn]`).click();
      cy.wait('@addBookmark');
      cy.get('[data-cy=bookmarks-tab]').click();
      cy.contains(Cypress.env('sampleName'));
      cy.route('DELETE', 'videos/*/bookmark').as('removeBookmark');
      cy.get('@videoItems').should('have.length', 1);
      cy.get(`[data-cy=bookmark-video-${videoId}-btn]`).last().click();
      cy.wait('@removeBookmark');
      cy.get('@videoItems').should('have.length', 0);
    });
  });

  describe('Filter', () => {
    describe('Name', () => {
      it('should find one result (full name)', () => {
        cy.get('input[name=name]').type(Cypress.env('sampleName'));
        cy.get('@videoItems').should('have.length', 1);
        cy.contains(Cypress.env('sampleName'));
      });

      it('should find one result (first letters)', () => {
        cy.get('input[name=name]').type(Cypress.env('sampleName').substr(0, 2));
        cy.get('@videoItems').should('have.length', 1);
        cy.contains(Cypress.env('sampleName'));
      });

      it('should find one result (last letters)', () => {
        cy.get('input[name=name]').type(Cypress.env('sampleName').split('.').pop());
        cy.get('@videoItems').should('have.length', 1);
        cy.contains(Cypress.env('sampleName'));
      });

      it('should find one result (middle letters)', () => {
        cy.get('input[name=name]').type(Cypress.env('sampleName').substr(1, 4));
        cy.get('@videoItems').should('have.length', 1);
        cy.contains(Cypress.env('sampleName'));
      });

      it('should find one result (one letter)', () => {
        cy.get('input[name=name]').type(Cypress.env('sampleName').substr(0, 1));
        cy.get('@videoItems').should('have.length', 1);
        cy.contains(Cypress.env('sampleName'));
      });

      it('should find no results (full name + space)', () => {
        cy.get('input[name=name]').type(`${Cypress.env('sampleName')} `);
        cy.get('@videoItems').should('have.length', 0);
      });

      it('should find no results (random typing)', () => {
        cy.get('input[name=name]').type('rgguifysfyqzdfvghq<');
        cy.get('@videoItems').should('have.length', 0);
      });

      it('should find one result (clear button click)', () => {
        cy.get('input[name=name]').type('rgguifysfyqzdfvghq<');
        cy.get('@videoItems').should('have.length', 0);
        cy.get('input[name=name]').clear();
        cy.contains(Cypress.env('sampleName'));
        cy.get('@videoItems').should('have.length', 1);
      });
    });

    describe('Annotation status', () => {
      beforeEach(() => {
        cy.get('[data-cy=filter-type-selector]').click();
        cy.get('[data-cy=filter-by-status-option]').click();
      });

      context('The video has no status', () => {
        beforeEach(() => {
          cy.get('[data-cy=select-progress-state]').click();
        });

        it('should filter by status TO ANNOTATE', () => {
          cy.get('.mat-select-panel').contains('TO ANNOTATE').click();
          cy.get('@videoItems').should('have.length', 0);
        });

        it('should filter by status ANNOTATING...', () => {
          cy.get('.mat-select-panel').contains('ANNOTATING...').click();
          cy.get('@videoItems').should('have.length', 0);
        });

        it('should filter by status ANNOTATED', () => {
          cy.get('.mat-select-panel').contains('ANNOTATED').click();
          cy.get('@videoItems').should('have.length', 0);
        });

        it('should clear status filter', () => {
          cy.get('.mat-select-panel').contains('ANNOTATED').click();
          cy.get('@videoItems').should('have.length', 0);
          cy.get('[data-cy="clear-btn"]').click();
          cy.get('@videoItems').should('have.length', 1);
        });
      });

      context('The video has "To annotate" status', () => {
        beforeEach(() => {
          cy.route('POST', '/videos/*/setAnnotationPending').as('setAnnotationPending');
          cy.get('[data-cy="to-annotate-btn"]')
            .last().contains('TO ANNOTATE').click();
          cy.wait('@setAnnotationPending');
          cy.get('[data-cy=select-progress-state]').click();
        });

        it('should filter by status TO ANNOTATE', () => {
          cy.get('.mat-select-panel').contains('TO ANNOTATE').click();
          cy.get('@videoItems').should('have.length', 1);
        });

        it('should filter by status ANNOTATING...', () => {
          cy.get('.mat-select-panel').contains('ANNOTATING...').click();
          cy.get('@videoItems').should('have.length', 0);
        });

        it('should filter by status ANNOTATED', () => {
          cy.get('.mat-select-panel').contains('ANNOTATED').click();
          cy.get('@videoItems').should('have.length', 0);
        });

        it('should clear status filter', () => {
          cy.get('.mat-select-panel').contains('ANNOTATED').click();
          cy.get('@videoItems').should('have.length', 0);
          cy.get('[data-cy="clear-btn"]').click();
          cy.get('@videoItems').should('have.length', 1);
        });
      });

      context('The video has "Annotated" status', () => {
        beforeEach(() => {
          cy.route('POST', '/videos/*/setAnnotationPending').as('setAnnotationPending');
          cy.route('POST', '/videos/*/setAnnotationFinished').as('setAnnotationFinished');
          cy.get('[data-cy="to-annotate-btn"]')
            .last().contains('TO ANNOTATE').click();
          cy.wait('@setAnnotationPending');
          cy.get('[data-cy="finish-annotating-btn"]')
            .last().contains('FINISH ANNOTATING').click();
          cy.wait('@setAnnotationFinished');
          cy.get('[data-cy=select-progress-state]').click();
        });

        it('should filter by status TO ANNOTATE', () => {
          cy.get('.mat-select-panel').contains('TO ANNOTATE').click();
          cy.get('@videoItems').should('have.length', 0);
        });

        it('should filter by status ANNOTATING...', () => {
          cy.get('.mat-select-panel').contains('ANNOTATING...').click();
          cy.get('@videoItems').should('have.length', 0);
        });

        it('should filter by status ANNOTATED', () => {
          cy.get('.mat-select-panel').contains('ANNOTATED').click();
          cy.get('@videoItems').should('have.length', 1);
        });

        it('should clear status filter', () => {
          cy.get('.mat-select-panel').contains('TO ANNOTATE').click();
          cy.get('@videoItems').should('have.length', 0);
          cy.get('[data-cy="clear-btn"]').click();
          cy.get('@videoItems').should('have.length', 1);
        });
      });

      context('The video has "Annotating" status', () => {
        beforeEach(() => {
          cy.route('POST', '/videos/*/setAnnotationPending').as('setAnnotationPending');
          cy.get('[data-cy="to-annotate-btn"]')
            .last().contains('TO ANNOTATE').click();
          cy.wait('@setAnnotationPending');
          const annotation = {
            videoId,
            shape: {
              positions: {
                '0': {
                  x: 2,
                  y: 9,
                  width: 32,
                  height: 26
                }
              }
            },
            category: 'svg',
            label: {
              name: 'test',
              color: '#b31111'
            },
            duration: 1000,
            timestamp: 0,
            isOneShot: false
          };
          cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
          cy.get('[data-cy=select-progress-state]').click();
        });

        it('should filter by status TO ANNOTATE', () => {
          cy.get('.mat-select-panel').contains('TO ANNOTATE').click();
          cy.get('@videoItems').should('have.length', 0);
        });

        it('should filter by status ANNOTATING...', () => {
          cy.get('.mat-select-panel').contains('ANNOTATING...').click();
          cy.get('@videoItems').should('have.length', 1);
        });

        it('should filter by status ANNOTATED', () => {
          cy.get('.mat-select-panel').contains('ANNOTATED').click();
          cy.get('@videoItems').should('have.length', 0);
        });

        it('should clear status filter', () => {
          cy.get('.mat-select-panel').contains('TO ANNOTATE').click();
          cy.get('@videoItems').should('have.length', 0);
          cy.get('[data-cy="clear-btn"]').click();
          cy.get('@videoItems').should('have.length', 1);
        });
      });
    });

    describe('Label', () => {
      // TODO
    });
  });
});
