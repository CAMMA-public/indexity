
describe('Settings', () => {
  let videoId = null;
  beforeEach(() => {
    cy.server().route('GET', 'videos**').as('getVideos');
    cy.logAdmin();
    cy.visit('/');
    cy.wait('@getVideos');
    cy.uploadSample()
      .its('responseBody')
      .then(body => {
        if (body && body.length && body[0].id) {
          videoId = body[0].id;
          cy.route('GET', 'videos/*/annotations').as('getAnnotations');
          cy.get(`[data-cy=show-video-${videoId}-btn]`)
            .click();
          cy.wait('@getAnnotations');
        }
      });
  });

  afterEach(() => {
    cy.resetVideos(localStorage.getItem('accessToken'));
  });

  it('should open the settings', () => {
    cy.get('[data-cy=menu-btn]').click();
    cy.get('[data-cy=nav-settings-btn]').click();
    cy.get('app-settings').should('exist');
  });

  describe('Annotations', () => {
    beforeEach(() => {
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-settings-btn]').click();
    });

    it('should activate import', () => {
      cy.get('[data-cy=annotations-accordion-header]').should('have.class', 'mat-expanded');
      cy.get('[data-cy=import-annotations-btn]').should('not.exist');
      cy.get('[data-cy=activate-json-import-toggle]').should('not.have.class', 'mat-checked');
      cy.get('[data-cy=activate-json-import-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
      cy.get('[data-cy=activate-json-import-toggle]').should('have.class', 'mat-checked');
      cy.get('[data-cy=submit-settings]').click();
      cy.get('[data-cy=import-annotations-btn]').should('exist');
    });

    it('should deactivate import', () => {
      cy.get('[data-cy=annotations-accordion-header]').should('have.class', 'mat-expanded');
      cy.get('[data-cy=import-annotations-btn]').should('not.exist');
      cy.get('[data-cy=activate-json-import-toggle]').should('not.have.class', 'mat-checked');
      cy.get('[data-cy=activate-json-import-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
      cy.get('[data-cy=activate-json-import-toggle]').should('have.class', 'mat-checked');
      cy.get('[data-cy=submit-settings]').click();
      cy.get('[data-cy=import-annotations-btn]').should('exist');
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-settings-btn]').click();
      cy.get('[data-cy=activate-json-import-toggle]').should('have.class', 'mat-checked');
      cy.get('[data-cy=activate-json-import-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
      cy.get('[data-cy=activate-json-import-toggle]').should('not.have.class', 'mat-checked');
      cy.get('[data-cy=submit-settings]').click();
      cy.get('[data-cy=import-annotations-btn]').should('not.exist');
    });

    it('should activate export', () => {
      cy.get('[data-cy=annotations-accordion-header]').should('have.class', 'mat-expanded');
      cy.get('[data-cy=export-annotations-btn]').should('not.exist');
      cy.get('[data-cy=activate-json-export-toggle]').should('not.have.class', 'mat-checked');
      cy.get('[data-cy=activate-json-export-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
      cy.get('[data-cy=activate-json-export-toggle]').should('have.class', 'mat-checked');
      cy.get('[data-cy=submit-settings]').click();
      cy.get('[data-cy=export-annotations-btn]').should('exist');
    });

    it('should deactivate export', () => {
      cy.get('[data-cy=annotations-accordion-header]').should('have.class', 'mat-expanded');
      cy.get('[data-cy=export-annotations-btn]').should('not.exist');
      cy.get('[data-cy=activate-json-export-toggle]').should('not.have.class', 'mat-checked');
      cy.get('[data-cy=activate-json-export-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
      cy.get('[data-cy=activate-json-export-toggle]').should('have.class', 'mat-checked');
      cy.get('[data-cy=submit-settings]').click();
      cy.get('[data-cy=export-annotations-btn]').should('exist');
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-settings-btn]').click();
      cy.get('[data-cy=activate-json-export-toggle]').should('have.class', 'mat-checked');
      cy.get('[data-cy=activate-json-export-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
      cy.get('[data-cy=activate-json-export-toggle]').should('not.have.class', 'mat-checked');
      cy.get('[data-cy=submit-settings]').click();
      cy.get('[data-cy=export-annotations-btn]').should('not.exist');
    });
  });

  describe('Video', () => {
    it('should have frame step set to 10', () => {
      // Frame step = 10 (1000 / 10 = 100)
      cy.location('search').should('include', 't=0');
      cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
      cy.location('search').should('include', 't=100');
    });

    // TODO: change frame step
  });

  describe('Labels', () => {
    it('should hide labels', () => {
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
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => {
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('exist');
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('have.text', annotation.label.name);
          cy.get('[data-cy=menu-btn]').click();
          cy.get('[data-cy=nav-settings-btn]').click();
          cy.get('[data-cy=labels-accordion-header]').should('not.have.class', 'mat-expanded');
          cy.get('[data-cy=labels-accordion-header]').click();
          cy.get('[data-cy=labels-accordion-header]').should('have.class', 'mat-expanded');
          cy.get('[data-cy=show-labels-toggle]').should('have.class', 'mat-checked');
          cy.get('[data-cy=show-labels-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
          cy.get('[data-cy=show-labels-toggle]').should('not.have.class', 'mat-checked');
          cy.get('[data-cy=submit-settings]').click();
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('not.exist');
        });
    });

    it('should show labels', () => {
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
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => {
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('exist');
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('have.text', annotation.label.name);
          cy.get('[data-cy=menu-btn]').click();
          cy.get('[data-cy=nav-settings-btn]').click();
          cy.get('[data-cy=labels-accordion-header]').should('not.have.class', 'mat-expanded');
          cy.get('[data-cy=labels-accordion-header]').click();
          cy.get('[data-cy=labels-accordion-header]').should('have.class', 'mat-expanded');
          cy.get('[data-cy=show-labels-toggle]').should('have.class', 'mat-checked');
          cy.get('[data-cy=show-labels-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
          cy.get('[data-cy=show-labels-toggle]').should('not.have.class', 'mat-checked');
          cy.get('[data-cy=submit-settings]').click();
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('not.exist');
          cy.get('[data-cy=menu-btn]').click();
          cy.get('[data-cy=nav-settings-btn]').click();
          cy.get('[data-cy=labels-accordion-header]').should('not.have.class', 'mat-expanded');
          cy.get('[data-cy=labels-accordion-header]').click();
          cy.get('[data-cy=labels-accordion-header]').should('have.class', 'mat-expanded');
          cy.get('[data-cy=show-labels-toggle]').should('not.have.class', 'mat-checked');
          cy.get('[data-cy=show-labels-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
          cy.get('[data-cy=show-labels-toggle]').should('have.class', 'mat-checked');
          cy.get('[data-cy=submit-settings]').click();
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('exist');
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('have.text', annotation.label.name);
        });
    });

    it('should deactivate labels', () => {
      cy.get('[data-cy=drawing-mode-btn]').click();
      cy.get('[data-cy=svg-delimiter]').click();
      cy.get('surg-svg-annotation-form-dialog').should('exist');
      cy.get('[data-cy=cancel-label-form]').click({force: true});
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-settings-btn]').click();
      cy.get('[data-cy=labels-accordion-header]').should('not.have.class', 'mat-expanded');
      cy.get('[data-cy=labels-accordion-header]').click();
      cy.get('[data-cy=labels-accordion-header]').should('have.class', 'mat-expanded');
      cy.get('[data-cy=activate-labels-toggle]').should('have.class', 'mat-checked');
      cy.get('[data-cy=activate-labels-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
      cy.get('[data-cy=activate-labels-toggle]').should('not.have.class', 'mat-checked');
      cy.get('[data-cy=submit-settings]').click();
      cy.get('[data-cy=drawing-mode-btn]').click();
      cy.get('[data-cy=svg-delimiter]').click();
      cy.get('surg-svg-annotation-form-dialog').should('not.exist');
    });

    it('should activate labels', () => {
      cy.get('[data-cy=drawing-mode-btn]').click();
      cy.get('[data-cy=svg-delimiter]').click();
      cy.get('surg-svg-annotation-form-dialog').should('exist');
      cy.get('[data-cy=cancel-label-form]').click({force: true});
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-settings-btn]').click();
      cy.get('[data-cy=labels-accordion-header]').should('not.have.class', 'mat-expanded');
      cy.get('[data-cy=labels-accordion-header]').click();
      cy.get('[data-cy=labels-accordion-header]').should('have.class', 'mat-expanded');
      cy.get('[data-cy=activate-labels-toggle]').should('have.class', 'mat-checked');
      cy.get('[data-cy=activate-labels-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
      cy.get('[data-cy=activate-labels-toggle]').should('not.have.class', 'mat-checked');
      cy.get('[data-cy=submit-settings]').click();
      cy.get('[data-cy=drawing-mode-btn]').click();
      cy.get('[data-cy=svg-delimiter]').click();
      cy.get('surg-svg-annotation-form-dialog').should('not.exist');
      cy.get('body').trigger('keydown', { which: 27, key: 'Escape', keyCode: 27 });
      cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
      // Open settings
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-settings-btn]').click();
      // Open accordion
      cy.get('[data-cy=labels-accordion-header]').should('not.have.class', 'mat-expanded');
      cy.get('[data-cy=labels-accordion-header]').click();
      cy.get('[data-cy=labels-accordion-header]').should('have.class', 'mat-expanded');
      // Check toggle
      cy.get('[data-cy=activate-labels-toggle]').should('not.have.class', 'mat-checked');
      cy.get('[data-cy=activate-labels-toggle] > .mat-slide-toggle-label > .mat-slide-toggle-bar').click({force: true});
      cy.get('[data-cy=activate-labels-toggle]').should('have.class', 'mat-checked');
      // Submit settings
      cy.get('[data-cy=submit-settings]').click();
      cy.get('[data-cy=drawing-mode-btn]').click();
      cy.get('[data-cy=svg-delimiter]').click();
      cy.get('surg-svg-annotation-form-dialog').should('exist');
    });
  });
});
