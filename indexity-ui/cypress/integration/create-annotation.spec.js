
describe('Annotation Creation', () => {
  let videoId = null;
  beforeEach(() => {
    cy.viewport(1024, 768);
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
          cy.get(`[data-cy=show-video-${body[0].id}-btn]`)
            .click();
          cy.wait('@getAnnotations');
        }
      });
  });

  afterEach(() => {
    cy.resetVideos(localStorage.getItem('accessToken'));
  });

  describe('Draw button click', () => {
    it('should check the drawing button', () => {
      cy.get('[data-cy=drawing-mode-btn]').click();
      cy.get('[data-cy=drawing-mode-btn]').should('have.class', 'mat-button-toggle-checked');
    });

    it('should add the svg delimiter around the video', () => {
      cy.get('[data-cy=drawing-mode-btn]').click();
      cy.get('#svg-delimiter').should('exist');
    });

    it('should set the cursor to crosshair in the svg zone', () => {
      cy.get('[data-cy=drawing-mode-btn]').click();
      cy.get('#svg-delimiter').should('have.css', 'cursor', 'crosshair');
    });
  });

  describe('Annotation drawing', () => {
    context('From UI', () => {
      beforeEach(() => {
        // TODO: make a real annotation, not by only clicking
        cy.get('[data-cy=drawing-mode-btn]').click();
        cy.get('[data-cy=svg-delimiter]').click();
        // .trigger('mousedown',  { which: 1, x: 20, y: 20 })
        // .trigger('mousemove', { clientX: 100, clientY: 100 })
        // .trigger('mouseup', {force: true});
      });

      const label = 'test';
      it('should open the label dialog', () => {
        cy.get('surg-svg-annotation-form-dialog').should('exist');
      });

      it('should cancel the annotation (cancel form)', () => {
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
        cy.get('[data-cy=cancel-label-form]').click({force: true});
        cy.get('surg-svg-annotation-form-dialog').should('not.exist');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
      });

      it('should cancel the annotation (cancel button)', () => {
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
        cy.get('[data-cy=label-name-input]').type(label);
        cy.get('[data-cy=submit-label-form]').click({force: true});
        cy.get('surg-svg-annotation-form-dialog').should('not.exist');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 1);
        cy.get('[data-cy=drawn-text]').should('have.text', label);
        cy.get('[data-cy=cancel-annotation-btn] > span').click();
        cy.get('[data-cy=drawn-text]').should('not.exist');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
      });

      it('should cancel the annotation (ESC)', () => {
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
        cy.get('[data-cy=label-name-input]').type(label);
        cy.get('[data-cy=submit-label-form]').click({force: true});
        cy.get('surg-svg-annotation-form-dialog').should('not.exist');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 1);
        cy.get('body').trigger('keydown', { which: 27, key: 'Escape', keyCode: 27 });
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
      });

      it('should create an annotation with maximal duration (submit click)', () => {
        // create an annotation
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
        cy.get('surg-svg-annotation-form-dialog').should('exist');
        cy.get('[data-cy=label-name-input]').type(label);
        cy.get('[data-cy=submit-label-form]').click({force: true});
        cy.get('surg-svg-annotation-form-dialog').should('not.exist');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 1);
        const item = cy.get('[data-cy=sidebar]').find('app-annotation-item').first();
        item.get('.title').contains(label);
        item.get('.color').should('have.css', 'background-color', 'rgb(179, 17, 17)');
        item.get('.user').contains(Cypress.env('adminName'));
        item.get('.category').contains('svg');
        item.get('.timestamp').contains('00:00:00');
        item.get('.occurrences > .value').contains('0');
        cy.get('[data-cy=drawn-text]').should('have.text', label);
        // FIXME: why duration isn't video time?
        // item.get('.duration > .value').contains('00:00:05');
        // ngx-timeline-tracks width === annotation width
      });

      it('should create an annotation with maximal duration (submit)', () => {
        // create an annotation
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
        cy.get('surg-svg-annotation-form-dialog').should('exist');
        cy.get('[data-cy=label-name-input]').type(label);
        cy.get('surg-svg-annotation-form-dialog').find('form').first().submit();
        cy.get('surg-svg-annotation-form-dialog').should('not.exist');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 1);
        const item = cy.get('[data-cy=sidebar]').find('app-annotation-item').first();
        item.get('.title').contains(label);
        item.get('.color').should('have.css', 'background-color', 'rgb(179, 17, 17)');
        item.get('.user').contains(Cypress.env('adminName'));
        item.get('.category').contains('svg');
        item.get('.timestamp').contains('00:00:00');
        item.get('.occurrences > .value').contains('0');
        cy.get('[data-cy=drawn-text]').should('have.text', label);
        // FIXME: why duration isn't video time?
        // item.get('.duration > .value').contains('00:00:05');
        // ngx-timeline-tracks width === annotation width
      });

      it('should create an annotation with maximal duration (enter press)', () => {
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
        cy.get('surg-svg-annotation-form-dialog').should('exist');
        cy.get('[data-cy=label-name-input]').type(`${label}{enter}`);
        cy.get('surg-svg-annotation-form-dialog').should('not.exist');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 1);
        const item = cy.get('[data-cy=sidebar]').find('app-annotation-item').first();
        item.get('.title').contains(label);
        item.get('.color').should('have.css', 'background-color', 'rgb(179, 17, 17)');
        item.get('.user').contains(Cypress.env('adminName'));
        item.get('.category').contains('svg');
        item.get('.timestamp').contains('00:00:00');
        item.get('.occurrences > .value').contains('0');
        cy.get('[data-cy=drawn-text]').should('have.text', label);
        // FIXME: why duration isn't video time?
        // item.get('.duration > .value').contains('00:00:05');
        // ngx-timeline-tracks width === annotation width
      });

      it('should create a one shot annotation (ENTER)', () => {
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
        cy.get('surg-svg-annotation-form-dialog').should('exist');
        cy.get('[data-cy=label-name-input]').type(`${label}{enter}`);
        cy.get('surg-svg-annotation-form-dialog').should('not.exist');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 1);
        const item = cy.get('[data-cy=sidebar]').find('app-annotation-item').first();
        item.get('.title').contains(label);
        item.get('.color').should('have.css', 'background-color', 'rgb(179, 17, 17)');
        item.get('.user').contains(Cypress.env('adminName'));
        item.get('.category').contains('svg');
        item.get('.timestamp').contains('00:00:00');
        item.get('.occurrences > .value').contains('0');
        cy.get('[data-cy=drawn-text]').should('have.text', label);
        cy.route('POST', 'annotations').as('postAnnotation');
        cy.get('body').trigger('keydown', { which: 13, key: 'Enter', keyCode: 13 });
        cy.wait('@postAnnotation').then(xhr => {
          const annotation = xhr.response.body;
          cy.get(`[data-cy=annotation-${annotation.id}-label]`).should('have.text', label);
        });
        item.get('.occurrences > .value').contains('1');
        cy.get('[data-cy=drawn-text]').should('not.exist');
        // FIXME: duration???
        // item.get('.duration').contains('00:00:01');
        cy.get('ngx-timeline-event > .main-container').should('have.css', 'width', '6px');
      });

      it('should create a one shot annotation (send button)', () => {
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
        cy.get('surg-svg-annotation-form-dialog').should('exist');
        cy.get('[data-cy=label-name-input]').type(`${label}{enter}`);
        cy.get('surg-svg-annotation-form-dialog').should('not.exist');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 1);
        const item = cy.get('[data-cy=sidebar]').find('app-annotation-item').first();
        item.get('.title').contains(label);
        item.get('.color').should('have.css', 'background-color', 'rgb(179, 17, 17)');
        item.get('.user').contains(Cypress.env('adminName'));
        item.get('.category').contains('svg');
        item.get('.timestamp').contains('00:00:00');
        item.get('.occurrences > .value').contains('0');
        cy.get('[data-cy=drawn-text]').should('have.text', label);
        cy.route('POST', 'annotations').as('postAnnotation');
        cy.get('[data-cy="normal-mode-btn"]').click();
        cy.wait('@postAnnotation').then(xhr => {
          const annotation = xhr.response.body;
          cy.get(`[data-cy=annotation-${annotation.id}-label]`).should('have.text', label);
        });
        item.get('.occurrences > .value').contains('1');
        cy.get('[data-cy=drawn-text]').should('not.exist');
        // FIXME: duration???
        // item.get('.duration').contains('00:00:01');
        cy.get('ngx-timeline-event > .main-container').should('have.css', 'width', '6px');
      });
    });

    context('From API', () => {
      it('should create an annotation item', () => {
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
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 0);
        cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 1);
        const item = cy.get('[data-cy=sidebar]').find('app-annotation-item').first();
        item.get('.title').contains(annotation.label.name);
        item.get('.color').should('have.css', 'background-color', 'rgb(179, 17, 17)');
        item.get('.category').contains('svg');
        item.get('.timestamp').contains('00:00:00');
        item.get('.duration > .value').contains('00:00:01');
        item.get('.occurrences > .value').contains('1');
      });

      it('should create a svg annotation', () => {
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
            cy.get(`[data-cy=annotation-${body.id}-label]`).should('have.text', annotation.label.name);
            cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke', annotation.label.color);
            cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke-width', '2');
            cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'fill-opacity', '0');
            cy.get('[data-cy=svg-delimiter]').invoke('attr', 'width').then(width => {
              cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'x', `${annotation.shape.positions[0].x * width / 100}`);
              cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'width', `${annotation.shape.positions[0].width * width / 100}`);
            });
            cy.get('[data-cy=svg-delimiter]').invoke('attr', 'height').then(height => {
              cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'y', `${annotation.shape.positions[0].y * height / 100}`);
              cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'height', `${annotation.shape.positions[0].height * height / 100}`);
            });
          });
      });

      it('should highlight the annotation', () => {
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
            cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke', annotation.label.color);
            cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke-width', '2');
            cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'fill-opacity', '0');
            cy.get('app-annotation-item > .main-container').should('not.have.class', 'highlighted');
            cy.get('app-annotation-item > .main-container').should('have.css', 'opacity', '0.85');
            cy.get('app-annotation-item > .main-container').trigger('mouseover');
            // highlighted
            cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'fill-opacity', '0.3');
            cy.get('app-annotation-item > .main-container').should('have.class', 'highlighted');
            cy.get('app-annotation-item > .main-container').should('have.css', 'opacity', '1');
          });
      })
    });
  });
});
