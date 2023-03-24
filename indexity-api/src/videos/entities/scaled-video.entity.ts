import { ChildEntity } from 'typeorm';
import { VideoEntity } from './video.entity';

@ChildEntity('false')
export class ScaledVideoEntity extends VideoEntity {
  children: never;
  childrenIds: never;
  thumbnailUrl: never;
}
