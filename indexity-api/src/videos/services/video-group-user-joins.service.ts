import { Type } from '@nestjs/common';
import { GenericCRUDService } from '../../common/services';
import { VideoGroupUserJoinEntity } from '../entities/video-group-user-join.entity';

export class VideoGroupUserJoinsService extends GenericCRUDService<
  VideoGroupUserJoinEntity
> {
  protected get target(): Type<VideoGroupUserJoinEntity> {
    return VideoGroupUserJoinEntity;
  }
}
