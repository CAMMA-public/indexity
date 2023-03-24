
describe('Annotation Edition', () => {
  let annotation = {
    shape: {
      positions: {
        0: {
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
    cy.viewport(1024, 768);
    cy.server().route('GET', 'videos**').as('getVideos');
    cy.logAdmin();
    cy.visit('/');
    cy.wait('@getVideos');
    cy.uploadSample()
      .its('responseBody')
      .then(body => {
        if (body && body.length && body[0].id) {
          annotation = {
            ...annotation,
            videoId: body[0].id
          };
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

  describe('Annotation label update', () => {
    it('should open the labels dialog with label filled', () => {
      cy.get('surg-svg-annotation-form-dialog').should('not.exist');
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => {
          cy.get(`[data-cy=annotation-${body.id}-label]`).dblclick();
          cy.get('surg-svg-annotation-form-dialog').should('exist');
          cy.get('[data-cy=label-name-input]').its('value').should('be', annotation.label.name);
          cy.get('[data-cy=label-color-picker]').should('have.css', 'background-color', 'rgb(179, 17, 17)');
        });
    });

    it('should update the label', () => {
      const label = 'test2';
      cy.get('surg-svg-annotation-form-dialog').should('not.exist');
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => {
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('have.text', annotation.label.name);
          cy.get(`[data-cy=annotation-${body.id}-label]`).dblclick();
          cy.get('surg-svg-annotation-form-dialog').should('exist');
          cy.route('PATCH', `annotations/${body.id}`).as('updateAnnotation');
          cy.get('[data-cy=label-name-input]').clear().type(`${label}{enter}`);
          cy.wait('@updateAnnotation');
          // has the label been updated in svg ?
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('have.text', label);
          // is the annotation still correct ?
          cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke-width', '2');
          cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'fill-opacity', '0');
          cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke', annotation.label.color);
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

    it('should update the label color', () => {
      cy.get('surg-svg-annotation-form-dialog').should('not.exist');
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => {
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('have.text', annotation.label.name);
          cy.get(`[data-cy=annotation-${body.id}-label]`).dblclick();
          cy.get('surg-svg-annotation-form-dialog').should('exist');
          cy.route('PATCH', `annotations/${body.id}`).as('updateAnnotation');
          cy.get('[data-cy=label-color-picker]').click();
          cy.get('.hue').click();
          cy.get('[data-cy=submit-label-form]').click({force: true});
          cy.wait('@updateAnnotation');
          // // has the label been updated in svg ?
          cy.get(`[data-cy=annotation-${body.id}-label]`).should('have.text', annotation.label.name);
          // // is the annotation still correct ?
          cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke-width', '2');
          cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'fill-opacity', '0');
          // color changed
          cy.get(`[data-cy=annotation-${body.id}-shape]`).should('not.have.attr', 'stroke', annotation.label.color);
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
  });

  describe('Edit button click', () => {
    it('should check the edit button', () => {
      cy.get('[data-cy=edit-mode-btn]').click();
      cy.get('[data-cy=edit-mode-btn]').should('have.class', 'mat-button-toggle-checked');
    });

    it('should not add the svg delimiter around the video if there is no annotation', () => {
      cy.get('[data-cy=edit-mode-btn]').click();
      cy.get('#svg-delimiter').should('not.exist');
    });

    it('should not the svg delimiter around the video if there is an annotation', () => {
      cy.get('[data-cy=edit-mode-btn]').click();
      cy.get('#svg-delimiter').should('not.exist');
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
      cy.get('#svg-delimiter').should('exist');
    });

    it('should set the cursor to crosshair in the svg zone', () => {
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation);
      cy.get('[data-cy=edit-mode-btn]').click();
      cy.get('#svg-delimiter').should('have.css', 'cursor', 'pointer');
    });

    it('should set the annotations stroke-dasharray attribute to 5', () => {
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => {
          cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke-dasharray', '0');
          cy.get('[data-cy=edit-mode-btn]').click();
          cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke-dasharray', '5');

          cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'fill-opacity', '0');
          cy.get('app-annotation-item > .main-container').should('not.have.class', 'highlighted');
          cy.get('app-annotation-item > .main-container').should('have.css', 'opacity', '0.85');
          cy.get(`[data-cy=annotation-${body.id}-shape]`).trigger('mouseover');
          // highlighted
          cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'fill-opacity', '0.3');
          cy.get('app-annotation-item > .main-container').should('have.class', 'highlighted');
          cy.get('app-annotation-item > .main-container').should('have.css', 'opacity', '1');
        });
    });
  });

  it('should select the annotation', () => {
    cy.get('[data-cy=edit-mode-btn]').click();
    cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
      .its('body')
      .then(body => {
        cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke-dasharray', '5');
        cy.get('[data-cy=drawn-shape]').should('not.exist');
        cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
        cy.get('[data-cy=drawn-shape]').should('exist');
        cy.get(`[data-cy=annotation-${body.id}]`).should('have.css', 'display', 'none');
        cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'width').then(width => {
          cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'width', width);
        });
        cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'height').then(height => {
          cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'height', height);
        });
        cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'x').then(x => {
          cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'x', x);
        });
        cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'y').then(y => {
          cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'y', y);
        });
      });
  });

  it('should select an other annotation', () => {
    cy.get('[data-cy=edit-mode-btn]').click();
    cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
      .its('body')
      .then(body => {
        cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'stroke-dasharray', '5');
        cy.get('[data-cy=drawn-shape]').should('not.exist');
        cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
        cy.get('[data-cy=drawn-shape]').should('exist');
        cy.get(`[data-cy=annotation-${body.id}]`).should('have.css', 'display', 'none');
        cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'width').then(width => {
          cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'width', width);
        });
        cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'height').then(height => {
          cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'height', height);
        });
        cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'x').then(x => {
          cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'x', x);
        });
        cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'y').then(y => {
          cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'y', y);
        });
        cy.createAnnotation(localStorage.getItem('accessToken'), {
          ...annotation,
          shape: {
            positions: {
              0: {
                x: 50,
                y: 50,
                width: 32,
                height: 26
              }
            }
          }
        })
          .its('body')
          .then(a => {
            cy.get(`[data-cy=annotation-${body.id}]`).should('have.css', 'display', 'none');
            cy.get(`[data-cy=annotation-${a.id}-shape]`).should('have.attr', 'stroke-dasharray', '5');
            cy.get(`[data-cy=annotation-${a.id}-shape]`).click();
            cy.get(`[data-cy=annotation-${body.id}]`).should('not.have.css', 'display', 'none');
            cy.get(`[data-cy=annotation-${a.id}]`).should('have.css', 'display', 'none');
            cy.get('[data-cy=drawn-shape]').should('exist');
            cy.get(`[data-cy=annotation-${a.id}-shape]`).invoke('attr', 'width').then(width => {
              cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'width', width);
            });
            cy.get(`[data-cy=annotation-${a.id}-shape]`).invoke('attr', 'height').then(height => {
              cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'height', height);
            });
            cy.get(`[data-cy=annotation-${a.id}-shape]`).invoke('attr', 'x').then(x => {
              cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'x', x);
            });
            cy.get(`[data-cy=annotation-${a.id}-shape]`).invoke('attr', 'y').then(y => {
              cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'y', y);
            });
          });
      });
  });

  it('should have cancel button disabled since the annotation has not been modified', () => {
    cy.get('[data-cy=edit-mode-btn]').click();
    cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
      .its('body')
      .then(body => {
        cy.get(`[data-cy=cancel-annotation-btn]`).should('be.disabled');
        cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
        cy.get(`[data-cy=cancel-annotation-btn]`).should('be.disabled');
      });
  });

  describe('Cut Annotation', () => {
    describe('Button visibility', () => {
      it('should enable cut annotation button', () => {
        cy.get('[data-cy=edit-mode-btn]').click();
        cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
          .its('body')
          .then(body => {
            cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
            cy.get(`[data-cy=cut-annotation-btn]`).should('be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=100');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=200');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=300');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
          })
      });

      it('should disable cut annotation button (t = timestamp)', () => {
        cy.get('[data-cy=edit-mode-btn]').click();
        cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
          .its('body')
          .then(body => {
            cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
            cy.get(`[data-cy=cut-annotation-btn]`).should('be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=100');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 37, key: 'ArrowLeft', keyCode: 37 });
            cy.location('search').should('include', 't=0');
            cy.get(`[data-cy=cut-annotation-btn]`).should('be.disabled');
          })
      });

      it('should disable cut annotation button (t = timestamp + duration)', () => {
        cy.get('[data-cy=edit-mode-btn]').click();
        cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
          .its('body')
          .then(body => {
            cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
            cy.get(`[data-cy=cut-annotation-btn]`).should('be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=100');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=200');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=300');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=400');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=500');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=600');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=700');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=800');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=900');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=1000');
            cy.get(`[data-cy=cut-annotation-btn]`).should('be.disabled');
          })
      });

      it('should hide cut annotation button (t > timestamp + duration)', () => {
        cy.get('[data-cy=edit-mode-btn]').click();
        cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
          .its('body')
          .then(body => {
            cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
            cy.get(`[data-cy=cut-annotation-btn]`).should('be.disabled');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=1100');
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.location('search').should('include', 't=1200');
            cy.get(`[data-cy=cut-annotation-btn]`).should('not.exist');
          })
      });
    });

    it('should create a new annotation and update existing annotation with correct duration', () => {
        cy.get('[data-cy=edit-mode-btn]').click();
        cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
          .its('body')
          .then(body => {
            cy.get('ngx-timeline-tracks').find('ngx-timeline-event > .main-container').should('have.length', 1);
            cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
            const cutTime = 300;
            cy.location('search').should('include', `t=${cutTime}`);
            cy.route('PATCH', `annotations/${body.id}`).as('updateAnnotation');
            cy.route('POST', `annotations`).as('createAnnotation');
            cy.get(`[data-cy=cut-annotation-btn]`).click();
            cy.wait('@updateAnnotation')
              .its('responseBody')
              .then(updated => {
                expect(updated.duration).to.equal(cutTime);
                expect(updated.timestamp).to.equal(annotation.timestamp);
              });
            cy.wait('@createAnnotation')
              .its('responseBody')
              .then(created => {
                expect(created.timestamp).to.equal(cutTime + annotation.timestamp + 10);
                expect(created.duration).to.equal(annotation.duration - cutTime);
              });
            cy.get('ngx-timeline-tracks').find('ngx-timeline-event > .main-container').should('have.length', 2);
          });
    });

    // it('should create a new annotation and update existing annotation with correct shape', () => {
    //     cy.get('[data-cy=edit-mode-btn]').click();
    //     let annotation2 = {
    //       ...annotation,
    //       shape: {
    //         positions: {
    //           0: {
    //             x: 10,
    //             y: 10,
    //             width: 10,
    //             height: 10
    //           },
    //           400: {
    //             x: 20,
    //             y: 20,
    //             width: 20,
    //             height: 20
    //           }
    //         }
    //       }
    //     };
    //     const expectedPosition = {
    //       x: 15,
    //       y: 15,
    //       width: 15,
    //       height: 15
    //     };
    //     cy.createAnnotation(localStorage.getItem('accessToken'), annotation2)
    //       .its('body')
    //       .then(body => {
    //         cy.get('ngx-timeline-tracks').find('ngx-timeline-event > .main-container').should('have.length', 1);
    //         cy.get(`[data-cy=annotation-${body.id}-shape]`).click({force: true});
    //         cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
    //         cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
    //         const cutTime = 200;
    //         cy.location('search').should('include', `t=${cutTime}`);
    //         cy.route('PATCH', `annotations/${body.id}`).as('updateAnnotation');
    //         cy.route('POST', `annotations`).as('createAnnotation');
    //         cy.get(`[data-cy=cut-annotation-btn]`).click();
    //         cy.wait('@updateAnnotation')
    //           .its('responseBody')
    //           .then(updated => {
    //             expect(updated.duration).to.equal(cutTime);
    //             expect(updated.timestamp).to.equal(annotation.timestamp);
    //             // FIXME
    //             cy.get('[data-cy=svg-delimiter]').invoke('attr', 'width').then(width => {
    //               cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'width', `${expectedPosition.width * width / 100}`);
    //               cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'x', `${expectedPosition.x * width / 100}`);
    //             });
    //             cy.get('[data-cy=svg-delimiter]').invoke('attr', 'height').then(height => {
    //               cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'height', `${expectedPosition.height * height / 100}`);
    //               cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'y', `${expectedPosition.y * height / 100}`);
    //             });
    //           });
    //         cy.wait('@createAnnotation')
    //           .its('responseBody')
    //           .then(created => {
    //             expect(created.timestamp).to.equal(cutTime + annotation.timestamp + 10);
    //             expect(created.duration).to.equal(Math.floor(annotation.duration - cutTime));
    //           });
    //         cy.get('ngx-timeline-tracks').find('ngx-timeline-event > .main-container').should('have.length', 2);
    //       });
    // });
  });

  describe('Move Annotation', () => {
    // FIXME: move annotation with the mouse
    // it('should enable the cancel button', () => {
    //   cy.get('[data-cy=edit-mode-btn]').click();
    //   cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
    //     .its('body')
    //     .then(body => {
    //       cy.get(`[data-cy=cancel-annotation-btn]`).should('be.disabled');
    //       cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
    //       cy.get('[data-cy=drawn-shape]')
    //       .trigger('mousedown')
    //       .trigger('mousemove', 'right');
    //       cy.get(`[data-cy=cancel-annotation-btn]`).should('not.be.disabled');
    //     });
    // });

    it('should move the annotation to the right (ctrl + arrows)', () => {
      cy.get('[data-cy=edit-mode-btn]').click();
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => {
          cy.get(`[data-cy=cancel-annotation-btn]`).should('be.disabled');
          cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
          cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39, ctrlKey: true });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'width').then(width => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'width', width);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'height').then(height => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'height', height);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'x').then(x => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'x', `${+x+5}`);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'y').then(y => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'y', y);
          });
        });
    });

    it('should move the annotation to the left (ctrl + arrows)', () => {
      cy.get('[data-cy=edit-mode-btn]').click();
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => {
          cy.get(`[data-cy=cancel-annotation-btn]`).should('be.disabled');
          cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
          cy.get('body').trigger('keydown', { which: 37, key: 'ArrowLeft', keyCode: 37, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 37, key: 'ArrowLeft', keyCode: 37, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 37, key: 'ArrowLeft', keyCode: 37, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 37, key: 'ArrowLeft', keyCode: 37, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 37, key: 'ArrowLeft', keyCode: 37, ctrlKey: true });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'width').then(width => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'width', width);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'height').then(height => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'height', height);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'x').then(x => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'x', `${+x-5}`);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'y').then(y => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'y', y);
          });
        });
    });

    it('should move the annotation up (ctrl + arrows)', () => {
      cy.get('[data-cy=edit-mode-btn]').click();
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => {
          cy.get(`[data-cy=cancel-annotation-btn]`).should('be.disabled');
          cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
          cy.get('body').trigger('keydown', { which: 38, key: 'ArrowUp', keyCode: 38, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 38, key: 'ArrowUp', keyCode: 38, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 38, key: 'ArrowUp', keyCode: 38, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 38, key: 'ArrowUp', keyCode: 38, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 38, key: 'ArrowUp', keyCode: 38, ctrlKey: true });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'width').then(width => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'width', width);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'height').then(height => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'height', height);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'x').then(x => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'x', x);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'y').then(y => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'y', `${+y-5}`);
          });
        });
    });

    it('should move the annotation down (ctrl + arrows)', () => {
      cy.get('[data-cy=edit-mode-btn]').click();
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => {
          cy.get(`[data-cy=cancel-annotation-btn]`).should('be.disabled');
          cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
          cy.get('body').trigger('keydown', { which: 40, key: 'ArrowDown', keyCode: 40, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 40, key: 'ArrowDown', keyCode: 40, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 40, key: 'ArrowDown', keyCode: 40, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 40, key: 'ArrowDown', keyCode: 40, ctrlKey: true });
          cy.get('body').trigger('keydown', { which: 40, key: 'ArrowDown', keyCode: 40, ctrlKey: true });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'width').then(width => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'width', width);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'height').then(height => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'height', height);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'x').then(x => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'x', x);
          });
          cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'y').then(y => {
            cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'y', `${+y+5}`);
          });
        });
    });

    // it('should update the annotation position', () => {
    //   cy.get('[data-cy=edit-mode-btn]').click();
    //   cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
    //     .its('body')
    //     .then(body => {
    //       cy.get(`[data-cy=cancel-annotation-btn]`).should('be.disabled');
    //       cy.get(`[data-cy=annotation-${body.id}-shape]`).click();
    //       cy.get('body').trigger('keydown', { which: 40, key: 'ArrowDown', keyCode: 40, ctrlKey: true });
    //       cy.get('body').trigger('keydown', { which: 40, key: 'ArrowDown', keyCode: 40, ctrlKey: true });
    //       cy.get('body').trigger('keydown', { which: 40, key: 'ArrowDown', keyCode: 40, ctrlKey: true });
    //       cy.get('body').trigger('keydown', { which: 40, key: 'ArrowDown', keyCode: 40, ctrlKey: true });
    //       cy.get('body').trigger('keydown', { which: 40, key: 'ArrowDown', keyCode: 40, ctrlKey: true });
    //       cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'width').then(width => {
    //         cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'width', width);
    //       });
    //       cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'height').then(height => {
    //         cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'height', height);
    //       });
    //       cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'x').then(x => {
    //         cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'x', x);
    //       });
    //       // FIXME
    //       let newY = 0;
    //       cy.get(`[data-cy=annotation-${body.id}-shape]`).invoke('attr', 'y').then(y => {
    //         newY = +y + 5;
    //         cy.get(`[data-cy=drawn-shape]`).should('have.attr', 'y', `${newY}`);
    //         cy.route('PATCH', `annotations/${body.id}`).as('updateAnnotation');
    //         cy.get(`[data-cy=annotation-${body.id}-shape]`).should('not.have.attr', 'y', `${newY}`);
    //         cy.get(`[data-cy=cancel-annotation-btn]`).should('not.be.disabled');
    //         cy.get('body').trigger('keydown', { which: 13, key: 'Enter', keyCode: 13 });
    //         cy.wait('@updateAnnotation');
    //         cy.get(`[data-cy=annotation-${body.id}-shape]`).should('have.attr', 'y', `${newY}`);
    //       });
    //     });
    // });
  });

  describe('Resize Annotation', () => {
    // TODO
  });
});
