export class VideoNotFoundError extends Error {
  constructor(videoId: number | string) {
    super(`No video with id ${videoId} found.`);
  }
}
