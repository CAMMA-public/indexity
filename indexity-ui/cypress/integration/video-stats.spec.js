
describe('Stats', () => {
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

  context('No annotations', () => {
    it('should initialize the stats', () => {
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('not.have.class', 'mat-expanded');
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).click();
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('have.class', 'mat-expanded');
      cy.get(`[data-cy=video-${videoId}-annotations-count]`).should('have.text', '0');
      cy.get(`[data-cy=video-${videoId}-labels-count]`).should('have.text', '0');
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).should('have.length', 0);
      cy.get(`[data-cy=video-${videoId}-users-count]`).should('have.text', '0');
      cy.get(`[data-cy=video-${videoId}-users] .user-container`).should('have.length', 0);
    });
  });

  context('One annotation', () => {
    let annotation = {
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
    beforeEach(() => {
      annotation = {
        ...annotation,
        videoId
      };
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation).then(console.log);
      cy.get(`[data-cy=show-video-${videoId}-btn]`)
        .click();
      cy.location('pathname').should('eq', `/annotations/videos/${videoId}`);
      cy.get('[data-cy=toolbar-title]').should('not.have.text', 'indexity');
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-videos-btn]').click();
      cy.location('pathname').should('eq', '/annotations/videos');
      cy.get('[data-cy=toolbar-title]').should('have.text', 'indexity');
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('not.have.class', 'mat-expanded');
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).click();
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('have.class', 'mat-expanded');
    });

    it('should set labels stats', () => {
      cy.get(`[data-cy=video-${videoId}-labels-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).should('have.length', 1);
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).contains(annotation.label.name);
      // cy.get(`[data-cy=video-${videoId}-labels] .label-color`).should('have.css', 'background-color', annotation.label.color);
    });

    it('should set annotations stats', () => {
      cy.get(`[data-cy=video-${videoId}-annotations-count]`).should('have.text', '1');
    });

    it('should set users stats', () => {
      cy.get(`[data-cy=video-${videoId}-users-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-users] .user-container`).should('have.length', 1);
      cy.get(`[data-cy=video-${videoId}-users] .username`).should('have.text', Cypress.env('adminName'));
    });
  });

  context('Two annotations (same label)', () => {
    let annotation = {
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
    beforeEach(() => {
      annotation = {
        ...annotation,
        videoId
      };
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
      cy.get(`[data-cy=show-video-${videoId}-btn]`)
        .click();
      cy.get('[data-cy=toolbar-title]').should('not.have.text', 'indexity');
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-videos-btn]').click();
      cy.get('[data-cy=toolbar-title]').should('have.text', 'indexity');
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('not.have.class', 'mat-expanded');
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).click();
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('have.class', 'mat-expanded');
    });

    it('should set labels stats', () => {
      cy.get(`[data-cy=video-${videoId}-labels-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).should('have.length', 1);
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).contains(annotation.label.name);
      // cy.get(`[data-cy=video-${videoId}-labels] .label-color`).should('have.css', 'background-color', annotation.label.color);
    });

    it('should set annotations stats', () => {
      cy.get(`[data-cy=video-${videoId}-annotations-count]`).should('have.text', '2');
    });

    it('should set users stats', () => {
      cy.get(`[data-cy=video-${videoId}-users-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-users] .user-container`).should('have.length', 1);
      cy.get(`[data-cy=video-${videoId}-users] .username`).should('have.text', Cypress.env('adminName'));
    });
  });

  context('Two annotations (different labels)', () => {
    let annotation = {
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
    let annotation2 = {
      ...annotation,
      label: {
        name: 'name2',
        color: '#fff333'
      }
    };
    beforeEach(() => {
      annotation = {
        ...annotation,
        videoId
      };
      annotation2 = {
        ...annotation2,
        videoId
      };
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation2);
      cy.get(`[data-cy=show-video-${videoId}-btn]`)
        .click();
      cy.location('pathname').should('eq', `/annotations/videos/${videoId}`);
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-videos-btn]').click();
      cy.location('pathname').should('eq', '/annotations/videos');
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('not.have.class', 'mat-expanded');
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).click();
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('have.class', 'mat-expanded');
    });

    it('should set labels stats', () => {
      cy.get(`[data-cy=video-${videoId}-labels-count]`).should('have.text', '2');
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).should('have.length', 2);
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).contains(annotation.label.name);
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).contains(annotation2.label.name);
      // cy.get(`[data-cy=video-${videoId}-labels] .label-color`).should('have.css', 'background-color', annotation.label.color);
    });

    it('should set annotations stats', () => {
      cy.get(`[data-cy=video-${videoId}-annotations-count]`).should('have.text', '2');
    });

    it('should set users stats', () => {
      cy.get(`[data-cy=video-${videoId}-users-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-users] .user-container`).should('have.length', 1);
      cy.get(`[data-cy=video-${videoId}-users] .username`).should('have.text', Cypress.env('adminName'));
    });
  });

  context('Update annotation', () => {
    let annotation = {
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
    beforeEach(() => {
      annotation = {
        ...annotation,
        videoId
      };
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => annotation.id = body.id);
      cy.get(`[data-cy=show-video-${videoId}-btn]`)
        .click();
      cy.get('[data-cy=toolbar-title]').should('not.have.text', 'indexity');
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-videos-btn]').click();
      cy.get('[data-cy=toolbar-title]').should('have.text', 'indexity');
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('not.have.class', 'mat-expanded');
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).click();
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('have.class', 'mat-expanded');
    });

    it('should update the stats', () => {
      // First stats
      cy.get(`[data-cy=video-${videoId}-labels-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).should('have.length', 1);
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).contains(annotation.label.name);
      cy.get(`[data-cy=video-${videoId}-annotations-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-users-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-users] .user-container`).should('have.length', 1);
      cy.get(`[data-cy=video-${videoId}-users] .username`).should('have.text', Cypress.env('adminName'));

      // Update annotation label
      const newLabel = {
        name: 'updated',
        color: '#fff333'
      };
      cy.updateAnnotation(localStorage.getItem('accessToken'), {
        id: annotation.id,
        videoId: annotation.videoId,
        label: newLabel
      });

      // Go to the video page
      cy.get(`[data-cy=show-video-${videoId}-btn]`)
        .click();
      cy.get('[data-cy=toolbar-title]').should('not.have.text', 'indexity');

      // Go back to index
      cy.get('[data-cy=menu-btn]').click();
      cy.get('[data-cy=nav-videos-btn]').click();
      cy.get('[data-cy=toolbar-title]').should('have.text', 'indexity');

      // Open accordion
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('not.have.class', 'mat-expanded');
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).click();
      cy.get(`[data-cy=video-${videoId}-info-expansion-panel-header]`).should('have.class', 'mat-expanded');

      // Check that stats have been updated
      cy.get(`[data-cy=video-${videoId}-labels-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).should('have.length', 1);
      cy.get(`[data-cy=video-${videoId}-labels] app-annotation-label-item`).contains(newLabel.name);
      cy.get(`[data-cy=video-${videoId}-annotations-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-users-count]`).should('have.text', '1');
      cy.get(`[data-cy=video-${videoId}-users] .user-container`).should('have.length', 1);
      cy.get(`[data-cy=video-${videoId}-users] .username`).should('have.text', Cypress.env('adminName'));
    });
  });
});
