import { VideoGroupJoinEntity } from '../entities/video-groups-join.entity';
import { Type } from '@nestjs/common';
import {
  GenericCreateService,
  GenericDeleteService,
  GenericReadService,
  GenericService,
} from '../../common/services';
import { applyMixins } from '../../common/helpers';

export class VideoGroupJoinsService extends GenericService<
  VideoGroupJoinEntity
> {
  protected get target(): Type<VideoGroupJoinEntity> {
    return VideoGroupJoinEntity;
  }
}
export interface VideoGroupJoinsService
  extends GenericCreateService<VideoGroupJoinEntity>,
    GenericReadService<VideoGroupJoinEntity>,
    GenericDeleteService<VideoGroupJoinEntity> {}

applyMixins(VideoGroupJoinsService, [
  GenericCreateService,
  GenericReadService,
  GenericDeleteService,
]);
