export class FileTypeError extends Error {
  constructor(fileName: string) {
    super(`${fileName} is not a video.`);
  }
}
