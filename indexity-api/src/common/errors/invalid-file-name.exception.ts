export class InvalidFileNameException extends Error {
  constructor(fileName: string) {
    super(`File ${fileName} already exists.`);
  }
}
