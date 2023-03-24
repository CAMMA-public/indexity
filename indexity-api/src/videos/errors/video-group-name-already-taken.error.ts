import { ConflictException } from '@nestjs/common';

export class VideoGroupNameAlreadyTakenError extends ConflictException {
  constructor(name: string) {
    super(`VideoGroup name '${name}' already registered.`);
  }
}
