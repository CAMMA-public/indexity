// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

before(() => {
  if (Cypress.env('apiUrl').includes('stable') || Cypress.env('apiUrl').includes('dev')) {
    throw new Error(`The apiUrl contains dev or stable, please update the configuration file.`);
  }
});

Cypress.Cookies.defaults({
  whitelist: function(cookie){
    // Persist auth stuff
    if(cookie.name === 'accessToken'){
      return true;
    }

    return false;
  }
});
