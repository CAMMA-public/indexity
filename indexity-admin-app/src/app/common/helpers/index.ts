import { User, USER_ROLE } from '../models/user';
// remove regex special characters from a string
export const escapeRegExp = (val: string): string => {
  return val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const byEmailOrName = (q: string) => (user: User) =>
  user.email.toLowerCase().match(`${escapeRegExp(q).toLowerCase()}.*`) ||
  user.name.toLowerCase().match(`${escapeRegExp(q).toLowerCase()}.*`);

export const getAllOrFilteredUsers = (q?: string) => (users: User[]) =>
  q && q.length > 0 ? users.filter(byEmailOrName(q)) : users;

export const userIsAdmin = (u: User): boolean =>
  u.roles.includes(USER_ROLE.ADMIN);
export const userIsMod = (u: User): boolean =>
  u.roles.includes(USER_ROLE.MODERATOR);
export const userIsAnnotator = (u: User): boolean =>
  u.roles.includes(USER_ROLE.ANNOTATOR);
