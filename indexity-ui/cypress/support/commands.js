// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email,
      password
    }
  })
  .then((resp) => {
    localStorage.setItem('accessToken', resp.body.accessToken);
  })
});

Cypress.Commands.add('logAdmin', _ => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email: Cypress.env('adminEmail'),
      password: Cypress.env('adminPassword')
    }
  })
  .then((resp) => {
    localStorage.setItem('accessToken', resp.body.accessToken);
  })
});

Cypress.Commands.add('resetGroups', bearer => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/admin/video-groups/reset`,
    auth: {
      bearer
    }
  });
});

Cypress.Commands.add('resetVideos', bearer => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/admin/videos/reset`,
    auth: {
      bearer
    }
  });
});

Cypress.Commands.add('resetUsers', bearer => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/admin/users/reset`,
    auth: {
      bearer
    }
  });
});

Cypress.Commands.add('resetAnnotations', bearer => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/admin/annotations/reset`,
    auth: {
      bearer
    }
  });
});

Cypress.Commands.add('createAnnotation', (bearer, annotation) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/annotations`,
    auth: {
      bearer
    },
    body: annotation
  });
});

Cypress.Commands.add('createGroup', (bearer, group) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/video-groups`,
    auth: {
      bearer
    },
    body: group
  });
});

Cypress.Commands.add('addToGroup', (bearer, groupId, videoId) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/video-groups/${groupId}/videos`,
    auth: {
      bearer
    },
    body: [videoId]
  });
});

Cypress.Commands.add('removeFromGroup', (bearer, groupId, videoId) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/video-groups/${groupId}/videos`,
    auth: {
      bearer
    },
    body: [videoId]
  });
});

Cypress.Commands.add('updateAnnotation', (bearer, annotation) => {
  cy.request({
    method: 'PATCH',
    url: `${Cypress.env('apiUrl')}/annotations/${annotation.id}`,
    auth: {
      bearer
    },
    body: annotation
  });
});

Cypress.Commands.add('persistSession', (key) => {
  const authTokens = localStorage.getItem(key);
  cy.setCookie(key, authTokens);
});

Cypress.Commands.add('restoreSession', (key) => {
  cy.getCookie(key).then(authTokens => {
    if (authTokens && authTokens.value) {
      localStorage.setItem(key, authTokens.value);
    } else {
      throw new Error()
    }
  });
});

function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, { type: contentType });
  blob.lastModifiedDate = new Date();
  return blob;
}

Cypress.Commands.add('uploadVideo', (fileName, selector) => {
  cy.get(selector).then(subject => {
    cy.fixture(fileName, 'base64').then((content) => {
      const el = subject[0];
      const blob = b64toBlob(content);
      const testFile = new File([blob], fileName, { type: 'video/mp4' });
      const dataTransfer = new DataTransfer();

      dataTransfer.items.add(testFile);
      el.files = dataTransfer.files;
    });
  });
});

Cypress.Commands.add('uploadSample', _ => {
  cy.server().route('POST', 'videos/upload').as('uploadVideo');
  cy.uploadVideo(Cypress.env('sampleName'), 'input[type=file]');
  cy.wait('@uploadVideo');
});

Cypress.Commands.add('removeLastVideo', _ => {
  cy.get('[data-cy=menu-btn]').click();
  cy.get('[data-cy=nav-videos-btn]').click();
  cy.get('.mat-tab-labels > div').first().click();
  cy.server().route('DELETE', 'videos/*').as('deleteVideo');
  cy.get('[data-cy=delete-video-btn]')
    .last()
    .click({force: true});
  cy.wait('@deleteVideo');
});

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
