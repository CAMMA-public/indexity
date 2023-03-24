import { formatErrorMessage, isSignupError, SignupError } from './user.helpers';

describe('User helpers', () => {
  it('should format signup error', () => {
    const error: SignupError = {
      statusCode: 400,
      error: 'Bad Request',
      message: [
        {
          target: {
            name: 'Test',
            email: 'test@hotmail',
            password: 'zkTUYF92RuhMm',
          },
          value: 'test@hotmail',
          property: 'email',
          children: [],
          constraints: {
            isEmail: 'email must be an email',
            passwordTooShort: 'Password is too short',
            passwordsDontMatch: 'Passwords dont match',
          },
        },
        {
          target: {
            name: 'Test',
            email: 'test@hotmail',
            password: 'zkTUYF92RuhMm',
          },
          value: 'test@hotmail',
          property: 'email',
          children: [],
          constraints: {
            isEmail: 'email must be an email 2',
            passwordTooShort: 'Password is too short 2',
            passwordsDontMatch: 'Passwords dont match 2',
          },
        },
      ],
    };

    const formattedErrors = formatErrorMessage({ status: 400, error });

    const expected =
      'email must be an email\n' +
      'Password is too short\n' +
      'Passwords dont match\n' +
      'email must be an email 2\n' +
      'Password is too short 2\n' +
      'Passwords dont match 2';

    expect(formattedErrors).toEqual(expected);
  });

  it('should return error message', () => {
    const error = {
      statusCode: 401,
      message: 'Email or password incorrect',
    };
    const formattedError = formatErrorMessage({ status: 401, error });
    const expected = error.message;
    expect(formattedError).toEqual(expected);
  });

  it('should return error statusText', () => {
    const error = {
      statusCode: 401,
      statusText: 'Email or password incorrect',
      message: [],
    };
    const formattedError = formatErrorMessage({ status: 401, error });
    const expected = error.statusText;
    expect(formattedError).toEqual(expected);
  });

  it('should return API unreachable', () => {
    const response = {
      status: 0,
    };
    const formattedError = formatErrorMessage(response);
    const expected = 'API unreachable';
    expect(formattedError).toEqual(expected);
  });

  it('should return Unknown error', () => {
    const error = {};
    const formattedError = formatErrorMessage({ error });
    const expected = 'Unknown error';
    expect(formattedError).toEqual(expected);
  });

  describe('isSignupError', () => {
    it('should return true', () => {
      const error = {
        statusCode: 400,
        error: 'Bad Request',
        message: [
          {
            target: {
              name: 'Test',
              email: 'test@hotmail',
              password: 'zkTUYF92RuhMm',
            },
            value: 'test@hotmail',
            property: 'email',
            children: [],
            constraints: {
              isEmail: 'email must be an email',
            },
          },
        ],
      };
      expect(isSignupError(error)).toBeTruthy();
    });

    it('should return false', () => {
      const error = {
        statusCode: 401,
        message: 'Email or password incorrect',
      };
      expect(isSignupError(error)).toBeFalsy();
    });
  });
});
