
describe('Video Annotations View', () => {
  let videoId;
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

  it('should have set t queryParam to 0', () => {
    cy.location('pathname').should('eq', `/annotations/videos/${videoId}`);
    cy.location('search').should('include', 't=0');
  });

  it('should display the video name in the toolbar', () => {
    cy.get('[data-cy=toolbar-title]').should('not.have.text', 'indexity');
  });

  it('should seek the video (arrows)', () => {
    cy.location('search').should('include', 't=0');
    cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
    cy.location('search').should('include', 't=100');
    cy.get('body').trigger('keydown', { which: 39, key: 'ArrowRight', keyCode: 39 });
    cy.location('search').should('include', 't=200');
    cy.get('body').trigger('keydown', { which: 37, key: 'ArrowLeft', keyCode: 37 });
    cy.location('search').should('include', 't=100');
    cy.get('body').trigger('keydown', { which: 37, key: 'ArrowLeft', keyCode: 37 });
    cy.location('search').should('include', 't=0');
  });

  describe('Annotation item actions', () => {
    let annotation;
    let annotation2;
    let annotation3;
    beforeEach(() => {
      annotation = {
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
        isOneShot: false,
        videoId
      };
      annotation2 = {
        ...annotation,
        shape: {
          positions: {
            1000: {
              x: 2,
              y: 9,
              width: 32,
              height: 26
            }
          }
        },
        timestamp: 1000
      };
      annotation3 = {
        ...annotation,
        label: {
          name: 'test2',
          color: '#b31111'
        },
        duration: 3000
      };
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
        .its('body')
        .then(body => annotation.id = body.id);
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation2)
        .its('body')
        .then(body => annotation2.id = body.id);
      cy.createAnnotation(localStorage.getItem('accessToken'), annotation3)
        .its('body')
        .then(body => annotation3.id = body.id);
    });

    describe('Delete', () => {
      it('should delete an annotation', () => {
        cy.route('DELETE', `/annotations/${annotation.id}`).as('deleteAnnotation');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 2);
        cy.get(`[data-cy=delete-annotation-${annotation.id}]`).trigger('mousedown');
        cy.wait('@deleteAnnotation');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 1);
      });

      it('should not delete an annotation', () => {
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 2);
        cy.get(`[data-cy=delete-annotation-${annotation.id}]`).click();
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 2);
      });
    });

    describe('Hide/Show', () => {
      it('should hide an annotation', () => {
        cy.get(`[data-cy=annotation-${annotation.id}]`).should('not.have.css', 'display', 'none');
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('not.have.class', 'disabled');
        cy.get(`[data-cy=hide-annotation-${annotation.id}-menu]`).click();
        cy.get(`[data-cy=hide-annotation-${annotation.id}]`).click();
        cy.get(`[data-cy=annotation-${annotation.id}]`).should('have.css', 'display', 'none');
        cy.get(`[data-cy=hide-annotation-${annotation.id}-menu]`).should('not.exist');
        cy.get(`[data-cy=show-annotation-${annotation.id}-menu]`).should('exist');
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('have.class', 'disabled');
      });

      it('should hide a category', () => {
        cy.get(`[data-cy=annotation-${annotation.id}]`).should('not.have.css', 'display', 'none');
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('not.have.class', 'disabled');
        cy.get(`[data-cy=timeline-event-${annotation2.id}]`).should('not.have.class', 'disabled');
        cy.get(`[data-cy=hide-annotation-${annotation.id}-menu]`).click();
        cy.get(`[data-cy=hide-annotation-${annotation.id}-category]`).click();
        cy.get(`[data-cy=annotation-${annotation.id}]`).should('have.css', 'display', 'none');
        cy.get(`[data-cy=hide-annotation-${annotation.id}-menu]`).should('not.exist');
        cy.get(`[data-cy=show-annotation-${annotation.id}-menu]`).should('exist');
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('have.class', 'disabled');
        cy.get(`[data-cy=timeline-event-${annotation2.id}]`).should('have.class', 'disabled');
      });

      it('should show an annotation (category previously hidden)', () => {
        cy.get(`[data-cy=hide-annotation-${annotation.id}-menu]`).click();
        cy.get(`[data-cy=hide-annotation-${annotation.id}-category]`).click();
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('have.class', 'disabled');
        cy.get(`[data-cy=show-annotation-${annotation.id}-menu]`).click();
        cy.get(`[data-cy=show-annotation-${annotation.id}]`).click();
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('not.have.class', 'disabled');
        cy.get(`[data-cy=timeline-event-${annotation2.id}]`).should('have.class', 'disabled');
        cy.get(`[data-cy=hide-annotation-${annotation.id}-menu]`).should('exist');
      });

      it('should show an annotation', () => {
        cy.get(`[data-cy=hide-annotation-${annotation.id}-menu]`).click();
        cy.get(`[data-cy=hide-annotation-${annotation.id}]`).click();
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('have.class', 'disabled');
        cy.get(`[data-cy=show-annotation-${annotation.id}-menu]`).click();
        cy.get(`[data-cy=show-annotation-${annotation.id}]`).click();
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('not.have.class', 'disabled');
        cy.get(`[data-cy=hide-annotation-${annotation.id}-menu]`).should('exist');
      });

      it('should show a category', () => {
        cy.get(`[data-cy=hide-annotation-${annotation.id}-menu]`).click();
        cy.get(`[data-cy=hide-annotation-${annotation.id}-category]`).click();
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('have.class', 'disabled');
        cy.get(`[data-cy=show-annotation-${annotation.id}-menu]`).click();
        cy.get(`[data-cy=show-annotation-${annotation.id}-category]`).click();
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('not.have.class', 'disabled');
        cy.get(`[data-cy=timeline-event-${annotation2.id}]`).should('not.have.class', 'disabled');
        cy.get(`[data-cy=hide-annotation-${annotation.id}-menu]`).should('exist');
      });
    });

    describe('Copy/Paste', () => {
      it('should copy an annotation', () => {
        cy.get('[data-cy=paste-annotation-btn]').should('be.disabled');
        cy.get(`[data-cy=copy-annotation-${annotation.id}-btn]`).click();
        cy.get('[data-cy=paste-annotation-btn]').should('not.be.disabled');
        cy.contains('Annotation copied');
      });

      it('should paste an annotation (button click)', () => {
        cy.route('POST', 'annotations').as('postAnnotation');
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 2);
        cy.get(`[data-cy=copy-annotation-${annotation.id}-btn]`).click();
        cy.get(`[data-cy=annotation-item-${annotation.id}] .occurrences > .value`).should('have.text', ' 2 ');
        cy.get('[data-cy=paste-annotation-btn]').click();
        cy.wait('@postAnnotation').then(xhr => {
          const copy = xhr.response.body;
          cy.get(`[data-cy=annotation-${copy.id}-label]`).should('have.text', annotation.label.name);
          // FIXME: fix infinite loop
          // cy.get(`[data-cy=annotation-item-${annotation.id}-label]`).invoke('text').should(label => {
          //   cy.get(`[data-cy=annotation-item-${copy.id}-label]`).should('have.text', label);
          // });
          // cy.get(`[data-cy=annotation-item-${annotation.id}-duration]`).invoke('text').should(duration => {
          //   cy.get(`[data-cy=annotation-item-${copy.id}-duration]`).should('have.text', duration);
          // });
          // cy.get(`[data-cy=annotation-item-${annotation.id}-category]`).invoke('text').should(category => {
          //   cy.get(`[data-cy=annotation-item-${copy.id}-category]`).should('have.text', category);
          // });
          cy.get(`[data-cy=annotation-item-${copy.id}-user]`).contains(Cypress.env('adminName'));
        });
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 3);
        cy.get(`[data-cy=annotation-item-${annotation.id}] .occurrences > .value`).should('have.text', ' 3 ');
      });

      it('should paste an annotation (ctrl + v)', () => {
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 2);
        cy.get(`[data-cy=copy-annotation-${annotation.id}-btn]`).click();
        cy.get('body').trigger('keydown', { which: 86, key: 'v', code: 'KeyV', keyCode: 86, ctrlKey: true });
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 3);
      });

      it('should not paste an annotation (ctrl + v)', () => {
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 2);
        cy.get('body').trigger('keydown', { which: 86, key: 'v', code: 'KeyV', keyCode: 86, ctrlKey: true });
        cy.get('[data-cy=sidebar]').find('app-annotation-item').should('have.length', 2);
      });
    });

    describe('Highlight', () => {
      it('should highlight the svg shape', () => {
        cy.get(`[data-cy=annotation-${annotation.id}-shape]`).should('have.attr', 'stroke', annotation.label.color);
        cy.get(`[data-cy=annotation-${annotation.id}-shape]`).should('have.attr', 'stroke-width', '2');
        cy.get(`[data-cy=annotation-${annotation.id}-shape]`).should('have.attr', 'fill-opacity', '0');
        cy.get(`[data-cy=annotation-item-${annotation.id}]`).trigger('mouseover');
        cy.get(`[data-cy=annotation-${annotation.id}-shape]`).should('have.attr', 'fill-opacity', '0.3');
      });

      it('should highlight the annotation item', () => {
        cy.get(`[data-cy=annotation-item-${annotation.id}]`).should('not.have.class', 'highlighted');
        cy.get(`[data-cy=annotation-item-${annotation.id}]`).should('have.css', 'opacity', '0.85');
        cy.get(`[data-cy=annotation-item-${annotation.id}]`).trigger('mouseover');
        cy.get(`[data-cy=annotation-item-${annotation.id}]`).should('have.class', 'highlighted');
        cy.get(`[data-cy=annotation-item-${annotation.id}]`).should('have.css', 'opacity', '1');
      });

      it('should highlight an other annotation item', () => {
        cy.get(`[data-cy=annotation-item-${annotation.id}]`).trigger('mouseover');
        cy.get(`[data-cy=annotation-${annotation.id}-shape]`).should('have.attr', 'fill-opacity', '0.3');
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('have.class', 'active');
        cy.get(`[data-cy=annotation-item-${annotation3.id}]`).trigger('mouseover');
        cy.get(`[data-cy=annotation-item-${annotation.id}]`).should('not.have.class', 'highlighted');
        cy.get(`[data-cy=annotation-item-${annotation3.id}]`).should('have.class', 'highlighted');
        cy.get(`[data-cy=annotation-${annotation.id}-shape]`).should('have.attr', 'fill-opacity', '0');
        cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('not.have.class', 'active');
        cy.get(`[data-cy=annotation-${annotation3.id}-shape]`).should('have.attr', 'fill-opacity', '0.3');
        cy.get(`[data-cy=timeline-event-${annotation3.id}]`).should('have.class', 'active');
      });
    });
  });

  describe('Timeline', () => {
    describe('Toolbar', () => {
      it('should exist', () => {
        cy.get('[data-cy=timeline-toolbar]').should('exist');
      });
    //   // TODO: find out why the toolbar is not visible
    //   it('should play the video', () => {.
    //     // FIXME
    //     cy.get('[data-cy=timeline-toolbar]').should('exist');
    //     cy.get('[data-cy=timeline-play-btn]').click();
    //     cy.get('[data-cy=timeline-play-btn]').should('not.exist');
    //     cy.get('[data-cy=timeline-pause-btn]').should('exist');
    //     cy.get('[data-cy=timeline-pause-btn]').click();
    //   });
    //
    //   it('should pause the video', () => {
    //     cy.get('[data-cy=timeline-toolbar]').should('exist');
    //     cy.get('[data-cy=timeline-play-btn]').click();
    //     cy.get('[data-cy=timeline-pause-btn]').click();
    //     cy.get('[data-cy=timeline-play-btn]').should('exist');
    //     cy.get('[data-cy=timeline-pause-btn]').should('not.exist');
    //      // should update t query param
    //   });
    //
    //   it('should close and reopen the sidebar', () => {
    //
    //   });
    //
    //   it('should change the playback rate', () => {
    //     // first playback rate = 1
    //     // 2, 3, 4, 0.2, 0.5, 1
    //   });
    //
    //   it('display the video time', () => {
    //     // first: 00:00:00
    //   });
    //
    //   it('display the video duration', () => {
    //
    //   });
    //
    //   it('should go to the next frame', () => {
    //     // click on "next event" => video time !== 0
    //   });
    //
    //   it('should set the video time to 0', () => {
    //     // click on the rewind button => video time === 0
    //   });
    });

    describe('Timeline', () => {
      it('should have one line', () => {
        cy.get('ngx-timeline-tracks').find('ngx-timeline-track').should('have.length', 1);
      });

      it('should seek the video', () => {
        // click in the middle and check the video time and the displayed time
        cy.location('search').should('include', 't=0');
        cy.get('ngx-timeline-tracks').click('top');
        cy.location('search').should('not.include', 't=0');
      });
    });

    describe('Select Multiple', () => {
      let annotation;
      let annotation2;
      let annotation3;
      beforeEach(() => {
        annotation = {
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
          isOneShot: false,
          videoId
        };
        annotation2 = {
          ...annotation,
          shape: {
            positions: {
              1000: {
                x: 2,
                y: 9,
                width: 32,
                height: 26
              }
            }
          },
          timestamp: 1000
        };
        annotation3 = {
          ...annotation,
          label: {
            name: 'test2',
            color: '#b31111'
          },
          duration: 3000
        };
        cy.createAnnotation(localStorage.getItem('accessToken'), annotation)
          .its('body')
          .then(body => annotation.id = body.id);
        cy.createAnnotation(localStorage.getItem('accessToken'), annotation2)
          .its('body')
          .then(body => annotation2.id = body.id);
        cy.createAnnotation(localStorage.getItem('accessToken'), annotation3)
          .its('body')
          .then(body => annotation3.id = body.id);
      });

      context('Select one annotation', () => {
        // CTRL + click
        it('should set background to transparent', () => {
          cy.get('body').trigger('keydown', { which: 17, key: 'Control', keyCode: 17, ctrlKey: true });
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).click();
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
        });

        it('should display selection-controls-container', () => {
          cy.get('body').trigger('keydown', { which: 17, key: 'Control', keyCode: 17, ctrlKey: true });
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).click();
          cy.get('.selection-controls-container').should('exist');
        });

        it('set selection count to 1', () => {
          cy.get('body').trigger('keydown', { which: 17, key: 'Control', keyCode: 17, ctrlKey: true });
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).click();
          cy.get('[data-cy=selection-count]').should('have.text', '1');
        });

        it('should unselect an annotation', () => {
          cy.get('body').trigger('keydown', { which: 17, key: 'Control', keyCode: 17, ctrlKey: true });
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).click();
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
          cy.get('.selection-controls-container').should('exist');
          cy.get('[data-cy=selection-count]').should('have.text', '1');
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).click();
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
          cy.get('.selection-controls-container').should('not.exist');
        });
      });

      context('Select multiple', () => {
        beforeEach(() => {
          cy.get('body').trigger('keydown', { which: 17, key: 'Control', keyCode: 17, ctrlKey: true });
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).click();
          cy.get(`[data-cy=timeline-event-${annotation3.id}]`).click();
        });

        it('set selection count to 2', () => {
          cy.get('.selection-controls-container').should('exist');
          cy.get('[data-cy=selection-count]').should('have.text', '2');
        });

        it('set background to transparent', () => {
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
          cy.get(`[data-cy=timeline-event-${annotation3.id}]`).should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
        });

        describe('Actions', () => {
          it('should update selected annotations labels', () => {
            const label = 'update';
            cy.get('surg-svg-annotation-form-dialog').should('not.exist');
            cy.get('[data-cy=edit-selection-labels-btn]').click();
            cy.get('surg-svg-annotation-form-dialog').should('exist');
            cy.route('PATCH', `annotations/${annotation.id}`).as('updateAnnotation1');
            cy.route('PATCH', `annotations/${annotation3.id}`).as('updateAnnotation3');
            cy.get('[data-cy=label-name-input]').type(`${label}{enter}`);
            cy.wait('@updateAnnotation1')
              .its('responseBody')
              .then(body => {
                expect(body.labelName).to.equal(label);
                expect(body.id).to.equal(annotation.id);
              });
            cy.wait('@updateAnnotation3')
              .its('responseBody')
              .then(body => {
                expect(body.labelName).to.equal(label);
                expect(body.id).to.equal(annotation3.id);
              });
          });

          it('should delete selected annotations', () => {
            cy.route('DELETE', `annotations/${annotation.id}`).as('deleteAnnotation1');
            cy.route('DELETE', `annotations/${annotation3.id}`).as('deleteAnnotation3');
            cy.get('[data-cy=delete-selection-btn]').click();
            cy.on('window:alert', str => {
              expect(str).to.equal(`Are you sure you want to delete the 2 selected items?`);
            });
            cy.wait('@deleteAnnotation1');
            cy.wait('@deleteAnnotation3');
          });

          it('should clear selection', () => {
            cy.get('.selection-controls-container').should('exist');
            cy.get('[data-cy=clear-selection-btn]').click();
            cy.get('.selection-controls-container').should('not.exist');
            cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
            cy.get(`[data-cy=timeline-event-${annotation3.id}]`).should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
          });
        });
      });

      context('Select all', () => {
        it('should select all annotations with last selected label', () => {
          cy.get('body').trigger('keydown', { which: 17, key: 'Control', keyCode: 17, ctrlKey: true });
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).click();
          cy.get('[data-cy=selection-count]').should('have.text', '1');
          cy.get('body').trigger('keydown', { which: 65, key: 'a', keyCode: 65, ctrlKey: true });
          cy.get('[data-cy=selection-count]').should('have.text', '2');
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
          cy.get(`[data-cy=timeline-event-${annotation2.id}]`).should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
          cy.get(`[data-cy=timeline-event-${annotation3.id}]`).should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
        });

        it('should unselect all annotations with last selected label', () => {
          cy.get('body').trigger('keydown', { which: 17, key: 'Control', keyCode: 17, ctrlKey: true });
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).click();
          cy.get('body').trigger('keydown', { which: 65, key: 'a', keyCode: 65, ctrlKey: true });
          cy.get('[data-cy=selection-count]').should('have.text', '2');
          cy.get('body').trigger('keydown', { which: 65, key: 'a', keyCode: 65, ctrlKey: true });
          cy.get('.selection-controls-container').should('not.exist');
          cy.get(`[data-cy=timeline-event-${annotation.id}]`).should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
          cy.get(`[data-cy=timeline-event-${annotation2.id}]`).should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
          cy.get(`[data-cy=timeline-event-${annotation3.id}]`).should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
        });
      });
    });
  });
});
