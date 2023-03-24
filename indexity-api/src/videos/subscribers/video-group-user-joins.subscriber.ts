import {
  Connection,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { VideoGroupsGateway } from '../gateways/video-groups.gateway';
import { VideoGroupsService } from '../services/video-groups.service';
import { VideoGroupUserJoinEntity } from '../entities/video-group-user-join.entity';

@Injectable()
export class VideoGroupUserJoinsSubscriber
  implements EntitySubscriberInterface<VideoGroupUserJoinEntity> {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly videoGroupsService: VideoGroupsService,
    private readonly videoGroupsGateway: VideoGroupsGateway,
    @Optional()
    private readonly logger: Logger = new Logger(
      'VideoGroupUserJoinsSubscriber',
    ),
  ) {
    this.connection.subscribers.push(this);
  }

  listenTo(): Function {
    return VideoGroupUserJoinEntity;
  }

  async afterInsert(
    event: InsertEvent<VideoGroupUserJoinEntity>,
  ): Promise<void> {
    const { userId, videoGroupId } = event.entity;
    const videoGroup = await this.videoGroupsService.getOne(videoGroupId, {
      manager: event.manager,
    });
    this.videoGroupsGateway.updated(videoGroup);
    this.logger.verbose(`User ${userId} added to group ${videoGroupId}.`);
  }

  async afterRemove(
    event: RemoveEvent<VideoGroupUserJoinEntity>,
  ): Promise<void> {
    const { userId, videoGroupId } = event.entityId;
    const videoGroup = await this.videoGroupsService.getOne(videoGroupId, {
      manager: event.manager,
    });
    this.videoGroupsGateway.updated(videoGroup);
    this.logger.verbose(`User ${userId} removed from group ${videoGroupId}.`);
  }
}
