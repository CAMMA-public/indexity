export interface User {
  id?: number;
  name: string;
  email: string;
  roles?: Array<string>;
}

export enum USER_ROLE {
  ADMIN = 'ADMIN',
  ANNOTATOR = 'ANNOTATOR',
  MODERATOR = 'MODERATOR',
}

export interface UserSignupDto {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}
