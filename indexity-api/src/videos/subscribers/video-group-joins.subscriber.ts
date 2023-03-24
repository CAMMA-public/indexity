import {
  Connection,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { VideoGroupJoinEntity } from '../entities/video-groups-join.entity';
import { VideosGateway } from '../gateways/videos.gateway';
import { VideoGroupsGateway } from '../gateways/video-groups.gateway';
import { VideoGroupsService } from '../services/video-groups.service';
import { VideosService } from '../services/videos.service';

@Injectable()
export class VideoGroupJoinsSubscriber
  implements EntitySubscriberInterface<VideoGroupJoinEntity> {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly videoGroupsService: VideoGroupsService,
    private readonly videoGroupsGateway: VideoGroupsGateway,
    private readonly videosService: VideosService,
    private readonly videosGateway: VideosGateway,
    @Optional()
    private readonly logger: Logger = new Logger('VideoGroupJoinsSubscriber'),
  ) {
    this.connection.subscribers.push(this);
  }

  listenTo(): Function {
    return VideoGroupJoinEntity;
  }

  async afterInsert(event: InsertEvent<VideoGroupJoinEntity>): Promise<void> {
    const { videoId, groupId } = event.entity;
    const videoGroup = await this.videoGroupsService.getOne(groupId, {
      manager: event.manager,
    });
    const video = await this.videosService.getOne(videoId, {
      manager: event.manager,
    });
    this.videoGroupsGateway.updated(videoGroup);
    this.videosGateway.updated(video);
    this.logger.verbose(`Video ${videoId} added to group ${groupId}.`);
  }

  async afterRemove(event: RemoveEvent<VideoGroupJoinEntity>): Promise<void> {
    const { videoId, groupId } = event.entityId;
    const videoGroup = await this.videoGroupsService.getOne(groupId, {
      manager: event.manager,
    });
    const video = await this.videosService.getOne(videoId, {
      manager: event.manager,
    });
    this.videoGroupsGateway.updated(videoGroup);
    this.videosGateway.updated(video);
    this.logger.verbose(`Video ${videoId} removed from group ${groupId}.`);
  }
}
