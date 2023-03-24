describe('Video groups', () => {
  let videoId;
  before(() => {
    cy.logAdmin();
    cy.persistSession('accessToken');
    cy.visit('/');
    cy.uploadSample()
      .its('responseBody')
      .then(body => {
        videoId = body[0].id;
      });
  });

  after(() => {
    cy.resetVideos(localStorage.getItem('accessToken'));
  });

  beforeEach(() => {
    cy.restoreSession('accessToken');
    cy.visit('/');
    cy.get('[data-cy=menu-btn]').click();
    cy.get('[data-cy=nav-video-groups-btn]').click();
  });

  afterEach(() => {
    cy.resetGroups(localStorage.getItem('accessToken'));
  });

  describe('Index', () => {
    it('should access video groups index', () => {
      cy.location('pathname').should('eq', '/annotations/videos/groups');
    });

    it('should set Video groups as title', () => {
      cy.get('[data-cy=toolbar-title]').should('have.text', 'Video groups');
    });

    describe('Create group', () => {
      beforeEach(() => {
        cy.get('[data-cy=add-group-btn').click();
      });

      it('should open the form dialog with empty fields', () => {
        cy.get('app-video-group-form').should('exist');
        cy.get('[data-cy=group-name-input]').should('have.value', '');
        cy.get('[data-cy=group-description-input]').should('have.value', '');
        cy.get('[data-cy=group-save-btn]').should('be.disabled');
      });

      it('should display an error (no name)', () => {
        cy.get('[data-cy=group-name-input]').click();
        cy.get('[data-cy=group-description-input]').type('description');
        cy.get('[data-cy=group-save-btn]').should('be.disabled');
        cy.get('app-video-group-form').contains('Name is required');
      });

      it('should enable the save button', () => {
        cy.get('[data-cy=group-name-input]').type('name');
        cy.get('[data-cy=group-save-btn]').should('not.be.disabled');
      });

      it('should cancel the form (cancel click)', () => {
        cy.get('app-video-group-form').should('exist');
        cy.get('[data-cy=group-cancel-btn]').click();
        cy.get('app-video-group-form').should('not.exist');
      });

      it('should create a group with no description (enter pressed)', () => {
        const name = 'name';
        cy.get('.groups-list').find('app-video-group-item').should('have.length', 0);
        cy.server().route('POST', 'video-groups').as('createGroup');
        cy.get('[data-cy=group-name-input]').type(`${name}{enter}`);
        cy.wait('@createGroup').its('responseBody')
          .then(body => {
            cy.get('app-video-group-form').should('not.exist');
            cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
            cy.get(`[data-cy=group-item-${body.id}]`).should('exist');
            cy.get(`[data-cy=group-${body.id}-name]`).contains(name);
            cy.get(`[data-cy=group-${body.id}-description]`).should('not.exist');
          });
      });

      it('should create a group with no description (save button clicked)', () => {
        const name = 'name';
        cy.get('.groups-list').find('app-video-group-item').should('have.length', 0);
        cy.server().route('POST', 'video-groups').as('createGroup');
        cy.get('[data-cy=group-name-input]').type(`${name}`);
        cy.get('[data-cy=group-save-btn]').click();
        cy.wait('@createGroup').its('responseBody')
          .then(body => {
            cy.get('app-video-group-form').should('not.exist');
            cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
            cy.get(`[data-cy=group-item-${body.id}]`).should('exist');
            cy.get(`[data-cy=group-${body.id}-name]`).contains(name);
            cy.get(`[data-cy=group-${body.id}-description]`).should('not.exist');
          });
      });

      it('should create a group with a description', () => {
        const name = 'name';
        const description = 'description';
        cy.get('.groups-list').find('app-video-group-item').should('have.length', 0);
        cy.server().route('POST', 'video-groups').as('createGroup');
        cy.get('[data-cy=group-name-input]').type(`${name}`);
        cy.get('[data-cy=group-description-input]').type(`${description}`);
        cy.get('[data-cy=group-save-btn]').click();
        cy.wait('@createGroup').its('responseBody')
          .then(body => {
            cy.get('app-video-group-form').should('not.exist');
            cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
           cy.get(`[data-cy=group-item-${body.id}]`).should('exist');
            cy.get(`[data-cy=group-${body.id}-name]`).should('have.text', name);
            cy.get(`[data-cy=group-${body.id}-description]`).should('have.text', description);
          });
      });
    });

    context('Group created', () => {
      let groupId;
      const group = {name: 'group', description: 'A test group.'};
      beforeEach(() => {
        cy
          .createGroup(localStorage.getItem('accessToken'), group)
          .its('body')
          .then(body => groupId = body.id);
      });

      describe('Videos counter', () => {
        it('should display videos count', () => {
          cy.get(`[data-cy=group-${groupId}-videos-counter]`).should('have.text', '0 videos');
        });

        it('should set videos count to 1', () => {
          cy.addToGroup(localStorage.getItem('accessToken'), groupId, videoId);
          cy.get(`[data-cy=group-${groupId}-videos-counter]`).should('have.text', '1 video');
        });
      });

      describe('Search group', () => {
        it('should display a group (search by name)', () => {
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
          cy.get(`[data-cy=group-item-${groupId}]`).should('exist');
          cy.get(`[data-cy=group-${groupId}-name]`).should('have.text', group.name);
          cy.get(`[data-cy=group-${groupId}-description]`).should('have.text', group.description);
          cy.get('[data-cy=search-groups] .search-field').type(group.name);
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
          cy.get(`[data-cy=group-item-${groupId}]`).should('exist');
          cy.get(`[data-cy=group-${groupId}-name]`).should('have.text', group.name);
          cy.get(`[data-cy=group-${groupId}-description]`).should('have.text', group.description);
        });

        it('should display a group (search by description)', () => {
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
          cy.get(`[data-cy=group-item-${groupId}]`).should('exist');
          cy.get(`[data-cy=group-${groupId}-name]`).should('have.text', group.name);
          cy.get(`[data-cy=group-${groupId}-description]`).should('have.text', group.description);
          cy.get('[data-cy=search-groups] .search-field').type(group.description);
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
          cy.get(`[data-cy=group-item-${groupId}]`).should('exist');
          cy.get(`[data-cy=group-${groupId}-name]`).should('have.text', group.name);
          cy.get(`[data-cy=group-${groupId}-description]`).should('have.text', group.description);
        });

        it('should not display any group (no match in name or description)', () => {
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
          cy.get(`[data-cy=group-item-${groupId}]`).should('exist');
          cy.get(`[data-cy=group-${groupId}-name]`).should('have.text', group.name);
          cy.get(`[data-cy=group-${groupId}-description]`).should('have.text', group.description);
          cy.get('[data-cy=search-groups] .search-field').type('no results');
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 0);
          cy.get(`[data-cy=group-item-${groupId}]`).should('not.exist');
        });

        it('should display a group (clear search field)', () => {
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
          cy.get(`[data-cy=group-item-${groupId}]`).should('exist');
          cy.get(`[data-cy=group-${groupId}-name]`).should('have.text', group.name);
          cy.get(`[data-cy=group-${groupId}-description]`).should('have.text', group.description);
          cy.get('[data-cy=search-groups] .search-field').type('no results');
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 0);
          cy.get(`[data-cy=group-item-${groupId}]`).should('not.exist');
          cy.get('[data-cy=search-groups] .search-field-clear-btn').click();
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
          cy.get(`[data-cy=group-item-${groupId}]`).should('exist');
          cy.get(`[data-cy=group-${groupId}-name]`).should('have.text', group.name);
          cy.get(`[data-cy=group-${groupId}-description]`).should('have.text', group.description);
        });
      });

      describe('Group videos', () => {
        it('should add selected class to the video group item', () => {
          cy.get(`[data-cy=group-item-${groupId}]`).click();
          cy.location('pathname').should('eq', `/annotations/videos/groups/${groupId}`);
          cy.get(`[data-cy=group-item-${groupId}] > mat-card`).should('have.class', 'selected');
        });

        it('should display No videos for group ... (no videos)', () => {
          cy.get(`[data-cy=group-item-${groupId}]`).click();
          cy.get('.loading > span').should('have.text', `No videos for group ${group.name}`);
        });

        it('should display the videos list (one video)', () => {
          cy.addToGroup(localStorage.getItem('accessToken'), groupId, videoId);
          cy.get(`[data-cy=group-item-${groupId}]`).click();
          cy.location('pathname').should('eq', `/annotations/videos/groups/${groupId}`);
          cy.get('app-video-card-item').should('have.length', 1);
          cy.get(`[data-cy=video-${videoId}-item]`).should('exist');
        });

        describe('Search', () => {
          beforeEach(() => {
            cy.addToGroup(localStorage.getItem('accessToken'), groupId, videoId);
            cy.get(`[data-cy=group-item-${groupId}]`).click();
            cy.location('pathname').should('eq', `/annotations/videos/groups/${groupId}`);
          });

          it('should display a video', () => {
            cy.server().route('GET', `video-groups/${groupId}/videos*`).as('loadGroupVideos');
            cy.get(`[data-cy=video-${videoId}-item]`).should('exist');
            cy.get('app-video-card-item').should('have.length', 1);
            cy.wait('@loadGroupVideos');
            cy.get('[data-cy=search-group-videos] .search-field').type(Cypress.env('sampleName'));
            cy.get(`[data-cy=video-${videoId}-item]`).should('exist');
            cy.get('app-video-card-item').should('have.length', 1);
          });

          it('should not display any video', () => {
            cy.server().route('GET', `video-groups/${groupId}/videos*`).as('loadGroupVideos');
            cy.route('GET', `video-groups/${groupId}/videos?filter=name||cont||123*`).as('searchGroupVideos');
            cy.get(`[data-cy=video-${videoId}-item]`).should('exist');
            cy.get('app-video-card-item').should('have.length', 1);
            cy.wait('@loadGroupVideos');
            cy.get('[data-cy=search-group-videos] .search-field').type('123');
            cy.wait('@searchGroupVideos');
            cy.get(`[data-cy=video-${videoId}-item]`).should('not.exist');
            cy.get('app-video-card-item').should('have.length', 0);
          });

          it('should display a video (clear button click)', () => {
            cy.server().route('GET', `video-groups/${groupId}/videos*`).as('loadGroupVideos');
            cy.route('GET', `video-groups/${groupId}/videos?filter=name||cont||123*`).as('searchGroupVideos');
            cy.get(`[data-cy=video-${videoId}-item]`).should('exist');
            cy.get('app-video-card-item').should('have.length', 1);
            cy.wait('@loadGroupVideos');
            cy.get('[data-cy=search-group-videos] .search-field').type('123');
            cy.wait('@searchGroupVideos');
            cy.get(`[data-cy=video-${videoId}-item]`).should('not.exist');
            cy.get('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=search-group-videos] .search-field-clear-btn').click();
            cy.get(`[data-cy=video-${videoId}-item]`).should('exist');
            cy.get('app-video-card-item').should('have.length', 1);
          });
        });
      });

      describe('Group actions', () => {
        it('should delete the group', () => {
          cy.server().route('DELETE', `video-groups/${groupId}`).as('deleteGroup');
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 1);
          cy.get(`[data-cy=group-item-${groupId}]`).should('exist');
          cy.get(`[data-cy=group-${groupId}-menu-btn]`).click();
          cy.get(`[data-cy=delete-group-${groupId}-btn]`).click();
          cy.on('window:alert', str => {
            expect(str).to.equal(`Are you sure?`);
          });
          cy.wait('@deleteGroup');
          cy.get('.groups-list').find('app-video-group-item').should('have.length', 0);
          cy.get(`[data-cy=group-item-${groupId}]`).should('not.exist');
        });
      });
    });
  });

  describe('Edit', () => {
    let groupId;
    const group = {name: 'group', description: 'A test group.'};
    beforeEach(() => {
      cy
        .createGroup(localStorage.getItem('accessToken'), group)
        .its('body')
        .then(body => {
          groupId = body.id;
        });
    });

    describe('Access edit page', () => {
      it('should access edit page (manage button click)', () => {
        cy.get(`[data-cy=edit-group-${groupId}-btn]`).click();
        cy.location('pathname').should('eq', `/annotations/videos/groups/${groupId}/edit`);
      });

      it('should access edit page (double click)', () => {
        cy.get(`[data-cy=group-item-${groupId}]`).dblclick();
        cy.location('pathname').should('eq', `/annotations/videos/groups/${groupId}/edit`);
      });

      it('should access edit page (Add videos click)', () => {
        cy.get(`[data-cy=group-item-${groupId}]`).click();
        cy.get(`[data-cy=group-${groupId}-add-videos-btn]`).click();
        cy.location('pathname').should('eq', `/annotations/videos/groups/${groupId}/edit`);
      });
    });

    context('Edit page accessed', () => {
      beforeEach(() => {
        cy.get(`[data-cy=group-item-${groupId}]`).dblclick();
        cy.location('pathname').should('eq', `/annotations/videos/groups/${groupId}/edit`);
      });

      it('should set group name as title', () => {
        cy.get('[data-cy=toolbar-title]').should('have.text', group.name);
      });

      it('should show one video in the videos list and zero in the group list', () => {
        cy.get(`[data-cy=video-${videoId}-item]`).should('exist');
        cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 1);
        cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
      });

      describe('Select multiple', () => {
        it('should select and unselect a video (ctrl + click)', () => {
          cy.get('body').trigger('keydown', { which: 17, key: 'Control', keyCode: 17, ctrlKey: true });
          cy.get(`[data-cy=video-${videoId}-item] > mat-card`).should('not.have.class', 'selected');
          cy.get(`[data-cy=video-${videoId}-item]`).click();
          cy.get(`[data-cy=video-${videoId}-item] > mat-card`).should('have.class', 'selected');
        });

        it('should not select a video (ctrl + A)', () => {
          cy.get(`[data-cy=video-${videoId}-item] > mat-card`).should('not.have.class', 'selected');
          cy.get('body').trigger('keydown', { which: 65, key: 'a', keyCode: 65, ctrlKey: true });
          cy.get(`[data-cy=video-${videoId}-item] > mat-card`).should('not.have.class', 'selected');
        });

        it('should unselect a video (ctrl + A)', () => {
          cy.get('body').trigger('keydown', { which: 17, key: 'Control', keyCode: 17, ctrlKey: true });
          cy.get(`[data-cy=video-${videoId}-item] > mat-card`).should('not.have.class', 'selected');
          cy.get(`[data-cy=video-${videoId}-item]`).click();
          cy.get(`[data-cy=video-${videoId}-item] > mat-card`).should('have.class', 'selected');
          cy.get('body').trigger('keydown', { which: 65, key: 'a', keyCode: 65, ctrlKey: true });
          cy.get(`[data-cy=video-${videoId}-item] > mat-card`).should('not.have.class', 'selected');
        });

        it('should select a video (drag)', () => {
          // TODO
          // add selected class
        });
      });

      describe('Search videos', () => {
        context('One video in the list', () => {
          it('should display a video', () => {
            cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 1);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=search-videos] .search-field').type(Cypress.env('sampleName'));
            cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 1);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
          });

          it('should not display any videos', () => {
            cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 1);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=search-videos] .search-field').type(Cypress.env('sampleName') + '123');
            cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('not.exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
          });
        });

        context('No videos', () => {
          it('should not display any videos', () => {
            cy.addToGroup(localStorage.getItem('accessToken'), groupId, videoId);
            cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 1);
            cy.get('[data-cy=search-videos] .search-field').type(Cypress.env('sampleName'));
            cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('not.exist');
            cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 1);
          });
        });
      });

      describe('Search group videos', () => {
        context('One video in the list', () => {
          beforeEach(() => {
            cy.addToGroup(localStorage.getItem('accessToken'), groupId, videoId);
          });

          it('should display a video', () => {
            cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 1);
            cy.get('[data-cy=search-group-videos] .search-field').type(Cypress.env('sampleName'));
            cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 1);
          });

          it('should not display any videos', () => {
            cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 1);
            cy.get('[data-cy=search-group-videos] .search-field').type(Cypress.env('sampleName') + '123');
            cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('not.exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
          });
        });

        context('No videos', () => {
          it('should not display any videos', () => {
            cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 1);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
            cy.get('[data-cy=search-group-videos] .search-field').type(Cypress.env('sampleName'));
            cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('exist');
            cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 1);
            cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
          });
        });
      });

      describe('Add video to group', () => {
        it('should add a video to group (button click)', () => {
          cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 1);
          cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
          cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('exist');
          cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('not.exist');
          cy.server().route('POST', `video-groups/${groupId}/videos`).as('addVideoToGroup');
          cy.get(`[data-cy=add-video-${videoId}-to-group]`).click();
          cy.wait('@addVideoToGroup');
          cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('exist');
          cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('not.exist');
          cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
          cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 1);
        });

        it('should add a video to group (drag and drop)', () => {
          // cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 1);
          // cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
          // cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('exist');
          // cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('not.exist');
          // cy.server().route('POST', `video-groups/${groupId}/videos`).as('addVideoToGroup');
          // // TODO
          // // cy.get(`[data-cy=video-${videoId}-item]`)
          // //   .trigger('dragstart');
          // // cy.get(`[data-cy=group-videos]`)
          // //   .trigger('drop');
          // // FIXME
          // // cy.get(`[data-cy=video-${videoId}-item]`)
          // //   .trigger('mousedown', {which: 1})
          // //   .trigger('mousemove', { clientX : 0, clientY: 0})
          // //   .trigger('mouseup', {force: true});
          // cy.wait('@addVideoToGroup');
          // cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('exist');
          // cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('not.exist');
          // cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
          // cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 1);
        });
      });

      describe('Remove video from group', () => {
        beforeEach(() => {
          cy.addToGroup(localStorage.getItem('accessToken'), groupId, videoId);
        });

        it('should remove a video from the group (http request)', () => {
          cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
          cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 1);
          cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('not.exist');
          cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('exist');
          cy.removeFromGroup(localStorage.getItem('accessToken'), groupId, videoId)
            .then(_ => {
              cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('not.exist');
              cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('exist');
              cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 1);
              cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
            });
        });

        it('should remove a video from the group (button click)', () => {
          cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 0);
          cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 1);
          cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('not.exist');
          cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('exist');
          cy.server().route('DELETE', `video-groups/${groupId}/videos`).as('removeVideoFromGroup');
          cy.get(`[data-cy=remove-video-${videoId}-from-group]`).click();
          cy.wait('@removeVideoFromGroup');
          cy.get(`[data-cy=group-videos] [data-cy=video-${videoId}-item]`).should('not.exist');
          cy.get(`[data-cy=videos] [data-cy=video-${videoId}-item]`).should('exist');
          cy.get('[data-cy=videos]').find('app-video-card-item').should('have.length', 1);
          cy.get('[data-cy=group-videos]').find('app-video-card-item').should('have.length', 0);
        });

        it('should remove a video from the group (drag and drop)', () => {
          // TODO
        });
      });

      describe('Edit group', () => {
        beforeEach(() => {
          cy.get('[data-cy=edit-group-btn').click();
        });

        it('should open the form dialog with name and description', () => {
          cy.get('app-video-group-form').should('exist');
          cy.get('[data-cy=group-name-input]').should('have.value', group.name);
          cy.get('[data-cy=group-description-input]').should('have.value', group.description);
          cy.get('[data-cy=group-save-btn]').should('not.be.disabled');
        });

        it('should cancel the form (cancel click)', () => {
          cy.get('[data-cy=toolbar-title]').should('have.text', group.name);
          cy.get('app-video-group-form').should('exist');
          cy.get('[data-cy=group-cancel-btn]').click();
          cy.get('app-video-group-form').should('not.exist');
          cy.get('[data-cy=toolbar-title]').should('have.text', group.name);
        });

        it('should update the group name', () => {
          cy.get('[data-cy=toolbar-title]').should('have.text', group.name);
          const name = 'New name';
          cy.server().route('PATCH', `video-groups/${groupId}`).as('updateGroup');
          cy.get('[data-cy=group-name-input]').clear().type(`${name}{enter}`);
          cy.wait('@updateGroup').its('responseBody')
            .then(body => {
              expect(body.name).to.equal(name);
              cy.get('[data-cy=toolbar-title]').should('have.text', name);
            });
        });

        it('should update the group description', () => {
          cy.get('[data-cy=toolbar-title]').should('have.text', group.name);
          const description = 'New description';
          cy.server().route('PATCH', `video-groups/${groupId}`).as('updateGroup');
          cy.get('[data-cy=group-description-input]').clear().type(`${description}`);
          cy.get('[data-cy=group-save-btn]').click();
          cy.wait('@updateGroup').its('responseBody')
            .then(body => {
              expect(body.description).to.equal(description);
              cy.get('[data-cy=toolbar-title]').should('have.text', group.name);
              cy.get('[data-cy=edit-group-btn').click();
              cy.get('[data-cy=group-description-input]').should('have.value', description);
            });
        });
      });
    });
  });
});
