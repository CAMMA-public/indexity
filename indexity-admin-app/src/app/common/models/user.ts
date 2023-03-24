export interface User {
  id?: number;
  name: string;
  email: string;
  roles?: Array<string>;
  isActivated?: boolean;
  createdAt: string;
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

export interface UserStats extends User {
  uploadedVideoIds: number[];
  annotatedVideoIds: number[];
  annotationsCount: number[];
  annotationIds: number[];
  groupIds: number[];
  ipAddress: string;
  createdAt: string;
}
