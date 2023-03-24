import { ChildEntity } from 'typeorm';
import { VideoEntity } from './video.entity';

@ChildEntity('true')
export class OriginalVideoEntity extends VideoEntity {
  parent: never;
  parentId: never;
}
