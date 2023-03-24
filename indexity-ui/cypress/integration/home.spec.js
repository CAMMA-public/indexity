
import Chance from 'chance';
const chance = new Chance();

describe('Home', () => {
  const email = chance.email();
  const name = chance.name();
  const pass = 'password';

  beforeEach(() => {
    cy.visit('/');
  });

  it('should have Indexity as title', () => {
    cy.title().should('include', 'Indexity');
  });

  it('should show the login dialog', () => {
    cy.get('[data-cy=login-dialog-btn]').click();
    cy.get('app-login-form').should('exist');
  });

  it('blocks protected routes', () => {
    cy.visit('/videos', {
      failOnStatusCode: false
    });
    cy.location('pathname').should('not.include', 'annotations');
  });

  describe('Login', () => {
    beforeEach(() => {
      cy.get('[data-cy=login-dialog-btn]').click();
    });

    it('should enable the login button', () => {
      cy.get('app-login-form').should('exist');
      cy.get('[data-cy=login-btn]').should('be.disabled');
      cy.get('input[name=email]').type(email);
      cy.get('[data-cy=login-btn]').should('be.disabled');
      cy.get('input[name=password]').type(pass);
      cy.get('[data-cy=login-btn]').should('not.be.disabled');
    });

    it('should show an error (invalid email)', () => {
      cy.get('app-login-form').should('exist');
      cy.get('input[name=email]').type('invalid');
      cy.contains('Invalid email format');
      cy.get('[data-cy=login-btn]').should('be.disabled');
      cy.get('input[name=password]').type(pass);
      cy.get('[data-cy=login-btn]').should('be.disabled');
    });

    it('should add class error to inputs', () => {
      cy.get('app-login-form').should('exist');
      cy.get('input[name=email]').click();
      cy.get('input[name=email]').should('not.have.class', 'error');
      cy.get('input[name=password]').click();
      cy.get('input[name=email]').should('have.class', 'error');
      cy.get('input[name=password]').should('not.have.class', 'error');
      cy.get('input[name=email]').click();
      cy.get('input[name=password]').should('have.class', 'error');
    });

    it('should show an alert (incorrect credentials)', () => {
      cy.get('app-login-form').should('exist');
      cy.get('input[name=email]').type(email);
      cy.get('input[name=password]').type(pass);
      cy.get('[data-cy=login-btn]').click();
      cy.on('window:alert', (str) => {
        expect(str).to.equal('Email or password incorrect');
      });
    });

    it('should not validate the form on enter press (no email)', () => {
      cy.get('app-login-form').should('exist');
      cy.get('input[name=password]').type(`${pass}{enter}`);
      cy.get('app-login-form').should('exist');
    });

    it('should not validate the form on enter press (no password)', () => {
      cy.get('app-login-form').should('exist');
      cy.get('input[name=email]').type(`${email}{enter}`);
      cy.get('app-login-form').should('exist');
    });

    it('should validate the form on enter press and navigate to videos index', () => {
      cy.get('app-login-form').should('exist');
      cy.get('input[name=email]').type(Cypress.env('adminEmail'));
      cy.get('input[name=password]').type(`${Cypress.env('adminPassword')}{enter}`);
      cy.get('app-login-form').should('not.exist');
      cy.location('pathname').should('eq', '/annotations/videos');
    });
  });

  // describe('Sign up', () => {
  //   beforeEach(() => {
  //     cy.get('.additional-container').click();
  //   });
  //
  //   it('should show the signup page', () => {
  //     cy.contains('SIGNUP');
  //   });
  //
  //   it('should enable the submit button', () => {
  //     cy.get('[data-cy=signup-btn]').should('be.disabled');
  //     cy.get('input[name=name]').type(name);
  //     cy.get('[data-cy=signup-btn]').should('be.disabled');
  //     cy.get('input[name=email]').type(email);
  //     cy.get('[data-cy=signup-btn]').should('be.disabled');
  //     cy.get('input[name=password]').type(pass);
  //     cy.get('[data-cy=signup-btn]').should('be.disabled');
  //     cy.get('input[name=passwordConfirmation]').type(pass);
  //     cy.get('[data-cy=signup-btn]').should('not.be.disabled');
  //   });
  //
  //   it('should show an error (invalid email)', () => {
  //     cy.get('input[name=email]').type('invalid');
  //     cy.get('input[name=name]').type(name);
  //     cy.get('input[name=password]').type(pass);
  //     cy.get('input[name=passwordConfirmation]').type(pass);
  //     cy.contains('Invalid email format');
  //     cy.get('[data-cy=signup-btn]').should('be.disabled');
  //   });
  //
  //   it('should show an error (short password)', () => {
  //     const invalidPassword = 'invalid';
  //     cy.get('input[name=name]').type(name);
  //     cy.get('input[name=email]').type(email);
  //     cy.get('input[name=password]').type(invalidPassword);
  //     cy.get('input[name=passwordConfirmation]').type(invalidPassword);
  //     cy.contains('Password must contain at least 8 characters');
  //     cy.get('[data-cy=signup-btn]').should('be.disabled');
  //   });
  //
  //   it('should show an error (no matching passwords)', () => {
  //     const invalidPassword = 'invalid';
  //     cy.get('input[name=name]').type(name);
  //     cy.get('input[name=email]').type(email);
  //     cy.get('input[name=password]').type(pass);
  //     cy.get('input[name=passwordConfirmation]').type(invalidPassword);
  //     cy.contains('Passwords don\'t match');
  //     cy.get('[data-cy=signup-btn]').should('be.disabled');
  //   });
  //
  //   it('should go back to the login page', () => {
  //     cy.get('.additional-container').click();
  //     cy.contains('LOGIN');
  //   });
  //
  //   it('should register a new user and redirect to videos list', () => {
  //     cy.get('input[name=name]').type(name);
  //     cy.get('input[name=email]').type(email);
  //     cy.get('input[name=password]').type(pass);
  //     cy.get('input[name=passwordConfirmation]').type(pass);
  //     cy.get('[data-cy=signup-btn]').click();
  //     cy.location('pathname').should('include', 'videos');
  //   });
  //
  //   it('should not register the same user', () => {
  //     cy.get('input[name=name]').type(name);
  //     cy.get('input[name=email]').type(email);
  //     cy.get('input[name=password]').type(pass);
  //     cy.get('input[name=passwordConfirmation]').type(pass);
  //     cy.get('[data-cy=signup-btn]').click();
  //     cy.on('window:alert', (str) => {
  //       expect(str).to.equal(`Email ${email} already registered.`);
  //     });
  //     cy.location('pathname').should('not.include', 'annotations');
  //   });
  //
  //   it('should not register user with invalid email', () => {
  //     const invalidEmail = 'test@test';
  //     cy.get('input[name=name]').type(name);
  //     cy.get('input[name=email]').type(invalidEmail);
  //     cy.get('input[name=password]').type(pass);
  //     cy.get('input[name=passwordConfirmation]').type(pass);
  //     cy.get('[data-cy=signup-btn]').click();
  //     cy.on('window:alert', (str) => {
  //       expect(str).to.equal(`email must be an email`);
  //     });
  //     cy.location('pathname').should('not.include', 'annotations');
  //   });
  // });
});
