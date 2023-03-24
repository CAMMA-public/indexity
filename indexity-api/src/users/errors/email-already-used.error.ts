export class EmailAlreadyUsedError extends Error {
  constructor(email: string) {
    super(`Email ${email} already registered.`);
  }
}
